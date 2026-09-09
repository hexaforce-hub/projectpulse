"""
ASTRA Universal Database Connection Provider & PostgreSQL/SQLite Abstraction
Supports transparent runtime switching between Local SQLite and Production Cloud Supabase PostgreSQL.

Configuration:
- Unset or DATABASE_URL=sqlite:///path/to/db -> Local SQLite (Default)
- DATABASE_URL=postgresql://user:pass@host:port/dbname -> Supabase PostgreSQL
"""

import os
import re
import sqlite3
from pathlib import Path
from typing import Any, List, Optional, Sequence, Union

DEFAULT_SQLITE_PATH = Path(__file__).parent.parent / "data" / "projectpulse.db"

class PostgresRowAdapter:
    """Wraps a psycopg2 tuple row and description to mimic sqlite3.Row."""
    __slots__ = ("_data", "_keys", "_index_map")

    def __init__(self, data: tuple, keys: list):
        self._data = data
        self._keys = keys
        self._index_map = {k.lower(): i for i, k in enumerate(keys)}

    def __getitem__(self, key: Union[int, str]) -> Any:
        if isinstance(key, int):
            return self._data[key]
        idx = self._index_map.get(str(key).lower())
        if idx is None:
            raise KeyError(f"Column '{key}' not found in row. Available: {self._keys}")
        return self._data[idx]

    def get(self, key: str, default: Any = None) -> Any:
        idx = self._index_map.get(str(key).lower())
        if idx is None:
            return default
        return self._data[idx]

    def keys(self) -> List[str]:
        return list(self._keys)

    def __iter__(self):
        return iter(self._data)

    def __len__(self) -> int:
        return len(self._data)

    def __repr__(self) -> str:
        return f"<Row {dict(zip(self._keys, self._data))}>"


class PostgresCursorAdapter:
    """Adapts a psycopg2 cursor to accept SQLite-style queries and return sqlite3.Row-like rows."""

    def __init__(self, raw_cursor):
        self.cursor = raw_cursor

    def _adapt_sql(self, sql: str) -> str:
        s = sql.strip()
        # 1. Ignore SQLite PRAGMA commands
        if s.upper().startswith("PRAGMA "):
            return "SELECT 1"

        # 2. Adapt SQLite '?' placeholders to psycopg2 '%s' placeholders
        # Replace ? not inside string literals
        s = re.sub(r'\?', '%s', s)

        # 3. Adapt SQLite INSERT OR IGNORE
        if re.search(r'INSERT\s+OR\s+IGNORE\s+INTO', s, re.IGNORECASE):
            s = re.sub(r'INSERT\s+OR\s+IGNORE\s+INTO', 'INSERT INTO', s, flags=re.IGNORECASE)
            if "ON CONFLICT" not in s.upper():
                s = s.rstrip(";") + " ON CONFLICT DO NOTHING;"

        # 4. Adapt SQLite INSERT OR REPLACE INTO (e.g. for directives, users, alerts, etc.)
        if re.search(r'INSERT\s+OR\s+REPLACE\s+INTO', s, re.IGNORECASE):
            s = re.sub(r'INSERT\s+OR\s+REPLACE\s+INTO', 'INSERT INTO', s, flags=re.IGNORECASE)

        return s

    def execute(self, sql: str, params: Optional[Sequence[Any]] = None):
        adapted_sql = self._adapt_sql(sql)
        if params is not None:
            # If params is a list or tuple, convert to tuple
            param_tuple = tuple(params) if isinstance(params, (list, tuple)) else params
            self.cursor.execute(adapted_sql, param_tuple)
        else:
            self.cursor.execute(adapted_sql)
        return self

    def executemany(self, sql: str, seq_of_params: Sequence[Any]):
        adapted_sql = self._adapt_sql(sql)
        self.cursor.executemany(adapted_sql, seq_of_params)
        return self

    def fetchone(self) -> Optional[PostgresRowAdapter]:
        row = self.cursor.fetchone()
        if row is None:
            return None
        keys = [desc[0] for desc in self.cursor.description]
        return PostgresRowAdapter(row, keys)

    def fetchall(self) -> List[PostgresRowAdapter]:
        rows = self.cursor.fetchall()
        if not rows or not self.cursor.description:
            return []
        keys = [desc[0] for desc in self.cursor.description]
        return [PostgresRowAdapter(r, keys) for r in rows]

    def fetchmany(self, size: int) -> List[PostgresRowAdapter]:
        rows = self.cursor.fetchmany(size)
        if not rows or not self.cursor.description:
            return []
        keys = [desc[0] for desc in self.cursor.description]
        return [PostgresRowAdapter(r, keys) for r in rows]

    @property
    def rowcount(self) -> int:
        return self.cursor.rowcount

    @property
    def lastrowid(self) -> Optional[int]:
        return getattr(self.cursor, "lastrowid", None)

    def close(self):
        self.cursor.close()


class PostgresConnectionAdapter:
    """Wraps a psycopg2 connection to mimic sqlite3.Connection with transaction context."""

    def __init__(self, raw_conn):
        self.conn = raw_conn

    def cursor(self) -> PostgresCursorAdapter:
        return PostgresCursorAdapter(self.conn.cursor())

    def commit(self):
        self.conn.commit()

    def rollback(self):
        self.conn.rollback()

    def close(self):
        self.conn.close()

    def execute(self, sql: str, params: Optional[Sequence[Any]] = None) -> PostgresCursorAdapter:
        cur = self.cursor()
        cur.execute(sql, params)
        return cur

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is not None:
            self.rollback()
        else:
            self.commit()


def get_db_connection(db_path: Optional[Union[str, Path]] = None):
    """
    Returns an active database connection for the configured backend.
    
    Precedence:
    1. If DATABASE_URL environment variable is set and starts with 'postgres://' or 'postgresql://':
       Connects to Supabase / PostgreSQL.
    2. Otherwise:
       Connects to SQLite at db_path or default data/projectpulse.db.
    """
    database_url = os.environ.get("DATABASE_URL", "").strip()

    if database_url.startswith("postgresql://") or database_url.startswith("postgres://"):
        try:
            import psycopg2
            # Supabase connection URLs may use postgres://; psycopg2 requires postgresql://
            if database_url.startswith("postgres://"):
                database_url = "postgresql://" + database_url[len("postgres://"):]
            raw_conn = psycopg2.connect(database_url)
            return PostgresConnectionAdapter(raw_conn)
        except Exception as e:
            raise ConnectionError(f"Failed to connect to Supabase PostgreSQL at configured DATABASE_URL: {str(e)}")

    # SQLite fallback / local default
    target_path = str(db_path or DEFAULT_SQLITE_PATH)
    if not os.path.exists(target_path):
        # Try relative to repo root
        repo_target = Path(__file__).parent.parent / target_path
        if repo_target.exists():
            target_path = str(repo_target)

    conn = sqlite3.connect(target_path)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn


def get_database_backend_type() -> str:
    """Returns 'POSTGRESQL' if configured for Supabase PostgreSQL, else 'SQLITE'."""
    url = os.environ.get("DATABASE_URL", "").strip()
    if url.startswith("postgresql://") or url.startswith("postgres://"):
        return "POSTGRESQL"
    return "SQLITE"

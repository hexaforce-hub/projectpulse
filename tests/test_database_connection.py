"""
ASTRA Database Connection Provider & PostgreSQL Adapter Unit Tests
Verifies that database/connection.py provides consistent connection semantics and query translation.
"""

import os
import sys
import unittest
import sqlite3
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent.resolve()
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from database.connection import (
    get_db_connection,
    get_database_backend_type,
    PostgresCursorAdapter,
    PostgresRowAdapter
)

class TestDatabaseConnectionAdapter(unittest.TestCase):
    def test_default_backend_is_sqlite(self):
        backend = get_database_backend_type()
        self.assertEqual(backend, "SQLITE")

    def test_sqlite_connection(self):
        conn = get_db_connection()
        self.assertIsInstance(conn, sqlite3.Connection)
        cur = conn.cursor()
        cur.execute("SELECT count(*) as cnt FROM projects")
        row = cur.fetchone()
        self.assertEqual(row["cnt"], 10000)
        conn.close()

    def test_postgres_cursor_placeholder_adaptation(self):
        class MockRawCursor:
            def __init__(self):
                self.last_sql = None
                self.last_params = None
            def execute(self, sql, params=None):
                self.last_sql = sql
                self.last_params = params

        raw = MockRawCursor()
        adapter = PostgresCursorAdapter(raw)
        
        # Test ? replacement
        adapter.execute("SELECT * FROM projects WHERE project_id = ? AND status = ?", ("PRJ-001", "ON_TRACK"))
        self.assertEqual(raw.last_sql, "SELECT * FROM projects WHERE project_id = %s AND status = %s")
        self.assertEqual(raw.last_params, ("PRJ-001", "ON_TRACK"))

        # Test PRAGMA suppression
        adapter.execute("PRAGMA foreign_keys = ON;")
        self.assertEqual(raw.last_sql, "SELECT 1")

        # Test INSERT OR IGNORE translation
        adapter.execute("INSERT OR IGNORE INTO alerts (alert_id) VALUES (?)", ("ALT-01",))
        self.assertIn("ON CONFLICT DO NOTHING", raw.last_sql)

    def test_postgres_row_adapter_dict_and_index_access(self):
        data = ("PRJ-001", "Test Project", 1500.0)
        keys = ["project_id", "project_name", "cost"]
        row = PostgresRowAdapter(data, keys)

        # Index access
        self.assertEqual(row[0], "PRJ-001")
        self.assertEqual(row[1], "Test Project")
        self.assertEqual(row[2], 1500.0)

        # Key access
        self.assertEqual(row["project_id"], "PRJ-001")
        self.assertEqual(row["PROJECT_ID"], "PRJ-001") # Case-insensitive
        self.assertEqual(row["project_name"], "Test Project")
        self.assertEqual(row.get("cost"), 1500.0)
        self.assertEqual(row.get("nonexistent", "default"), "default")
        self.assertEqual(len(row), 3)
        self.assertEqual(row.keys(), keys)

if __name__ == "__main__":
    unittest.main()

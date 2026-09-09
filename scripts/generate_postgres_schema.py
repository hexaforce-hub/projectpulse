"""
ASTRA PostgreSQL Schema DDL Generator
Reads SQLite table definitions and generates complete PostgreSQL DDL schema with:
- Correct PostgreSQL data types
- Primary keys
- Foreign keys with referential actions
- Indexes matching existing SQLite indexes
"""

import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent.parent / "data" / "projectpulse.db"

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
tables = [r[0] for r in cursor.fetchall() if not r[0].startswith("sqlite_")]

# Desired creation order honoring foreign key dependencies:
# Parents first, children second
TABLE_ORDER = [
    "users",
    "agencies",
    "projects",
    "project_states",
    "project_snapshots",
    "project_milestones",
    "project_progress",
    "alerts",
    "data_quality_flags",
    "sites",
    "execution_plans",
    "work_packages",
    "tasks",
    "task_dependencies",
    "task_progress",
    "issues",
    "documents",
    "directives",
    "notifications",
    "project_assignments",
    "scenarios",
    "scenario_modifications",
    "scenario_results",
    "model_benchmarks",
    "audit_logs"
]

# Ensure all tables are present
for t in tables:
    if t not in TABLE_ORDER:
        TABLE_ORDER.append(t)

ddl_lines = [
    "-- ==========================================================================",
    "-- ASTRA — National Infrastructure Intelligence Platform",
    "-- PostgreSQL Production Schema (Supabase Aligned)",
    "-- Ministry of Statistics & Programme Implementation (MoSPI) • IPMD",
    "-- ==========================================================================",
    "",
    "CREATE SCHEMA IF NOT EXISTS public;",
    ""
]

type_map = {
    "INTEGER": "INTEGER",
    "INT": "INTEGER",
    "BIGINT": "BIGINT",
    "REAL": "DOUBLE PRECISION",
    "FLOAT": "DOUBLE PRECISION",
    "DOUBLE": "DOUBLE PRECISION",
    "TEXT": "TEXT",
    "VARCHAR": "TEXT",
    "DATETIME": "TIMESTAMP",
    "DATE": "DATE",
    "BOOLEAN": "BOOLEAN",
    "BLOB": "BYTEA"
}

for t in TABLE_ORDER:
    cursor.execute(f"PRAGMA table_info(\"{t}\")")
    cols = cursor.fetchall()
    
    cursor.execute(f"PRAGMA foreign_key_list(\"{t}\")")
    fks = cursor.fetchall()
    
    cursor.execute(f"PRAGMA index_list(\"{t}\")")
    indexes = cursor.fetchall()
    
    ddl_lines.append(f"-- -------------------------------------------------------------")
    ddl_lines.append(f"-- Table: {t}")
    ddl_lines.append(f"-- -------------------------------------------------------------")
    ddl_lines.append(f"CREATE TABLE IF NOT EXISTS public.{t} (")
    
    col_defs = []
    pk_cols = [c[1] for c in cols if c[5] > 0]
    
    for c in cols:
        col_name = c[1]
        col_raw_type = c[2].upper().strip()
        col_type = type_map.get(col_raw_type, "TEXT")
        not_null = " NOT NULL" if c[3] else ""
        dflt = f" DEFAULT {c[4]}" if c[4] is not None else ""
        
        # Check if autoincrement primary key
        if len(pk_cols) == 1 and col_name == pk_cols[0] and col_type in ("INTEGER", "BIGINT") and t in ["audit_logs", "project_states", "project_progress", "scenario_modifications"]:
            col_def = f"    {col_name} SERIAL PRIMARY KEY"
        elif len(pk_cols) == 1 and col_name == pk_cols[0]:
            col_def = f"    {col_name} {col_type}{not_null}{dflt} PRIMARY KEY"
        else:
            col_def = f"    {col_name} {col_type}{not_null}{dflt}"
        col_defs.append(col_def)
    
    # Composite primary keys
    if len(pk_cols) > 1:
        col_defs.append(f"    PRIMARY KEY ({', '.join(pk_cols)})")
        
    # Foreign keys
    for fk in fks:
        from_col = fk[3]
        to_table = fk[2]
        to_col = fk[4]
        on_delete = f" ON DELETE {fk[6]}" if fk[6] and fk[6] != "NO ACTION" else ""
        on_update = f" ON UPDATE {fk[5]}" if fk[5] and fk[5] != "NO ACTION" else ""
        col_defs.append(f"    FOREIGN KEY ({from_col}) REFERENCES public.{to_table}({to_col}){on_delete}{on_update}")
        
    ddl_lines.append(",\n".join(col_defs))
    ddl_lines.append(");")
    ddl_lines.append("")
    
    # Indexes
    for idx in indexes:
        idx_name = idx[1]
        is_unique = "UNIQUE " if idx[2] else ""
        if idx_name.startswith("sqlite_autoindex"):
            continue
        cursor.execute(f"PRAGMA index_info(\"{idx_name}\")")
        idx_cols = [c[2] for c in cursor.fetchall()]
        if idx_cols:
            ddl_lines.append(f"CREATE {is_unique}INDEX IF NOT EXISTS {idx_name} ON public.{t} ({', '.join(idx_cols)});")
    ddl_lines.append("")

conn.close()

sql_path = Path(__file__).parent.parent / "database" / "schema_postgres.sql"
with open(sql_path, "w", encoding="utf-8") as f:
    f.write("\n".join(ddl_lines))

print(f"PostgreSQL DDL written to {sql_path}")

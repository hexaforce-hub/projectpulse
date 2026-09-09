"""
ASTRA Complete SQLite Database Schema Inspector
Produces full inventory of all tables, columns, types, primary keys, foreign keys, and indexes.
"""

import sqlite3
import json
from pathlib import Path

DB_PATH = Path(__file__).parent.parent / "data" / "projectpulse.db"

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
tables = [r[0] for r in cursor.fetchall() if not r[0].startswith("sqlite_")]

inventory = {}

for t in tables:
    # Row count
    cursor.execute(f"SELECT COUNT(*) FROM \"{t}\"")
    cnt = cursor.fetchone()[0]

    # Columns
    cursor.execute(f"PRAGMA table_info(\"{t}\")")
    cols = []
    for r in cursor.fetchall():
        cols.append({
            "cid": r[0],
            "name": r[1],
            "type": r[2],
            "notnull": bool(r[3]),
            "default_value": r[4],
            "pk": bool(r[5])
        })

    # Foreign keys
    cursor.execute(f"PRAGMA foreign_key_list(\"{t}\")")
    fks = []
    for r in cursor.fetchall():
        fks.append({
            "id": r[0],
            "seq": r[1],
            "table": r[2],
            "from": r[3],
            "to": r[4],
            "on_update": r[5],
            "on_delete": r[6],
            "match": r[7]
        })

    # Indexes
    cursor.execute(f"PRAGMA index_list(\"{t}\")")
    indexes = []
    for r in cursor.fetchall():
        idx_name = r[1]
        unique = bool(r[2])
        # Get index columns
        cursor.execute(f"PRAGMA index_info(\"{idx_name}\")")
        idx_cols = [c[2] for c in cursor.fetchall()]
        indexes.append({
            "name": idx_name,
            "unique": unique,
            "columns": idx_cols
        })

    inventory[t] = {
        "row_count": cnt,
        "columns": cols,
        "foreign_keys": fks,
        "indexes": indexes
    }

conn.close()

out_file = Path(__file__).parent.parent / "scratch_schema_inventory.json"
with open(out_file, "w", encoding="utf-8") as f:
    json.dump(inventory, f, indent=2)

print(f"Schema inventory created for {len(tables)} tables.")
for t, d in inventory.items():
    pk_cols = [c["name"] for c in d["columns"] if c["pk"]]
    print(f"  - {t:30}: {d['row_count']:>8,} rows | {len(d['columns']):>2} cols | PK: {pk_cols} | FK: {len(d['foreign_keys'])} | Idx: {len(d['indexes'])}")


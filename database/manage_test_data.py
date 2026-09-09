"""
ASTRA / ProjectPulse — Complete Database Wipe & Lifecycle Test Data Manager
Allows resetting, wiping, and restoring the database for clean zero-state testing.
"""

import os
import sys
import shutil
import sqlite3
from pathlib import Path

WORKSPACE_ROOT = Path(__file__).parent.parent
DB_PATH = WORKSPACE_ROOT / "data" / "projectpulse.db"
BACKUP_PATH = WORKSPACE_ROOT / "data" / "projectpulse.db.bak"

def wipe_all_data():
    """
    Performs a complete zero-state database wipe.
    Clears all tables while preserving the full schema structure so new projects
    can be onboarded and tested cleanly.
    """
    if not DB_PATH.exists():
        print(f"[Error] Database not found at {DB_PATH}")
        return False

    # Ensure backup exists
    if not BACKUP_PATH.exists():
        shutil.copyfile(DB_PATH, BACKUP_PATH)
        print(f"[Backup Created] Saved original database to {BACKUP_PATH}")

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Disable foreign keys temporarily during truncate
    cursor.execute("PRAGMA foreign_keys = OFF")

    # Fetch all user tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
    tables = [row[0] for row in cursor.fetchall()]

    wiped_counts = {}
    for table in tables:
        try:
            cursor.execute(f"SELECT COUNT(*) FROM \"{table}\"")
            count = cursor.fetchone()[0]
            cursor.execute(f"DELETE FROM \"{table}\"")
            wiped_counts[table] = count
        except Exception as e:
            wiped_counts[table] = f"Error: {e}"

    # Re-enable foreign keys and commit
    cursor.execute("PRAGMA foreign_keys = ON")
    conn.commit()

    # Re-seed the 8 institutional users so auth, login and task assignments work cleanly
    now_str = "2026-03-09 10:00:00"
    users_data = [
        ("USR-MINISTER-01", "minister", "minister123", "Dr. Jitendra Singh", "Union Minister of State (IC)", "MoSPI", "National", "NATIONAL_LEADER", "NATIONAL", "ALL", "National Leadership", "ACTIVE", now_str),
        ("USR-OFFICIAL-01", "official", "official123", "Shri Anurag Jain, IAS", "Secretary to GoI", "DoRTH", "Ministry of Road Transport & Highways", "MINISTRY_OFFICIAL", "MINISTRY", "Ministry of Road Transport & Highways", "Ministry Secretary", "ACTIVE", now_str),
        ("USR-ANALYST-01", "analyst", "analyst123", "Shri Amitav Ghosh", "Senior Data Scientist", "IPMD Analytics Unit", "MoSPI / IPMD", "ANALYST", "PORTFOLIO", "ALL_ANALYTICS", "Senior Analyst", "ACTIVE", now_str),
        ("USR-PM-01", "pm", "pm123", "Shri R.K. Singla", "Chief General Manager & Project Director", "NHAI Corridor PIU", "Ministry of Road Transport & Highways", "PROJECT_MANAGER", "PROJECT", "ALL", "Project Manager", "ACTIVE", now_str),
        ("USR-ENGINEER-01", "engineer", "engineer123", "Er. Neha Verma", "Executive Resident Engineer", "NHAI Corridor PIU", "Ministry of Road Transport & Highways", "ENGINEER", "PROJECT", "ALL", "Site Engineer", "ACTIVE", now_str),
        ("USR-FO-01", "fo", "fo123", "Shri Sanjay Sharma", "Divisional Field Operations Officer", "NHAI Field Division", "Ministry of Road Transport & Highways", "FIELD_OFFICER", "PROJECT", "ALL", "Field Officer", "ACTIVE", now_str),
        ("USR-FIELD-01", "field", "field123", "Shri Rajesh Gurjar", "Senior Site Supervisor", "NH Field Unit", "Ministry of Road Transport & Highways", "FIELD_WORKER", "SITE", "ALL", "Field Operations", "ACTIVE", now_str),
        ("USR-ADMIN-01", "admin", "admin123", "Dr. Rajesh Kumar", "Joint Secretary & Mission Director", "MoSPI / IPMD", "MoSPI", "ADMIN", "SYSTEM", "ALL", "Central Admin", "ACTIVE", now_str),
        ("USR-OFFICER-01", "officer", "officer123", "Smt. Priya Sharma", "Director (Infrastructure Monitoring)", "MoSPI / IPMD", "MoSPI", "MONITORING_OFFICER", "NATIONAL", "ALL", "Monitoring Officer", "ACTIVE", now_str),
        ("USR-VIEWER-01", "viewer", "viewer123", "Shri Vikram Mehta", "Central Sector Observer", "NITI Aayog", "National", "VIEWER", "NATIONAL", "ALL", "Observer", "ACTIVE", now_str)
    ]
    cursor.executemany("""
        INSERT OR REPLACE INTO users (
            user_id, username, password, name, designation, division, ministry,
            role, scope_type, scope_value, badge, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, users_data)
    conn.commit()

    # VACUUM to reclaim space
    try:
        cursor.execute("VACUUM")
    except Exception:
        pass

    conn.close()

    print("============================================================")
    print("ASTRA DATABASE PURGE: ZERO-STATE TESTING READY")
    print("============================================================")
    for table, count in wiped_counts.items():
        print(f"  - {table}: {count} rows deleted (Schema preserved)")
    print("------------------------------------------------------------")
    print("Database is now in pure ZERO-STATE.")
    print("You can now test Project Onboarding, WBS Generation,")
    print("Task Creation, and Telemetry Logging from a completely clean slate!")
    print(f"To restore original dataset anytime: python database/manage_test_data.py --restore")
    print("============================================================")
    return True

def restore_backup():
    """Restores database from backup."""
    if not BACKUP_PATH.exists():
        print(f"[Error] Backup file not found at {BACKUP_PATH}")
        return False

    shutil.copyfile(BACKUP_PATH, DB_PATH)
    print(f"[Restored] Database successfully restored from {BACKUP_PATH}")
    return True

def get_demo_status():
    if not DB_PATH.exists():
        print("Database does not exist.")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
    tables = [row[0] for row in cursor.fetchall()]

    print("[ASTRA Database Table Row Counts]:")
    total_rows = 0
    for tbl in tables:
        try:
            cursor.execute(f"SELECT COUNT(*) FROM \"{tbl}\"")
            cnt = cursor.fetchone()[0]
            print(f"  {tbl}: {cnt}")
            total_rows += cnt
        except Exception as e:
            print(f"  {tbl}: {e}")
    print(f"Total rows across all tables: {total_rows}")
    conn.close()

if __name__ == "__main__":
    if len(sys.argv) > 1:
        cmd = sys.argv[1]
        if cmd in ("--wipe-all", "--clean", "--wipe"):
            wipe_all_data()
        elif cmd in ("--restore", "--restore-backup"):
            restore_backup()
        elif cmd in ("--status", "--check"):
            get_demo_status()
        else:
            print("Usage: python database/manage_test_data.py [--wipe-all | --restore | --status]")
    else:
        print("Usage: python database/manage_test_data.py [--wipe-all | --restore | --status]")

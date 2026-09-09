"""
ProjectPulse — Relational Database Ingestion Pipeline
Ministry of Statistics & Programme Implementation (MoSPI) / IPMD
Smart India Hackathon 2026 — Team HexaForce

Ingests clean CSV foundation into indexed SQLite database (data/projectpulse.db).
Performs relational schema creation, batch inserts, and automated alert population.
"""

import argparse
import csv
import os
import sqlite3
import sys
import time
from pathlib import Path

def ingest_data(db_path="data/projectpulse.db", schema_path="database/schema.sql", data_dir="data"):
    t_start = time.time()
    print("=" * 70)
    print("PROJECTPULSE — PHASE 3 DATABASE INGESTION PIPELINE")
    print(f"Target Database: {db_path} | Source Data: {data_dir}")
    print("=" * 70)
    
    db_file = Path(db_path)
    schema_file = Path(schema_path)
    d_path = Path(data_dir)
    proc_dir = d_path / "processed"
    
    # 1. Initialize schema
    print("\n>>> STEP 1 / 4: INITIALIZING DATABASE SCHEMA")
    if db_file.exists():
        print(f"[Ingestion] Existing database found. Removing {db_path} for clean rebuild...")
        try:
            db_file.unlink()
        except Exception as e:
            print(f"[Ingestion] Warning removing file: {e}")
            
    db_file.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("PRAGMA foreign_keys = ON;")
    cursor.execute("PRAGMA journal_mode = WAL;")
    cursor.execute("PRAGMA synchronous = NORMAL;")
    
    with open(schema_file, "r", encoding="utf-8") as f:
        schema_sql = f.read()
    cursor.executescript(schema_sql)
    conn.commit()
    print("[Ingestion] Schema and B-Tree indexes created successfully.")
    
    # 2. Ingest projects
    print("\n>>> STEP 2 / 4: INGESTING PROJECTS (projects_clean.csv)")
    projects_csv = proc_dir / "projects_clean.csv"
    if not projects_csv.exists():
        raise FileNotFoundError(f"Missing {projects_csv}. Run scripts/build_dataset.py first!")
        
    projects_records = []
    with open(projects_csv, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            projects_records.append((
                row["project_id"], row["project_name"], row["ministry"], row.get("department", ""),
                row["sector"], row.get("sub_sector", ""), row["state"], row["region"],
                row["implementing_agency"], row["project_type"], row["project_status"], row["project_stage"],
                float(row["original_cost_cr"]), float(row["revised_cost_cr"]), float(row["cost_overrun_cr"]),
                float(row["cost_growth_pct"]), float(row["cumulative_expenditure_cr"]),
                float(row["physical_progress_pct"]), float(row["financial_progress_pct"]),
                float(row["progress_decoupling_gap"]), row["start_date"], row["planned_completion_date"],
                row["revised_completion_date"], int(row["planned_duration_months"]), int(row["revised_duration_months"]),
                int(row["schedule_slippage_months"]), int(row["schedule_revisions_count"]),
                int(row["milestone_count"]), int(row["milestones_completed"]), int(row["milestones_delayed"]),
                int(row["milestones_at_risk"]), float(row["milestone_delay_rate"]), row["primary_bottleneck"],
                row.get("secondary_bottleneck", "NONE"), int(row["target_schedule_delay_months"]),
                float(row["target_cost_overrun_pct"]), row["target_risk_class"],
                float(row["overall_risk_score"]), row["data_source"], row["data_status"]
            ))
            
    insert_projects_sql = """
        INSERT INTO projects (
            project_id, project_name, ministry, department, sector, sub_sector, state, region,
            implementing_agency, project_type, project_status, project_stage,
            original_cost_cr, revised_cost_cr, cost_overrun_cr, cost_growth_pct,
            cumulative_expenditure_cr, physical_progress_pct, financial_progress_pct,
            progress_decoupling_gap, start_date, planned_completion_date, revised_completion_date,
            planned_duration_months, revised_duration_months, schedule_slippage_months,
            schedule_revisions_count, milestone_count, milestones_completed, milestones_delayed,
            milestones_at_risk, milestone_delay_rate, primary_bottleneck, secondary_bottleneck,
            target_schedule_delay_months, target_cost_overrun_pct, target_risk_class,
            overall_risk_score, data_source, data_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """
    cursor.executemany(insert_projects_sql, projects_records)
    conn.commit()
    print(f"[Ingestion] Successfully inserted {len(projects_records):,} projects.")
    
    # 3. Ingest milestones and progress
    print("\n>>> STEP 3 / 4: INGESTING CHILD ENTITIES (milestones & progress)")
    milestones_csv = proc_dir / "project_milestones.csv"
    milestone_records = []
    with open(milestones_csv, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            milestone_records.append((
                row["milestone_id"], row["project_id"], row["milestone_name"],
                int(row["sequence"]), row["planned_date"], row.get("actual_date", ""),
                row["status"], int(row.get("delay_days", 0)), row["dependency_type"]
            ))
            
    insert_milestones_sql = """
        INSERT INTO project_milestones (
            milestone_id, project_id, milestone_name, sequence, planned_date, actual_date, status, delay_days, dependency_type
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """
    cursor.executemany(insert_milestones_sql, milestone_records)
    conn.commit()
    print(f"[Ingestion] Successfully inserted {len(milestone_records):,} milestone records.")
    
    progress_csv = proc_dir / "project_progress.csv"
    progress_records = []
    if progress_csv.exists():
        with open(progress_csv, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                progress_records.append((
                    row["project_id"], row["reporting_date"], int(row["reporting_month"]),
                    float(row["physical_progress_pct"]), float(row["cumulative_expenditure_cr"])
                ))
        insert_progress_sql = """
            INSERT INTO project_progress (
                project_id, reporting_date, reporting_month, physical_progress_pct, cumulative_expenditure_cr
            ) VALUES (?, ?, ?, ?, ?)
        """
        cursor.executemany(insert_progress_sql, progress_records)
        conn.commit()
        print(f"[Ingestion] Successfully inserted {len(progress_records):,} time-series progress records.")
        
    # 4. Generate early warning alerts
    print("\n>>> STEP 4 / 4: SYNTHESIZING ACTIVE EARLY WARNING ALERTS")
    # Query high friction projects to populate early warning radar
    cursor.execute("""
        SELECT project_id, project_name, target_risk_class, overall_risk_score,
               progress_decoupling_gap, milestone_delay_rate, primary_bottleneck
        FROM projects
        WHERE target_risk_class IN ('CRITICAL', 'HIGH')
           OR progress_decoupling_gap > 18.0
           OR milestone_delay_rate > 0.25
        ORDER BY overall_risk_score DESC
    """)
    flagged = cursor.fetchall()
    
    alert_records = []
    for idx, row in enumerate(flagged, 1):
        pid, pname, r_class, r_score, gap, delay_rate, bottleneck = row
        
        if r_class == "CRITICAL":
            severity = "CRITICAL"
            status = "Escalated"
            risk_change = "+24 points"
            signal = f"Acute execution distress: {bottleneck.replace('_', ' ').title()} blocking critical milestones"
        elif gap > 20.0:
            severity = "HIGH"
            status = "Requires Review"
            risk_change = "+16 points"
            signal = f"Severe decoupling: Expenditure leads physical progress by {gap:.1f} percentage points"
        elif delay_rate > 0.30:
            severity = "HIGH"
            status = "Under Investigation"
            risk_change = "+12 points"
            signal = f"Multiple critical path delays ({delay_rate*100:.0f}% milestones slipped)"
        else:
            severity = "MODERATE"
            status = "Requires Review"
            risk_change = "+8 points"
            signal = f"Institutional friction reported in {bottleneck.replace('_', ' ').title()}"
            
        alert_id = f"ALT-{idx:05d}"
        detected_at = "2026-03-31"
        alert_records.append((alert_id, pid, pname, severity, signal, detected_at, risk_change, status))
        
    insert_alerts_sql = """
        INSERT INTO alerts (alert_id, project_id, project_name, severity, signal, detected_at, risk_change, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """
    cursor.executemany(insert_alerts_sql, alert_records)
    conn.commit()
    print(f"[Ingestion] Generated and stored {len(alert_records):,} active early warning alerts.")
    
    # Checkpoint and analyze
    cursor.execute("ANALYZE;")
    conn.commit()
    conn.close()
    
    db_size_mb = db_file.stat().st_size / (1024 * 1024)
    duration = time.time() - t_start
    print("=" * 70)
    print("INGESTION SUMMARY:")
    print(f"  - Database Location: {db_path} ({db_size_mb:.2f} MB)")
    print(f"  - Ingestion Time: {duration:.2f} seconds")
    print(f"  - Total Projects: {len(projects_records):,}")
    print(f"  - Total Milestones: {len(milestone_records):,}")
    print(f"  - Time-Series Snapshots: {len(progress_records):,}")
    print(f"  - Active Alerts: {len(alert_records):,}")
    print("=" * 70)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Ingest Phase 2 CSVs into SQLite database.")
    parser.add_argument("--db", type=str, default="data/projectpulse.db", help="Path to SQLite database")
    parser.add_argument("--schema", type=str, default="database/schema.sql", help="Path to SQL schema")
    parser.add_argument("--data-dir", type=str, default="data", help="Path to data directory")
    args = parser.parse_args()
    
    ingest_data(db_path=args.db, schema_path=args.schema, data_dir=args.data_dir)

"""
ASTRA — Report Intelligence & Monthly Snapshot Seeding Pipeline
Ministry of Statistics & Programme Implementation (MoSPI) • IPMD
Smart India Hackathon 2026 — Team HexaForce

Populates:
1. Canonical Agencies Master
2. Multi-State Project Associations
3. Historical Monthly Snapshots (April 2026, May 2026, June 2026, July 2026)
4. Data Quality Flags (DQ001 to DQ012)
5. Dual-Model Evaluation Benchmarks (CUF vs Enhanced & Statistical vs ML)
"""

import math
import random
import sqlite3
import sys
from datetime import datetime
from pathlib import Path

WORKSPACE_ROOT = Path(__file__).parent.parent.resolve()
if str(WORKSPACE_ROOT) not in sys.path:
    sys.path.insert(0, str(WORKSPACE_ROOT))

from src.analytics.data_quality_engine import DataQualityEngine
from src.ml.model_comparison import ModelComparisonEngine
DB_PATH = WORKSPACE_ROOT / "data" / "projectpulse.db"
SCHEMA_PATH = Path(__file__).parent / "schema_reports.sql"

AGENCIES_MASTER = [
    ("AGY-NHAI", "National Highways Authority of India (NHAI)", "Highways Wing", "Ministry of Road Transport & Highways", "STATUTORY_BODY"),
    ("AGY-DFCCIL", "Dedicated Freight Corridor Corporation of India (DFCCIL)", "Railway Infrastructure", "Ministry of Railways", "PSU"),
    ("AGY-AAI", "Airports Authority of India (AAI)", "Civil Aviation Infrastructure", "Ministry of Civil Aviation", "STATUTORY_BODY"),
    ("AGY-NTPC", "National Thermal Power Corporation (NTPC Limited)", "Power Generation Wing", "Ministry of Power", "PSU"),
    ("AGY-NHPC", "NHPC Hydro Power Corporation", "Renewable & Hydro Wing", "Ministry of Power", "PSU"),
    ("AGY-POWERGRID", "Power Grid Corporation of India Limited (POWERGRID)", "Transmission Grid Wing", "Ministry of Power", "PSU"),
    ("AGY-GAIL", "Gas Authority of India Limited (GAIL)", "Natural Gas Transmission", "Ministry of Petroleum & Natural Gas", "PSU"),
    ("AGY-IOCL", "Indian Oil Corporation Limited (IOCL Pipelines)", "Petroleum Infrastructure", "Ministry of Petroleum & Natural Gas", "PSU"),
    ("AGY-CIL", "Coal India Limited & Subsidiaries (CIL/SECL/WCL)", "Mining Infrastructure", "Ministry of Coal", "PSU"),
    ("AGY-NWDA", "National Water Development Agency (NWDA)", "Water Resources Division", "Ministry of Jal Shakti", "STATUTORY_BODY"),
    ("AGY-DMRC", "Metro Rail Infrastructure SPV (DMRC/MMRDA)", "Urban Transit SPV", "Ministry of Housing & Urban Affairs", "SPV"),
    ("AGY-MPA", "Major Ports Authority (JNPA/Deendayal Port)", "Maritime Logistics Wing", "Ministry of Ports, Shipping & Waterways", "STATUTORY_BODY"),
    ("AGY-BSNL", "Bharat Sanchar Nigam Limited (BSNL Optical Network)", "Telecom Infra", "Ministry of Communications", "PSU"),
    ("AGY-SAIL", "Steel Authority of India Limited (SAIL Capital Works)", "Heavy Infrastructure", "Ministry of Steel", "PSU"),
]

def map_hml_category(sector: str) -> str:
    s = sector.lower()
    if any(k in s for k in ["road", "rail", "aviation", "port", "transit", "shipping"]):
        return "Transport & Logistics"
    if any(k in s for k in ["power", "coal", "petroleum", "gas", "energy"]):
        return "Energy"
    if any(k in s for k in ["water", "jal", "irrigation"]):
        return "Water & Sanitation"
    if any(k in s for k in ["telecom", "communication", "network"]):
        return "Communication"
    return "Social & Commercial Infrastructure"

def seed_reports():
    print(f"Connecting to database: {DB_PATH}")
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    # 1. Execute Schema
    print("Applying schema_reports.sql...")
    with open(SCHEMA_PATH, "r", encoding="utf-8") as f:
        cursor.executescript(f.read())
    conn.commit()

    # 2. Add missing columns to projects table if needed
    cursor.execute("PRAGMA table_info(projects)")
    existing_cols = {row["name"] for row in cursor.fetchall()}

    columns_to_add = [
        ("project_code", "TEXT"),
        ("legacy_ocms_code", "TEXT"),
        ("pmgid", "TEXT"),
        ("hml_category", "TEXT"),
        ("source_system", "TEXT DEFAULT 'PAIMANA'"),
        ("source_snapshot", "TEXT DEFAULT '2026-07'"),
        ("source_document", "TEXT DEFAULT 'FlashReport_July_2026.pdf'"),
        ("is_multi_state", "INTEGER DEFAULT 0")
    ]

    for col_name, col_type in columns_to_add:
        if col_name not in existing_cols:
            print(f"Adding column '{col_name}' to projects table...")
            cursor.execute(f"ALTER TABLE projects ADD COLUMN {col_name} {col_type}")
    conn.commit()

    # 3. Seed Agencies
    print(f"Seeding {len(AGENCIES_MASTER)} canonical agencies...")
    for agy in AGENCIES_MASTER:
        cursor.execute("""
            INSERT OR REPLACE INTO agencies (agency_id, agency_name, parent_department, ministry, agency_type)
            VALUES (?, ?, ?, ?, ?)
        """, agy)
    conn.commit()

    # 4. Fetch all projects to enrich and seed snapshots
    cursor.execute("SELECT * FROM projects")
    projects = [dict(row) for row in cursor.fetchall()]
    print(f"Loaded {len(projects)} projects from database.")

    random.seed(42)

    # 5. Enrich projects with codes, HML categories, and multi-state flags
    print("Enriching projects with identifiers and HML categories...")
    multi_state_pairs = []
    
    # State neighbors for multi-state interstate corridors
    state_neighbors = {
        "Uttar Pradesh": ["Bihar", "Madhya Pradesh", "Haryana"],
        "Maharashtra": ["Gujarat", "Karnataka", "Madhya Pradesh"],
        "Gujarat": ["Rajasthan", "Maharashtra"],
        "Bihar": ["Jharkhand", "West Bengal", "Uttar Pradesh"],
        "Karnataka": ["Kerala", "Tamil Nadu", "Andhra Pradesh"],
        "Assam": ["Meghalaya", "Arunachal Pradesh", "Nagaland"],
        "West Bengal": ["Jharkhand", "Odisha", "Bihar"],
        "Tamil Nadu": ["Kerala", "Karnataka", "Andhra Pradesh"]
    }

    updates = []
    for i, p in enumerate(projects):
        pid = p["project_id"]
        sec = p["sector"]
        hml = map_hml_category(sec)
        
        # Consistent codes
        pcode = f"PRJ-GOI-{i+100001}"
        legacy_code = f"OCMS-{700000 + (i % 9999)}" if i % 4 != 0 else None
        pmgid = f"PMG-{i+100001}" if i % 5 != 0 else None
        
        # Multi-state designation for ~500 projects
        is_multi = 1 if (i < 500 or pid == "PRJ-SYN-000002" or "Expressway" in p["project_name"] or "Corridor" in p["project_name"]) else 0

        # Special flagship anchor assignment
        if pid == "PRJ-SYN-000002":
            pcode = "NHAI-VRK-PKG3"
            legacy_code = "OCMS-705728"
            pmgid = "PMG-IN-98231"
            is_multi = 1

        updates.append((pcode, legacy_code, pmgid, hml, is_multi, pid))

        # Track multi-state relations
        if is_multi:
            primary_st = p["state"]
            multi_state_pairs.append((pid, primary_st, 1, "PAIMANA_FLASH_REPORT"))
            neighbors = state_neighbors.get(primary_st, ["Madhya Pradesh", "Rajasthan"])
            for sec_st in neighbors[:2]:
                multi_state_pairs.append((pid, sec_st, 0, "INTERSTATE_ALIGNMENT"))
        else:
            multi_state_pairs.append((pid, p["state"], 1, "PAIMANA_FLASH_REPORT"))

    cursor.executemany("""
        UPDATE projects
        SET project_code = ?, legacy_ocms_code = ?, pmgid = ?, hml_category = ?, is_multi_state = ?
        WHERE project_id = ?
    """, updates)
    conn.commit()

    # Seed project_states
    print(f"Seeding {len(multi_state_pairs)} project-state associations...")
    cursor.execute("DELETE FROM project_states")
    cursor.executemany("""
        INSERT INTO project_states (project_id, state_name, is_primary, source)
        VALUES (?, ?, ?, ?)
    """, multi_state_pairs)
    conn.commit()

    # 6. Seed Project Snapshots across 4 months: 2026-04, 2026-05, 2026-06, 2026-07
    print("Generating monthly snapshots for April, May, June, July 2026...")
    cursor.execute("DELETE FROM project_snapshots")

    snapshots_to_insert = []
    dq_engine = DataQualityEngine(None)
    all_dq_flags = []

    months_meta = [
        ("2026-04", "FlashReport_April2026.pdf", "2026-04-30 18:00:00"),
        ("2026-05", "FlashReport_May2026.pdf", "2026-05-31 18:00:00"),
        ("2026-06", "FlashReport_June_2026.pdf", "2026-06-30 18:00:00"),
        ("2026-07", "FlashReport_July_2026.pdf", "2026-07-31 18:00:00")
    ]

    # Re-fetch enriched projects
    cursor.execute("SELECT * FROM projects")
    enriched_projects = [dict(row) for row in cursor.fetchall()]

    for month_idx, (s_month, report_doc, ingest_time) in enumerate(months_meta):
        print(f"  Generating snapshot {s_month} ({report_doc})...")
        for i, p in enumerate(enriched_projects):
            pid = p["project_id"]
            orig_cost = float(p["original_cost_cr"])
            classification = "MEGA" if orig_cost >= 1000.0 else "MAJOR"
            base_phys = float(p["physical_progress_pct"])
            base_exp = float(p["cumulative_expenditure_cr"])
            base_rev_cost = float(p["revised_cost_cr"])

            # Compute realistic historical back-projection from July (month_idx 3)
            # month_idx 0 = April, 1 = May, 2 = June, 3 = July
            months_back = 3 - month_idx
            
            # Determine status in this period
            # 1. Commissioned projects (completed in June or July)
            if i % 100 == 0:
                if month_idx == 3:
                    p_status = "COMMISSIONED"
                elif month_idx == 2:
                    p_status = "COMMISSIONED" if i % 200 == 0 else "ONGOING"
                else:
                    p_status = "ONGOING"
            # 2. Newly added projects (joined in May, June, or July)
            elif (i >= 9800 and i < 9850 and month_idx == 1):
                p_status = "NEWLY_ADDED"
            elif (i >= 9850 and i < 9900 and month_idx == 2):
                p_status = "NEWLY_ADDED"
            elif (i >= 9900 and month_idx == 3):
                p_status = "NEWLY_ADDED"
            else:
                p_status = "ONGOING"

            # Historical progression computation
            if pid == "PRJ-SYN-000002":
                # Special flagship anchor trajectory matching Flash Report narrative
                if month_idx == 0: # April
                    phys_prog = 59.86
                    exp = 1489.19
                    rev_cost = base_rev_cost
                    risk_score = 42.5
                    risk_class = "MODERATE"
                elif month_idx == 1: # May
                    phys_prog = 60.87
                    exp = 1540.46
                    rev_cost = base_rev_cost
                    risk_score = 48.0
                    risk_class = "MODERATE"
                elif month_idx == 2: # June (stagnant)
                    phys_prog = 60.87
                    exp = 1591.89
                    rev_cost = base_rev_cost * 1.04
                    risk_score = 72.0
                    risk_class = "HIGH"
                else: # July
                    phys_prog = 62.16
                    exp = 1643.47
                    rev_cost = base_rev_cost * 1.08
                    risk_score = 88.5
                    risk_class = "CRITICAL"
            elif i == 100: # Project 705728 equivalent
                if month_idx == 0: phys_prog, exp = 59.86, base_exp * 0.94
                elif month_idx == 1: phys_prog, exp = 60.87, base_exp * 0.96
                elif month_idx == 2: phys_prog, exp = 60.87, base_exp * 0.98
                else: phys_prog, exp = 62.16, base_exp
                rev_cost = base_rev_cost
                risk_score = float(p["overall_risk_score"])
                risk_class = p["target_risk_class"]
            else:
                # Standard realistic month-over-month trajectory
                step_prog = max(0.2, (i % 7) * 0.35)
                phys_prog = max(0.0, min(100.0, base_phys - (months_back * step_prog)))
                exp = max(0.0, base_exp * (1.0 - (months_back * 0.025)))
                rev_cost = base_rev_cost if months_back > 1 else (base_rev_cost * 1.01 if i % 10 == 0 else base_rev_cost)
                risk_score = float(p["overall_risk_score"])
                risk_class = p["target_risk_class"]

            fin_prog = round((exp / rev_cost * 100.0), 2) if rev_cost > 0 else 0.0
            snap_id = f"SNP-{s_month}-{pid}"

            snap_record = (
                snap_id, s_month, 2026, pid, p["project_name"],
                p.get("project_code"), p.get("legacy_ocms_code"), p.get("pmgid"),
                p["ministry"], p["sector"], p.get("hml_category", "Transport & Logistics"),
                p["state"], p["implementing_agency"], orig_cost, round(rev_cost, 2),
                round(exp, 2), round(phys_prog, 2), fin_prog, p["start_date"],
                p["planned_completion_date"], p["revised_completion_date"],
                p_status, classification, risk_score, risk_class,
                p["primary_bottleneck"], report_doc, ingest_time
            )
            snapshots_to_insert.append(snap_record)

            # Evaluate DQ flags on July snapshot (sample 1000 projects + special projects)
            if month_idx == 3 and (i < 1000 or pid == "PRJ-SYN-000002"):
                p_eval = dict(p)
                p_eval["physical_progress_pct"] = phys_prog
                p_eval["cumulative_expenditure_cr"] = exp
                p_eval["revised_cost_cr"] = rev_cost
                flags = dq_engine.evaluate_project(p_eval, snapshot_month=s_month)
                all_dq_flags.extend(flags)

    print(f"Inserting {len(snapshots_to_insert)} project snapshots...")
    cursor.executemany("""
        INSERT INTO project_snapshots (
            snapshot_id, snapshot_month, snapshot_year, project_id, project_name,
            project_code, legacy_ocms_code, pmgid, ministry, sector, hml_category,
            state, agency, original_cost_cr, revised_cost_cr, cumulative_expenditure_cr,
            physical_progress_pct, financial_progress_pct, start_date, planned_completion_date,
            revised_completion_date, project_status, project_classification,
            overall_risk_score, target_risk_class, primary_bottleneck, source_report, ingestion_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, snapshots_to_insert)
    conn.commit()

    # 7. Seed Data Quality Flags
    print(f"Seeding {len(all_dq_flags)} Data Quality Flags...")
    cursor.execute("DELETE FROM data_quality_flags")
    dq_records = [
        (f["flag_id"], f["project_id"], f["snapshot_month"], f["rule_code"],
         f["rule_name"], f["severity"], f["details"], f["status"], f["detected_at"])
        for f in all_dq_flags
    ]
    cursor.executemany("""
        INSERT INTO data_quality_flags (
            flag_id, project_id, snapshot_month, rule_code, rule_name,
            severity, details, status, detected_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, dq_records)
    conn.commit()

    # 8. Seed Model Benchmarks
    print("Computing and seeding dual-model evaluation benchmarks...")
    cursor.execute("DELETE FROM model_benchmarks")
    comparison_engine = ModelComparisonEngine()
    bm_data = comparison_engine.get_benchmarks()

    bm_records = [
        (
            b["benchmark_id"], b["model_name"], b["model_family"], b["feature_tier"],
            b["algorithm_type"], b["target_name"], b["roc_auc"], b["pr_auc"],
            b["precision_score"], b["recall_score"], b["f1_macro"], b["mae"],
            b["rmse"], b["r2_score"], b["lead_time_months"], b["evaluation_dataset"],
            b["evaluation_date"], b["status"]
        )
        for b in bm_data["benchmarks"]
    ]

    cursor.executemany("""
        INSERT INTO model_benchmarks (
            benchmark_id, model_name, model_family, feature_tier, algorithm_type,
            target_name, roc_auc, pr_auc, precision_score, recall_score,
            f1_macro, mae, rmse, r2_score, lead_time_months, evaluation_dataset,
            evaluation_date, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, bm_records)
    conn.commit()

    print("==========================================================")
    print("ASTRA Report Intelligence Seeding Completed Successfully!")
    print(f"  • Agencies: {len(AGENCIES_MASTER)}")
    print(f"  • Project States Mapped: {len(multi_state_pairs)}")
    print(f"  • Project Snapshots Created: {len(snapshots_to_insert)}")
    print(f"  • Data Quality Flags Active: {len(dq_records)}")
    print(f"  • Model Benchmarks Registered: {len(bm_records)}")
    print("==========================================================")

    conn.close()

if __name__ == "__main__":
    seed_reports()

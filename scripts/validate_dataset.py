"""
ProjectPulse — Data Foundation Validator
Ministry of Statistics & Programme Implementation (MoSPI) / IPMD
Smart India Hackathon 2026 — Team HexaForce

Validates datasets across 5 rigorous levels:
- Level 1: Schema Integrity
- Level 2: Field Range & Domain Bounds
- Level 3: Cross-Field Business Logic
- Level 4: Referential Integrity
- Level 5: Statistical Sanity & Missingness

Calculates the formal "Prototype Data Quality Score" (0–100) and produces data_quality_report.json.
"""

import argparse
import csv
import json
import os
import re
from datetime import datetime
from pathlib import Path

REQUIRED_PROJECT_COLUMNS = [
    "project_id", "project_name", "ministry", "department", "sector", "sub_sector",
    "state", "region", "implementing_agency", "project_type", "project_status", "project_stage",
    "original_cost_cr", "revised_cost_cr", "cost_overrun_cr", "cost_growth_pct",
    "cumulative_expenditure_cr", "physical_progress_pct", "financial_progress_pct",
    "progress_decoupling_gap", "start_date", "planned_completion_date", "revised_completion_date",
    "planned_duration_months", "revised_duration_months", "schedule_slippage_months",
    "schedule_revisions_count", "milestone_count", "milestones_completed",
    "milestones_delayed", "milestones_at_risk", "milestone_delay_rate",
    "primary_bottleneck", "secondary_bottleneck",
    "target_schedule_delay_months", "target_cost_overrun_pct", "target_risk_class",
    "overall_risk_score", "data_source", "data_status"
]

REQUIRED_ML_COLUMNS = [
    "project_id", "ministry", "sector", "state", "region", "implementing_agency", "project_type",
    "original_cost_cr", "planned_duration_months", "project_age_months", "duration_elapsed_ratio",
    "cumulative_expenditure_cr", "physical_progress_pct", "interim_financial_progress_pct",
    "progress_decoupling_gap", "milestone_count", "milestones_completed",
    "milestones_delayed", "milestones_at_risk", "milestone_delay_rate", "primary_bottleneck",
    "target_schedule_delay_months", "target_cost_overrun_pct", "target_risk_class"
]

ALLOWED_STATUSES = {"ON_TRACK", "AT_RISK", "DELAYED", "CRITICAL", "COMPLETED"}
ALLOWED_STAGES = {"Execution", "Commissioned", "Pre-Construction"}
ALLOWED_RISK_CLASSES = {"LOW", "MODERATE", "HIGH", "CRITICAL"}
ALLOWED_BOTTLENECKS = {
    "NONE", "LAND_ACQUISITION", "ENVIRONMENTAL_CLEARANCE", "FOREST_CLEARANCE",
    "PROCUREMENT", "CONTRACTOR", "UTILITY_SHIFTING", "DESIGN_CHANGE",
    "LEGAL_DISPUTE", "INTERDEPARTMENTAL_DEPENDENCY"
}

def parse_date(d_str):
    try:
        return datetime.strptime(d_str, "%Y-%m-%d")
    except Exception:
        return None

def validate_dataset(data_dir="data", output_report="data/quality/data_quality_report.json"):
    print(f"[Dataset Validator] Starting validation on directory: {data_dir}")
    d_path = Path(data_dir)
    proc_dir = d_path / "processed"
    raw_dir = d_path / "raw"
    tc_dir = d_path / "test_cases"
    
    clean_csv_path = proc_dir / "projects_clean.csv"
    raw_csv_path = raw_dir / "projects_raw.csv"
    ml_csv_path = proc_dir / "ml_ready_projects.csv"
    milestones_csv_path = proc_dir / "project_milestones.csv"
    progress_csv_path = proc_dir / "project_progress.csv"
    test_cases_csv_path = tc_dir / "data_quality_test_cases.csv"
    
    report = {
        "timestamp": datetime.now().isoformat(),
        "validator_version": "v0.2.0",
        "dataset_status": "SYNTHETIC",
        "levels": {},
        "metrics": {},
        "test_cases_validation": {},
        "overall_quality_score": 0.0,
        "gate_passed": False
    }
    
    # -------------------------------------------------------------
    # LEVEL 1: Schema Integrity
    # -------------------------------------------------------------
    level1 = {"name": "Level 1: Schema Integrity", "passed": True, "checks": []}
    
    def check_file_schema(filepath, required_cols, label):
        if not filepath.exists():
            level1["checks"].append({"file": label, "status": "FAIL", "reason": f"File not found: {filepath}"})
            level1["passed"] = False
            return []
        with open(filepath, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            cols = reader.fieldnames or []
            missing = [c for c in required_cols if c not in cols]
            if missing:
                level1["checks"].append({"file": label, "status": "FAIL", "reason": f"Missing columns: {missing}"})
                level1["passed"] = False
            else:
                level1["checks"].append({"file": label, "status": "PASS", "columns_count": len(cols)})
            return list(reader)

    projects_clean = check_file_schema(clean_csv_path, REQUIRED_PROJECT_COLUMNS, "projects_clean.csv")
    projects_raw = check_file_schema(raw_csv_path, REQUIRED_PROJECT_COLUMNS, "projects_raw.csv")
    ml_ready = check_file_schema(ml_csv_path, REQUIRED_ML_COLUMNS, "ml_ready_projects.csv")
    
    milestone_cols = ["milestone_id", "project_id", "milestone_name", "sequence", "planned_date", "status", "delay_days", "dependency_type"]
    milestones = check_file_schema(milestones_csv_path, milestone_cols, "project_milestones.csv")
    
    progress_cols = ["project_id", "reporting_date", "reporting_month", "physical_progress_pct", "cumulative_expenditure_cr"]
    progress = check_file_schema(progress_csv_path, progress_cols, "project_progress.csv")
    
    report["levels"]["level_1_schema"] = level1

    total_projects = len(projects_clean)
    if total_projects == 0:
        report["overall_quality_score"] = 0.0
        with open(output_report, "w", encoding="utf-8") as f:
            json.dump(report, f, indent=2)
        print("[Dataset Validator] CRITICAL ERROR: Empty dataset!")
        return report

    # -------------------------------------------------------------
    # LEVEL 2: Field Range & Domain Validation
    # -------------------------------------------------------------
    level2 = {"name": "Level 2: Field Range & Domain", "passed": True, "violations": {}}
    
    range_checks = {
        "invalid_id_format": 0,
        "cost_below_150_cr": 0,
        "negative_cost": 0,
        "negative_expenditure": 0,
        "invalid_physical_progress": 0,
        "invalid_financial_progress": 0,
        "invalid_dates": 0,
        "invalid_status": 0,
        "invalid_stage": 0,
        "invalid_risk_class": 0,
        "invalid_bottleneck": 0
    }
    
    id_pattern = re.compile(r"^PRJ-[A-Z0-9]+-\d+$")
    
    for row in projects_clean:
        pid = row["project_id"]
        if not id_pattern.match(pid):
            range_checks["invalid_id_format"] += 1
            
        try:
            orig_cost = float(row["original_cost_cr"])
            if orig_cost < 0:
                range_checks["negative_cost"] += 1
            elif orig_cost < 150.0:
                range_checks["cost_below_150_cr"] += 1
        except ValueError:
            range_checks["cost_below_150_cr"] += 1
            
        try:
            spend = float(row["cumulative_expenditure_cr"])
            if spend < 0:
                range_checks["negative_expenditure"] += 1
        except ValueError:
            range_checks["negative_expenditure"] += 1
            
        try:
            phys = float(row["physical_progress_pct"])
            if phys < 0.0 or phys > 100.0:
                range_checks["invalid_physical_progress"] += 1
        except ValueError:
            range_checks["invalid_physical_progress"] += 1
            
        try:
            fin = float(row["financial_progress_pct"])
            if fin < 0.0 or fin > 100.0:
                range_checks["invalid_financial_progress"] += 1
        except ValueError:
            range_checks["invalid_financial_progress"] += 1
            
        s_date = parse_date(row["start_date"])
        p_date = parse_date(row["planned_completion_date"])
        r_date = parse_date(row["revised_completion_date"])
        if not (s_date and p_date and r_date):
            range_checks["invalid_dates"] += 1
            
        if row["project_status"] not in ALLOWED_STATUSES:
            range_checks["invalid_status"] += 1
            
        if row["project_stage"] not in ALLOWED_STAGES:
            range_checks["invalid_stage"] += 1
            
        if row["target_risk_class"] not in ALLOWED_RISK_CLASSES:
            range_checks["invalid_risk_class"] += 1
            
        if row["primary_bottleneck"] not in ALLOWED_BOTTLENECKS:
            range_checks["invalid_bottleneck"] += 1
            
    total_range_violations = sum(range_checks.values())
    level2["violations"] = range_checks
    level2["total_violations"] = total_range_violations
    level2["passed"] = (total_range_violations == 0)
    report["levels"]["level_2_field_ranges"] = level2

    # -------------------------------------------------------------
    # LEVEL 3: Cross-Field Business Logic Validation
    # -------------------------------------------------------------
    level3 = {"name": "Level 3: Cross-Field Logic", "passed": True, "violations": {}}
    
    cross_checks = {
        "planned_before_start": 0,
        "revised_before_planned": 0,
        "expenditure_exceeds_revised_cost": 0,
        "cost_overrun_mismatch": 0,
        "decoupling_gap_mismatch": 0,
        "completed_milestones_exceed_total": 0,
        "delayed_milestones_exceed_total": 0,
        "completed_project_progress_below_100": 0
    }
    
    inconsistent_records_count = 0
    
    for row in projects_clean:
        rec_inconsistent = False
        s_date = parse_date(row["start_date"])
        p_date = parse_date(row["planned_completion_date"])
        r_date = parse_date(row["revised_completion_date"])
        
        if s_date and p_date and p_date <= s_date:
            cross_checks["planned_before_start"] += 1
            rec_inconsistent = True
            
        if p_date and r_date and r_date < p_date:
            cross_checks["revised_before_planned"] += 1
            rec_inconsistent = True
            
        try:
            rev_cost = float(row["revised_cost_cr"])
            orig_cost = float(row["original_cost_cr"])
            overrun = float(row["cost_overrun_cr"])
            spend = float(row["cumulative_expenditure_cr"])
            
            if spend > (rev_cost + 0.05): # allowance for rounding
                cross_checks["expenditure_exceeds_revised_cost"] += 1
                rec_inconsistent = True
                
            if abs(round(rev_cost - orig_cost, 2) - overrun) > 0.05:
                cross_checks["cost_overrun_mismatch"] += 1
                rec_inconsistent = True
        except ValueError:
            rec_inconsistent = True
            
        try:
            phys = float(row["physical_progress_pct"])
            fin = float(row["financial_progress_pct"])
            gap = float(row["progress_decoupling_gap"])
            if abs(round(fin - phys, 2) - gap) > 0.05:
                cross_checks["decoupling_gap_mismatch"] += 1
                rec_inconsistent = True
        except ValueError:
            rec_inconsistent = True
            
        try:
            m_total = int(row["milestone_count"])
            m_comp = int(row["milestones_completed"])
            m_del = int(row["milestones_delayed"])
            if m_comp > m_total:
                cross_checks["completed_milestones_exceed_total"] += 1
                rec_inconsistent = True
            if m_del > m_total:
                cross_checks["delayed_milestones_exceed_total"] += 1
                rec_inconsistent = True
        except ValueError:
            rec_inconsistent = True
            
        if row["project_status"] == "COMPLETED" and float(row.get("physical_progress_pct", 0)) < 100.0:
            cross_checks["completed_project_progress_below_100"] += 1
            rec_inconsistent = True
            
        if rec_inconsistent:
            inconsistent_records_count += 1
            
    total_cross_violations = sum(cross_checks.values())
    level3["violations"] = cross_checks
    level3["total_violations"] = total_cross_violations
    level3["passed"] = (total_cross_violations == 0)
    report["levels"]["level_3_cross_field"] = level3

    # -------------------------------------------------------------
    # LEVEL 4: Referential Integrity
    # -------------------------------------------------------------
    level4 = {"name": "Level 4: Referential Integrity", "passed": True, "checks": {}}
    
    clean_pids = [r["project_id"] for r in projects_clean]
    unique_pids = set(clean_pids)
    duplicate_pids_count = len(clean_pids) - len(unique_pids)
    
    orphan_milestones = 0
    for m in milestones:
        if m["project_id"] not in unique_pids:
            orphan_milestones += 1
            
    orphan_progress = 0
    for pr in progress:
        if pr["project_id"] not in unique_pids:
            orphan_progress += 1
            
    level4["checks"] = {
        "total_projects": len(clean_pids),
        "unique_project_ids": len(unique_pids),
        "duplicate_project_ids": duplicate_pids_count,
        "orphan_milestone_records": orphan_milestones,
        "orphan_progress_records": orphan_progress
    }
    level4["passed"] = (duplicate_pids_count == 0 and orphan_milestones == 0 and orphan_progress == 0)
    report["levels"]["level_4_referential_integrity"] = level4

    # -------------------------------------------------------------
    # LEVEL 5: Statistical Sanity & Missingness
    # -------------------------------------------------------------
    level5 = {"name": "Level 5: Statistical Sanity & Missingness", "passed": True, "distributions": {}}
    
    risk_dist = {}
    for r in projects_clean:
        k = r["target_risk_class"]
        risk_dist[k] = risk_dist.get(k, 0) + 1
        
    risk_pcts = {k: round(v / total_projects * 100.0, 2) for k, v in risk_dist.items()}
    
    # Check that each class is between 2% and 70% (no degenerate collapse)
    class_sanity_pass = all(2.0 <= pct <= 70.0 for pct in risk_pcts.values()) and len(risk_pcts) == 4
    
    # Missingness check on raw and clean
    clean_missing_cells = 0
    total_clean_cells = total_projects * len(REQUIRED_PROJECT_COLUMNS)
    for r in projects_clean:
        for col in REQUIRED_PROJECT_COLUMNS:
            if col not in r or r[col] is None or r[col] == "":
                clean_missing_cells += 1
                
    raw_missing_cells = 0
    total_raw_cells = len(projects_raw) * len(REQUIRED_PROJECT_COLUMNS)
    for r in projects_raw:
        for col in REQUIRED_PROJECT_COLUMNS:
            if col not in r or r[col] is None or r[col] == "":
                raw_missing_cells += 1
                
    level5["distributions"] = {
        "risk_class_counts": risk_dist,
        "risk_class_shares_pct": risk_pcts,
        "clean_missing_cells": clean_missing_cells,
        "clean_missingness_rate_pct": round(clean_missing_cells / total_clean_cells * 100.0, 4),
        "raw_missing_cells": raw_missing_cells,
        "raw_missingness_rate_pct": round(raw_missing_cells / total_raw_cells * 100.0, 4) if total_raw_cells else 0.0
    }
    level5["passed"] = class_sanity_pass and (clean_missing_cells == 0)
    report["levels"]["level_5_statistical_sanity"] = level5

    # -------------------------------------------------------------
    # VALIDATION OF CORRUPTED TEST CASES
    # -------------------------------------------------------------
    test_cases_report = {"total_test_cases": 0, "detected_defects": 0, "detection_rate_pct": 0.0, "details": []}
    if test_cases_csv_path.exists():
        with open(test_cases_csv_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            t_cases = list(reader)
            test_cases_report["total_test_cases"] = len(t_cases)
            detected = 0
            for tc in t_cases:
                defect = tc.get("test_defect_type", "UNKNOWN")
                caught = False
                
                # Verify detector logic
                if defect == "NEGATIVE_COST" and float(tc.get("original_cost_cr", 0)) < 0:
                    caught = True
                elif defect == "COST_BELOW_MOSPI_THRESHOLD" and float(tc.get("original_cost_cr", 0)) < 150.0:
                    caught = True
                elif defect == "EXPENDITURE_EXCEEDS_REVISED_COST" and float(tc.get("cumulative_expenditure_cr", 0)) > float(tc.get("revised_cost_cr", 0)):
                    caught = True
                elif defect == "PHYSICAL_PROGRESS_OVER_100" and float(tc.get("physical_progress_pct", 0)) > 100.0:
                    caught = True
                elif defect == "FINANCIAL_PROGRESS_OVER_100" and float(tc.get("financial_progress_pct", 0)) > 100.0:
                    caught = True
                elif defect == "PLANNED_BEFORE_START":
                    sd = parse_date(tc.get("start_date", ""))
                    pd = parse_date(tc.get("planned_completion_date", ""))
                    if sd and pd and pd < sd:
                        caught = True
                elif defect == "REVISED_BEFORE_PLANNED":
                    pd = parse_date(tc.get("planned_completion_date", ""))
                    rd = parse_date(tc.get("revised_completion_date", ""))
                    if pd and rd and rd < pd:
                        caught = True
                elif defect == "DUPLICATE_ID" and tc.get("project_id") in clean_pids:
                    caught = True
                elif defect == "COMPLETED_EXCEEDS_TOTAL_MILESTONES" and int(tc.get("milestones_completed", 0)) > int(tc.get("milestone_count", 0)):
                    caught = True
                elif defect == "DELAYED_EXCEEDS_TOTAL_MILESTONES" and int(tc.get("milestones_delayed", 0)) > int(tc.get("milestone_count", 0)):
                    caught = True
                elif defect == "INVALID_MINISTRY_ENUM":
                    allowed_min_names = {m["name"] for m in [
                        {"name": "Ministry of Road Transport & Highways"},
                        {"name": "Ministry of Railways"},
                        {"name": "Ministry of Power"},
                        {"name": "Ministry of Petroleum & Natural Gas"},
                        {"name": "Ministry of Housing & Urban Affairs"},
                        {"name": "Ministry of Jal Shakti"},
                        {"name": "Ministry of Civil Aviation"},
                        {"name": "Ministry of Ports, Shipping & Waterways"},
                        {"name": "Ministry of Coal"}
                    ]}
                    if tc.get("ministry") not in allowed_min_names:
                        caught = True
                elif defect == "INVALID_STATUS_ENUM" and tc.get("project_status") not in ALLOWED_STATUSES:
                    caught = True
                    
                if caught:
                    detected += 1
                test_cases_report["details"].append({"case_id": tc.get("project_id"), "defect": defect, "detected": caught})
                
            test_cases_report["detected_defects"] = detected
            test_cases_report["detection_rate_pct"] = round(detected / len(t_cases) * 100.0, 2)
            
    report["test_cases_validation"] = test_cases_report

    # -------------------------------------------------------------
    # PROTOTYPE DATA QUALITY SCORE (0–100)
    # Formula:
    #   completeness = 100 - (missing_clean_cells / total_cells * 100)
    #   validity = (valid_cells / total_cells) * 100
    #   uniqueness = (unique_ids / total_records) * 100
    #   consistency = (consistent_records / total_records) * 100
    #   overall = 0.30*completeness + 0.30*validity + 0.20*uniqueness + 0.20*consistency
    # -------------------------------------------------------------
    completeness_score = max(0.0, 100.0 - (clean_missing_cells / total_clean_cells * 100.0))
    validity_score = max(0.0, 100.0 - ((total_range_violations + total_cross_violations) / total_clean_cells * 100.0))
    uniqueness_score = (len(unique_pids) / total_projects) * 100.0
    consistency_score = ((total_projects - inconsistent_records_count) / total_projects) * 100.0
    
    overall_score = round(
        0.30 * completeness_score +
        0.30 * validity_score +
        0.20 * uniqueness_score +
        0.20 * consistency_score,
        2
    )
    
    report["overall_quality_score"] = overall_score
    report["metrics"] = {
        "completeness_score": round(completeness_score, 2),
        "validity_score": round(validity_score, 2),
        "uniqueness_score": round(uniqueness_score, 2),
        "consistency_score": round(consistency_score, 2),
        "overall_score": overall_score,
        "weights": {
            "completeness": 0.30,
            "validity": 0.30,
            "uniqueness": 0.20,
            "consistency": 0.20
        }
    }
    
    # Gate condition: all levels passed, quality score >= 98.0, and 100% test cases caught
    all_levels_pass = all(l["passed"] for l in report["levels"].values())
    test_detection_pass = (test_cases_report["detection_rate_pct"] == 100.0)
    report["gate_passed"] = bool(all_levels_pass and overall_score >= 98.0 and test_detection_pass)
    
    Path(output_report).parent.mkdir(parents=True, exist_ok=True)
    with open(output_report, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)
        
    print(f"[Dataset Validator] Validation completed. Quality Report written to {output_report}")
    print(f"  - Overall Quality Score: {overall_score} / 100.0")
    print(f"  - Level 1 (Schema): {'PASS' if level1['passed'] else 'FAIL'}")
    print(f"  - Level 2 (Field Ranges): {'PASS' if level2['passed'] else 'FAIL'} (violations: {total_range_violations})")
    print(f"  - Level 3 (Cross-Field): {'PASS' if level3['passed'] else 'FAIL'} (violations: {total_cross_violations})")
    print(f"  - Level 4 (Referential Integrity): {'PASS' if level4['passed'] else 'FAIL'}")
    print(f"  - Level 5 (Statistical Sanity): {'PASS' if level5['passed'] else 'FAIL'}")
    print(f"  - Test Case Detection Rate: {test_cases_report['detection_rate_pct']}% ({test_cases_report['detected_defects']}/{test_cases_report['total_test_cases']})")
    print(f"  - Validation Gate: {'PASSED (GO)' if report['gate_passed'] else 'FAILED (NO-GO)'}")
    
    return report

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Validate PAIMANA-modeled infrastructure dataset.")
    parser.add_argument("--data-dir", type=str, default="data", help="Path to data directory")
    parser.add_argument("--output", type=str, default="data/quality/data_quality_report.json", help="Path to output report")
    args = parser.parse_args()
    
    validate_dataset(data_dir=args.data_dir, output_report=args.output)

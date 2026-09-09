"""
ASTRA Final Release Gate Verification: Sections 13, 14, 16, 18
Executes:
1. Section 13: 10 Projects Data Consistency (Database vs API vs Reports)
2. Section 14: ML Output Sanity across LOW, MODERATE, HIGH, CRITICAL projects
3. Section 16: What-If Counterfactual Immutability (verifying simulation leaves project unchanged)
4. Section 18: Manual SQL Aggregation vs Report Intelligence API calculation
"""

import sys
import json
import sqlite3
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent.resolve()
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from fastapi.testclient import TestClient
from backend.app import app
from database.db_client import DatabaseClient
from ml.explainer import ProjectPulseExplainer
from src.ml.prediction import PredictionEngine

client = TestClient(app)
db = DatabaseClient()
engine = PredictionEngine()
explainer = ProjectPulseExplainer()
DB_PATH = PROJECT_ROOT / "data" / "projectpulse.db"

results = {
    "section_13_consistency": {"passed": True, "projects_tested": []},
    "section_14_ml_sanity": {"passed": True, "tiers_tested": {}},
    "section_16_what_if_immutability": {"passed": True, "details": None},
    "section_18_report_vs_db": {"passed": True, "comparison": {}}
}

print("================================================================================")
print("ASTRA FINAL RELEASE GATE: LIVE VERIFICATION SUITE")
print("================================================================================")

# -----------------------------------------------------------------------------
# 1. SECTION 13: 10 PROJECTS DATA CONSISTENCY CHECK
# -----------------------------------------------------------------------------
print("\n--- 1. SECTION 13: 10 PROJECTS DATA CONSISTENCY CHECK ---")
sample_project_ids = [
    "PRJ-SYN-000001", "PRJ-SYN-000002", "PRJ-SYN-000010", "PRJ-SYN-000100", "PRJ-SYN-000500",
    "PRJ-SYN-001000", "PRJ-SYN-002000", "PRJ-SYN-005000", "PRJ-SYN-008000", "PRJ-SYN-009999"
]

conn = sqlite3.connect(DB_PATH)
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

for pid in sample_project_ids:
    cursor.execute("SELECT * FROM projects WHERE project_id = ?", (pid,))
    db_row = dict(cursor.fetchone())
    
    # API response
    res = client.get(f"/api/projects/{pid}")
    assert res.status_code == 200, f"API failed for {pid}"
    api_data = res.json()
    
    # Verify core fields
    checks = [
        ("project_id", db_row["project_id"], api_data["project_id"]),
        ("project_name", db_row["project_name"], api_data["project_name"]),
        ("ministry", db_row["ministry"], api_data["ministry"]),
        ("sector", db_row["sector"], api_data["sector"]),
        ("state", db_row["state"], api_data["state"]),
        ("agency", db_row["implementing_agency"], api_data["implementing_agency"]),
        ("original_cost_cr", db_row["original_cost_cr"], api_data["financials"]["original_cost_cr"]),
        ("revised_cost_cr", db_row["revised_cost_cr"], api_data["financials"]["revised_cost_cr"]),
        ("cumulative_expenditure_cr", db_row["cumulative_expenditure_cr"], api_data["financials"]["cumulative_expenditure_cr"]),
        ("physical_progress_pct", db_row["physical_progress_pct"], api_data["progress"]["physical_progress_pct"]),
        ("risk_level", db_row["target_risk_class"], api_data["risk"]["level"]),
        ("risk_score", db_row["overall_risk_score"], api_data["risk"]["overall_score"])
    ]
    
    for field_name, db_val, api_val in checks:
        assert db_val == api_val, f"Mismatch in {pid} for {field_name}: DB={db_val} vs API={api_val}"
    
    results["section_13_consistency"]["projects_tested"].append({
        "project_id": pid,
        "name": db_row["project_name"],
        "cost_cr": db_row["revised_cost_cr"],
        "progress_pct": db_row["physical_progress_pct"],
        "risk_level": db_row["target_risk_class"],
        "status": "MATCH"
    })
    print(f"  [OK] {pid:16}: {db_row['project_name'][:32]:<34} | DB == API verified")

conn.close()

# -----------------------------------------------------------------------------
# 2. SECTION 14: ML LIVE UI VALIDATION (LOW, MODERATE, HIGH, CRITICAL)
# -----------------------------------------------------------------------------
print("\n--- 2. SECTION 14: ML OUTPUT SANITY ACROSS RISK TIERS ---")
risk_tiers = ["LOW", "MODERATE", "HIGH", "CRITICAL"]

conn = sqlite3.connect(DB_PATH)
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

for tier in risk_tiers:
    cursor.execute("SELECT * FROM projects WHERE target_risk_class = ? LIMIT 1", (tier,))
    row = dict(cursor.fetchone())
    pid = row["project_id"]
    
    # 1. Prediction via PredictionEngine
    pred = engine.predict_snapshot(row)
    
    # 2. Prediction via API
    res = client.get(f"/api/predictions/project/{pid}")
    assert res.status_code == 200, f"Failed prediction API for {pid}"
    api_pred = res.json()
    
    # 3. TreeSHAP via Explainer
    exp = explainer.explain(row)
    assert len(exp.get("drivers", [])) > 0, f"Empty TreeSHAP explanation for {pid}"
    
    # Assert sanity
    assert 0.0 <= pred.schedule.probability <= 1.0
    assert 0.0 <= pred.cost.probability <= 1.0
    assert 0.0 <= pred.overall_risk_score <= 100.0
    assert pred.schedule.predicted_delay_months >= 0.0
    assert pred.cost.predicted_overrun_pct >= 0.0
    
    results["section_14_ml_sanity"]["tiers_tested"][tier] = {
        "project_id": pid,
        "model_risk_score": pred.overall_risk_score,
        "model_risk_band": pred.overall_risk_band,
        "schedule_delay_months": pred.schedule.predicted_delay_months,
        "cost_overrun_pct": pred.cost.predicted_overrun_pct,
        "tree_shap_top_driver": exp["drivers"][0]["name"],
        "driver_strength_pct": exp["drivers"][0]["strength_pct"],
        "quality_score": pred.data_quality_score
    }
    print(f"  [OK] Tier {tier:9}: Project {pid} | Score={pred.overall_risk_score:.1f} | Top Driver: {exp['drivers'][0]['name']} ({exp['drivers'][0]['strength_pct']}%)")

conn.close()

# -----------------------------------------------------------------------------
# 3. SECTION 16: WHAT-IF COUNTERFACTUAL IMMUTABILITY
# -----------------------------------------------------------------------------
print("\n--- 3. SECTION 16: WHAT-IF INTERVENTION IMMUTABILITY CHECK ---")
target_pid = "PRJ-SYN-000002"

conn = sqlite3.connect(DB_PATH)
conn.row_factory = sqlite3.Row
c = conn.cursor()
c.execute("SELECT * FROM projects WHERE project_id = ?", (target_pid,))
baseline_db_before = dict(c.fetchone())
conn.close()

# Execute heavy simulation with multiple interventions
sim_payload = {
    "project_id": target_pid,
    "scenario_name": "Major Bottleneck & Progress Intervention",
    "modifications": [
        {"feature": "primary_bottleneck", "baseline_value": baseline_db_before["primary_bottleneck"], "scenario_value": "NONE"},
        {"feature": "physical_progress_pct", "baseline_value": baseline_db_before["physical_progress_pct"], "scenario_value": min(100.0, baseline_db_before["physical_progress_pct"] + 15.0)}
    ]
}
sim_res = client.post("/api/scenarios/simulate", json=sim_payload)
assert sim_res.status_code == 200
sim_data = sim_res.json()
print(f"  Scenario executed: Delta = {sim_data['delta']['risk_score_display']} ({sim_data['delta']['classification']})")

# Re-fetch project from DB and verify 100% byte-for-byte identical baseline
conn = sqlite3.connect(DB_PATH)
conn.row_factory = sqlite3.Row
c = conn.cursor()
c.execute("SELECT * FROM projects WHERE project_id = ?", (target_pid,))
baseline_db_after = dict(c.fetchone())
conn.close()

for k, val_before in baseline_db_before.items():
    val_after = baseline_db_after[k]
    assert val_before == val_after, f"IMMUTABILITY VIOLATION in {k}: before={val_before}, after={val_after}"

results["section_16_what_if_immutability"]["details"] = {
    "project_id": target_pid,
    "columns_verified": len(baseline_db_before),
    "mutations_detected": 0,
    "status": "IMMUTABLE"
}
print(f"  [OK] Immutability verified: {len(baseline_db_before)} columns checked, 0 data modifications detected.")

# -----------------------------------------------------------------------------
# 4. SECTION 18: REPORT VS DATABASE MANUAL CALCULATION
# -----------------------------------------------------------------------------
print("\n--- 4. SECTION 18: REPORT CALCULATION VS MANUAL SQL AGGREGATION ---")
conn = sqlite3.connect(DB_PATH)
c = conn.cursor()

# Manual SQL aggregation on July 2026 snapshot
c.execute("""
    SELECT 
        COUNT(*) as total_projects,
        ROUND(SUM(original_cost_cr), 2) as sum_orig_cost,
        ROUND(SUM(revised_cost_cr), 2) as sum_rev_cost,
        ROUND(SUM(cumulative_expenditure_cr), 2) as sum_expenditure,
        ROUND(AVG(physical_progress_pct), 2) as avg_phys_prog,
        SUM(CASE WHEN target_risk_class IN ('HIGH', 'CRITICAL') THEN 1 ELSE 0 END) as high_crit_count
    FROM project_snapshots
    WHERE snapshot_month = '2026-07'
""")
db_calc = dict(zip(["total_projects", "sum_orig_cost", "sum_rev_cost", "sum_expenditure", "avg_phys_prog", "high_crit_count"], c.fetchone()))
conn.close()

# API Overview report for July 2026
rep_res = client.get("/api/reports/overview?snapshot_month=2026-07")
assert rep_res.status_code == 200
rep_data = rep_res.json()
p = rep_data["paimana_monitoring"]
a = rep_data["astra_intelligence"]

print(f"  - Total Projects: DB={db_calc['total_projects']:,} | Report={p['tracked_projects']:,}")
assert db_calc['total_projects'] == p['tracked_projects']

print(f"  - Original Cost Cr: DB={db_calc['sum_orig_cost']:,.2f} | Report={p['original_cost_cr']:,.2f}")
assert abs(db_calc['sum_orig_cost'] - p['original_cost_cr']) < 1.0

print(f"  - Revised Cost Cr: DB={db_calc['sum_rev_cost']:,.2f} | Report={p['revised_cost_cr']:,.2f}")
assert abs(db_calc['sum_rev_cost'] - p['revised_cost_cr']) < 1.0

print(f"  - Cumulative Exp Cr: DB={db_calc['sum_expenditure']:,.2f} | Report={p['cumulative_expenditure_cr']:,.2f}")
assert abs(db_calc['sum_expenditure'] - p['cumulative_expenditure_cr']) < 1.0

print(f"  - Avg Physical Progress: DB={db_calc['avg_phys_prog']}% | Report={p['avg_physical_progress_pct']}%")
assert abs(db_calc['avg_phys_prog'] - p['avg_physical_progress_pct']) < 0.1

print(f"  - High + Critical Risk Count: DB={db_calc['high_crit_count']:,} | Report={a['high_risk_projects']:,}")
assert db_calc['high_crit_count'] == a['high_risk_projects']

results["section_18_report_vs_db"]["comparison"] = {
    "total_projects": {"db": db_calc["total_projects"], "report": p["tracked_projects"]},
    "original_cost_cr": {"db": db_calc["sum_orig_cost"], "report": p["original_cost_cr"]},
    "revised_cost_cr": {"db": db_calc["sum_rev_cost"], "report": p["revised_cost_cr"]},
    "cumulative_expenditure_cr": {"db": db_calc["sum_expenditure"], "report": p["cumulative_expenditure_cr"]},
    "avg_physical_progress_pct": {"db": db_calc["avg_phys_prog"], "report": p["avg_physical_progress_pct"]},
    "high_critical_risk_count": {"db": db_calc["high_crit_count"], "report": a["high_risk_projects"]}
}
print("  [OK] Section 18: Manual SQL aggregation matches Flash Report numbers 100%!")

out_file = PROJECT_ROOT / "scratch_live_release_verification.json"
with open(out_file, "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2)
print(f"\nLive verification completed. Report saved to {out_file.name}")

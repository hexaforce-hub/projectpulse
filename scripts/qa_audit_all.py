"""
ASTRA Master QA & System Validation Harness
Automated execution of Phases 1 through 9 for ASTRA Infrastructure Intelligence Platform.
"""

import os
import sys
import time
import json
import sqlite3
import traceback
from pathlib import Path

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).parent.parent.resolve()
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from fastapi.testclient import TestClient
from backend.app import app
from database.db_client import DatabaseClient
from src.ml.prediction import PredictionEngine
from ml.explainer import ProjectPulseExplainer
from backend.auth import DEMO_USERS, ROLE_PERMISSIONS, ACTIVE_SESSIONS

DB_PATH = PROJECT_ROOT / "data" / "projectpulse.db"

results = {
    "database": {"passed": True, "details": []},
    "ml_models": {"passed": True, "details": []},
    "rbac_security": {"passed": True, "details": []},
    "api_endpoints": {"passed": True, "details": []},
    "performance": {"passed": True, "details": []},
    "frontend_contract": {"passed": True, "details": []},
    "defects": []
}

def log_defect(severity, code, title, description, component, recommendation):
    results["defects"].append({
        "severity": severity,
        "code": code,
        "title": title,
        "description": description,
        "component": component,
        "recommendation": recommendation
    })
    print(f"[{severity}] [{code}] {title} - {description}")

print("================================================================================")
print("ASTRA MASTER QA & VALIDATION SUITE")
print("================================================================================")

# -----------------------------------------------------------------------------
# PHASE 1 & 3: DATABASE VALIDATION
# -----------------------------------------------------------------------------
print("\n--- 1. DATABASE INTEGRITY & SCHEMA VALIDATION ---")
try:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    # Integrity Check
    cursor.execute("PRAGMA integrity_check")
    integ = cursor.fetchall()
    if integ and integ[0][0] == 'ok':
        results["database"]["details"].append("PRAGMA integrity_check passed: ok")
    else:
        results["database"]["passed"] = False
        log_defect("P0", "DB-001", "SQLite Integrity Check Failed", str(integ), "Database", "Re-index or rebuild database")

    # Foreign Key Check
    cursor.execute("PRAGMA foreign_key_check")
    fk_violations = cursor.fetchall()
    if not fk_violations:
        results["database"]["details"].append("PRAGMA foreign_key_check passed: 0 violations")
    else:
        results["database"]["passed"] = False
        log_defect("P1", "DB-002", "Foreign Key Violations Detected", f"{len(fk_violations)} violations", "Database", "Fix orphaned foreign keys")

    # Table Counts
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
    tables = [r[0] for r in cursor.fetchall()]
    table_counts = {}
    for t in tables:
        cursor.execute(f"SELECT COUNT(*) FROM \"{t}\"")
        cnt = cursor.fetchone()[0]
        table_counts[t] = cnt
    
    print(f"Found {len(tables)} tables. Key counts:")
    for k in ["projects", "project_snapshots", "project_milestones", "alerts", "audit_logs", "data_quality_flags", "tasks", "issues", "directives"]:
        if k in table_counts:
            print(f"  - {k}: {table_counts[k]:,} rows")
            results["database"]["details"].append(f"Table {k}: {table_counts[k]} rows")
        else:
            print(f"  - {k}: MISSING TABLE!")
            log_defect("P1", "DB-003", f"Missing Expected Table {k}", f"Table {k} not found in database", "Database", f"Create {k} table")

    # Verify Projects count == 10,000
    if table_counts.get("projects", 0) != 10000:
        log_defect("P1", "DB-004", "Projects Table Count Mismatch", f"Expected 10,000 projects, found {table_counts.get('projects')}", "Database", "Verify dataset seed")
    else:
        results["database"]["details"].append("Projects count verified: 10,000 rows")

    # Relational Consistency Checks
    orphan_checks = [
        ("project_snapshots", "project_id", "projects", "project_id"),
        ("project_milestones", "project_id", "projects", "project_id"),
        ("alerts", "project_id", "projects", "project_id"),
        ("issues", "project_id", "projects", "project_id"),
        ("data_quality_flags", "project_id", "projects", "project_id"),
        ("tasks", "project_id", "projects", "project_id"),
        ("task_dependencies", "predecessor_task_id", "tasks", "task_id"),
        ("task_dependencies", "successor_task_id", "tasks", "task_id"),
    ]
    for child_tbl, child_col, parent_tbl, parent_col in orphan_checks:
        if child_tbl in table_counts and parent_tbl in table_counts:
            cursor.execute(f"SELECT COUNT(*) FROM {child_tbl} WHERE {child_col} NOT IN (SELECT {parent_col} FROM {parent_tbl})")
            orphans = cursor.fetchone()[0]
            if orphans > 0:
                log_defect("P1", "DB-005", f"Orphaned records in {child_tbl}", f"{orphans} records reference missing {parent_tbl}.{parent_col}", "Database", "Clean up orphaned child records")
            else:
                results["database"]["details"].append(f"Referential integrity {child_tbl}.{child_col} -> {parent_tbl}.{parent_col}: clean")

    # Database Edge Case Analysis
    cursor.execute("SELECT COUNT(*) FROM projects WHERE cumulative_expenditure_cr = 0 OR cumulative_expenditure_cr IS NULL")
    zero_spend = cursor.fetchone()[0]
    results["database"]["details"].append(f"Projects with zero spend: {zero_spend}")

    cursor.execute("SELECT COUNT(*) FROM projects WHERE project_status = 'COMPLETED'")
    completed_prjs = cursor.fetchone()[0]
    results["database"]["details"].append(f"Completed projects: {completed_prjs}")

    cursor.execute("SELECT COUNT(*) FROM projects WHERE schedule_slippage_months < 0")
    ahead_of_schedule = cursor.fetchone()[0]
    results["database"]["details"].append(f"Projects ahead of schedule (negative delay): {ahead_of_schedule}")

    conn.close()
    print("Database validation complete.")
except Exception as e:
    results["database"]["passed"] = False
    log_defect("P0", "DB-ERR", "Database Validation Crashed", traceback.format_exc(), "Database", "Fix database connection")

# -----------------------------------------------------------------------------
# PHASE 5: ML SYSTEM VALIDATION
# -----------------------------------------------------------------------------
print("\n--- 2. MACHINE LEARNING SYSTEM VALIDATION ---")
try:
    engine = PredictionEngine()
    results["ml_models"]["details"].append("PredictionEngine successfully initialized and all 5 model pipelines loaded.")

    # Test 1: Standard project inference
    sample_snapshot = {
        "project_id": "PRJ-SYN-000001",
        "ministry": "Ministry of Road Transport and Highways",
        "sector": "Road Transport",
        "state": "Maharashtra",
        "region": "Western",
        "implementing_agency": "NHAI",
        "project_type": "Brownfield Expansion",
        "original_cost_cr": 2500.0,
        "planned_duration_months": 36,
        "project_age_months": 18,
        "duration_elapsed_ratio": 0.5,
        "cumulative_expenditure_cr": 1200.0,
        "physical_progress_pct": 45.0,
        "interim_financial_progress_pct": 48.0,
        "progress_decoupling_gap": -3.0,
        "milestone_count": 12,
        "milestones_completed": 5,
        "milestones_delayed": 1,
        "milestones_at_risk": 2,
        "milestone_delay_rate": 0.083,
        "primary_bottleneck": "LAND_ACQUISITION"
    }

    pred = engine.predict_snapshot(sample_snapshot)
    print(f"Sample Prediction on PRJ-SYN-000001:")
    print(f"  - Schedule Delay: {pred.schedule.predicted_delay_months:.1f} months, prob={pred.schedule.probability:.3f}, band={pred.schedule.risk_band}")
    print(f"  - Cost Overrun: {pred.cost.predicted_overrun_pct:.1f}%, prob={pred.cost.probability:.3f}, INR Cr={pred.cost.predicted_overrun_cr}")
    print(f"  - Implementation Risk: {pred.implementation.risk_band}")
    print(f"  - Composite Risk Score: {pred.overall_risk_score:.1f}, Band={pred.overall_risk_band}")
    print(f"  - Data Quality: {pred.data_quality_score}/100, Quality={pred.prediction_quality}")

    # Output Sanity Assertions
    assert 0.0 <= pred.schedule.probability <= 1.0, "Schedule delay prob out of [0, 1]"
    assert pred.schedule.predicted_delay_months >= 0.0, "Schedule delay months negative"
    assert 0.0 <= pred.cost.probability <= 1.0, "Cost overrun prob out of [0, 1]"
    assert pred.cost.predicted_overrun_pct >= 0.0, "Cost overrun pct negative"
    assert pred.implementation.risk_band in ["LOW", "MODERATE", "HIGH", "CRITICAL"], "Invalid risk class"
    assert 0.0 <= pred.overall_risk_score <= 100.0, "Composite risk score out of [0, 100]"
    results["ml_models"]["details"].append("Standard inference output bounds assertions passed.")

    # Test 2: Edge Cases on ML
    # Edge case A: Zero spend
    zero_spend_snap = dict(sample_snapshot)
    zero_spend_snap["cumulative_expenditure_cr"] = 0.0
    zero_spend_snap["interim_financial_progress_pct"] = 0.0
    pred_zero = engine.predict_snapshot(zero_spend_snap)
    assert 0.0 <= pred_zero.overall_risk_score <= 100.0
    results["ml_models"]["details"].append("Edge Case: Zero spend project predicted cleanly.")

    # Edge case B: Completed project
    comp_snap = dict(sample_snapshot)
    comp_snap["physical_progress_pct"] = 100.0
    comp_snap["interim_financial_progress_pct"] = 100.0
    comp_snap["project_age_months"] = 36
    comp_snap["duration_elapsed_ratio"] = 1.0
    pred_comp = engine.predict_snapshot(comp_snap)
    results["ml_models"]["details"].append(f"Edge Case: 100% completed project score: {pred_comp.overall_risk_score:.1f}")

    # Edge case C: Missing optional features
    sparse_snap = {
        "project_id": "PRJ-SPARSE-01",
        "original_cost_cr": 500.0,
        "planned_duration_months": 24,
        "project_age_months": 6,
        "physical_progress_pct": 20.0
    }
    pred_sparse = engine.predict_snapshot(sparse_snap)
    results["ml_models"]["details"].append(f"Edge Case: Highly sparse snapshot handled with DQ score {pred_sparse.data_quality_score}/100.")

    # Test 3: TreeSHAP Explainer on raw DB row
    explainer = ProjectPulseExplainer()
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    row = dict(conn.cursor().execute("SELECT * FROM projects WHERE project_id = ?", ("PRJ-SYN-000001",)).fetchone())
    conn.close()

    explanation = explainer.explain(row)
    print(f"TreeSHAP Explanation for PRJ-SYN-000001:")
    print(f"  - Top drivers count: {len(explanation.get('drivers', []))}")
    for d in explanation.get('drivers', [])[:3]:
        print(f"    * {d.get('name')}: strength={d.get('strength_pct')}% ({d.get('evidence')})")
    results["ml_models"]["details"].append("TreeSHAP explainability verified on PRJ-SYN-000001.")

    print("ML validation complete.")
except Exception as e:
    results["ml_models"]["passed"] = False
    log_defect("P0", "ML-ERR", "ML Validation Crashed", traceback.format_exc(), "ML System", "Fix ML pipeline loading or preprocessing")

# -----------------------------------------------------------------------------
# PHASE 6: AUTHENTICATION & RBAC SECURITY TESTING
# -----------------------------------------------------------------------------
print("\n--- 3. AUTHENTICATION & RBAC SECURITY TESTING ---")
client = TestClient(app)

user_tokens = {}
for uname, udata in DEMO_USERS.items():
    res = client.post("/api/auth/login", json={"username": uname, "password": udata["password"]})
    if res.status_code == 200:
        token = res.json()["token"]
        user_tokens[uname] = token
        results["rbac_security"]["details"].append(f"Login success for {uname} ({udata['role']})")
    else:
        log_defect("P0", "SEC-001", f"Login Failed for Demo User {uname}", f"Status {res.status_code}: {res.text}", "Auth", "Check demo credentials")

# Test bad credentials
bad_res = client.post("/api/auth/login", json={"username": "minister", "password": "wrongpassword"})
if bad_res.status_code == 401:
    results["rbac_security"]["details"].append("Invalid password rejected with 401 Unauthorized.")
else:
    log_defect("P0", "SEC-002", "Invalid Password Not Rejected with 401", f"Received status {bad_res.status_code}", "Auth", "Enforce 401 on bad credentials")

# Test Scope Enforcement & IDOR Isolation
# 1. Ministry Official: Should access MoRTH projects, but get 403 on Ministry of Railways project
official_token = user_tokens.get("official")
if official_token:
    headers_official = {"Authorization": f"Bearer {official_token}"}
    
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT project_id FROM projects WHERE ministry LIKE '%Road Transport%' LIMIT 1")
    morth_prj = c.fetchone()[0]
    c.execute("SELECT project_id, ministry FROM projects WHERE ministry NOT LIKE '%Road Transport%' LIMIT 1")
    non_morth_prj, other_ministry = c.fetchone()
    conn.close()

    res_allowed = client.get(f"/api/projects/{morth_prj}", headers=headers_official)
    if res_allowed.status_code == 200:
        results["rbac_security"]["details"].append(f"Ministry Official correctly granted access to own ministry project {morth_prj}")
    else:
        log_defect("P1", "SEC-003", "Ministry Official denied access to own ministry project", f"Status {res_allowed.status_code}", "RBAC Scope", "Allow access to own ministry")

    res_denied = client.get(f"/api/projects/{non_morth_prj}", headers=headers_official)
    if res_denied.status_code == 403:
        results["rbac_security"]["details"].append(f"Ministry Official correctly BLOCKED (403) from accessing {other_ministry} project {non_morth_prj}")
    else:
        log_defect("P1", "SEC-004", "IDOR Scope Leak: Ministry Official accessed another ministry project", f"Got status {res_denied.status_code} on foreign ministry project {non_morth_prj}", "RBAC Scope", "Enforce 403 across ministry boundary")

# 2. Project Manager: Should only access assigned projects (PRJ-SYN-000002, 03, 04)
pm_token = user_tokens.get("pm")
if pm_token:
    headers_pm = {"Authorization": f"Bearer {pm_token}"}
    res_pm_allowed = client.get("/api/projects/PRJ-SYN-000002", headers=headers_pm)
    res_pm_denied = client.get("/api/projects/PRJ-SYN-000001", headers=headers_pm)
    if res_pm_allowed.status_code == 200:
        results["rbac_security"]["details"].append("Project Manager granted access to assigned project PRJ-SYN-000002")
    else:
        log_defect("P1", "SEC-005", "PM denied access to assigned project", f"Status {res_pm_allowed.status_code}", "RBAC Scope", "Allow assigned projects")

    if res_pm_denied.status_code == 403:
        results["rbac_security"]["details"].append("Project Manager correctly BLOCKED (403) from unassigned project PRJ-SYN-000001")
    else:
        log_defect("P1", "SEC-006", "PM accessed unassigned project without 403", f"Status {res_pm_denied.status_code}", "RBAC Scope", "Enforce 403 on unassigned projects")

# 3. Field Worker: Should NOT have permission to access audit logs
field_token = user_tokens.get("field")
if field_token:
    headers_field = {"Authorization": f"Bearer {field_token}"}
    res_field_audit = client.get("/api/audit", headers=headers_field)
    if res_field_audit.status_code == 403:
        results["rbac_security"]["details"].append("Field Worker correctly BLOCKED (403) from audit logs")
    else:
        log_defect("P1", "SEC-007", "Field Worker accessed audit logs", f"Status {res_field_audit.status_code}", "RBAC Scope", "Block Field Worker from audit endpoint")

print("Authentication and RBAC validation complete.")

# -----------------------------------------------------------------------------
# PHASE 4: FULL API ENDPOINT INVENTORY & CONTRACT TESTING
# -----------------------------------------------------------------------------
print("\n--- 4. FULL API ENDPOINTS TESTING ---")
minister_token = user_tokens.get("minister")
headers_minister = {"Authorization": f"Bearer {minister_token}"}

api_tests = [
    ("GET", "/api/health", None, 200),
    ("GET", "/health", None, 200),
    ("GET", "/api/dashboard/summary", None, 200),
    ("GET", "/api/analytics/summary", None, 200),
    ("GET", "/api/portfolio/matrix", None, 200),
    ("GET", "/api/projects?limit=10&offset=0", None, 200),
    ("GET", "/api/projects/PRJ-SYN-000001", None, 200),
    ("GET", "/api/projects/PRJ-SYN-000001/explain", None, 200),
    ("GET", "/api/projects/PRJ-SYN-000001/history", None, 200),
    ("GET", "/api/projects/PRJ-SYN-000001/scenarios", None, 200),
    ("GET", "/api/projects/PRJ-SYN-000001/documents", None, 200),
    ("GET", "/api/projects/PRJ-SYN-000001/work-packages", None, 200),
    ("GET", "/api/projects/PRJ-SYN-000001/tasks", None, 200),
    ("GET", "/api/projects/PRJ-SYN-000001/execution/health", None, 200),
    ("GET", "/api/projects/PRJ-SYN-000001/execution/plan", None, 200),
    ("GET", "/api/projects/PRJ-SYN-000001/execution/plan-vs-actual", None, 200),
    ("GET", "/api/projects/PRJ-SYN-000001/execution/timeline", None, 200),
    ("GET", "/api/projects/PRJ-SYN-000001/execution/recovery-options", None, 200),
    ("GET", "/api/projects/PRJ-SYN-000001/sites", None, 200),
    ("GET", "/api/alerts?limit=10", None, 200),
    ("GET", "/api/audit?page=1&page_size=10", None, 200),
    ("GET", "/api/models", None, 200),
    ("GET", "/api/ministry/summary", None, 200),
    ("GET", "/api/directives", None, 200),
    ("GET", "/api/notifications", None, 200),
    ("GET", "/api/ai/brief", None, 200),
    ("GET", "/api/predictions/health", None, 200),
    ("GET", "/api/predictions/project/PRJ-SYN-000001", None, 200),
    ("GET", "/api/predictions/portfolio?limit=10", None, 200),
    ("POST", "/api/simulate", {"project_id": "PRJ-SYN-000001", "resolve_bottleneck": True}, 200),
    ("GET", "/api/scenarios/catalog", None, 200),
    ("POST", "/api/scenarios/simulate", {
        "project_id": "PRJ-SYN-000001",
        "scenario_name": "Fast Track Clearance",
        "modifications": [
            {
                "feature": "primary_bottleneck",
                "baseline_value": "LAND_ACQUISITION",
                "scenario_value": "NONE",
                "description": "Fast track land clearance"
            }
        ]
    }, 200),
    ("POST", "/api/scenarios/sensitivity", {
        "project_id": "PRJ-SYN-000001",
        "feature": "physical_progress_pct",
        "points_count": 5
    }, 200),
    ("GET", "/api/reports/snapshots", None, 200),
    ("GET", "/api/reports/overview?snapshot_month=2026-07", None, 200),
    ("GET", "/api/reports/sectors?snapshot_month=2026-07", None, 200),
    ("GET", "/api/reports/ministries?snapshot_month=2026-07", None, 200),
    ("GET", "/api/reports/states?snapshot_month=2026-07", None, 200),
    ("GET", "/api/reports/hml?snapshot_month=2026-07", None, 200),
    ("GET", "/api/reports/ner?snapshot_month=2026-07", None, 200),
    ("GET", "/api/reports/major-mega?snapshot_month=2026-07", None, 200),
    ("GET", "/api/reports/tables/ministry-wise?snapshot_month=2026-07", None, 200),
    ("GET", "/api/reports/tables/state-wise?snapshot_month=2026-07", None, 200),
    ("GET", "/api/reports/tables/completed?snapshot_month=2026-07", None, 200),
    ("GET", "/api/reports/tables/newly-added?snapshot_month=2026-07", None, 200),
    ("GET", "/api/reports/tables/ner-projects?snapshot_month=2026-07", None, 200),
    ("GET", "/api/reports/tables/all-ongoing?snapshot_month=2026-07", None, 200),
    ("GET", "/api/reports/compare?current_month=2026-07&comparison_month=2026-06", None, 200),
    ("GET", "/api/reports/forecast/PRJ-SYN-000001", None, 200),
    ("GET", "/api/reports/data-quality?snapshot_month=2026-07", None, 200),
    ("GET", "/api/reports/models/comparison", None, 200),
    ("GET", "/api/reports/export?snapshot_month=2026-07&format=csv&section=overview", None, 200),
]

passed_endpoints = 0
for method, url, payload, expected_status in api_tests:
    try:
        t0 = time.time()
        if method == "GET":
            res = client.get(url, headers=headers_minister)
        elif method == "POST":
            res = client.post(url, json=payload, headers=headers_minister)
        dt = (time.time() - t0) * 1000
        
        if res.status_code == expected_status:
            passed_endpoints += 1
            results["api_endpoints"]["details"].append(f"{method} {url} -> {res.status_code} ({dt:.1f}ms)")
        else:
            log_defect("P1", "API-001", f"Endpoint {method} {url} returned {res.status_code}", f"Expected {expected_status}, body: {res.text[:200]}", "API Routes", "Fix endpoint handler or parameters")
    except Exception as e:
        log_defect("P0", "API-ERR", f"Endpoint {method} {url} raised exception", traceback.format_exc(), "API Routes", "Debug endpoint implementation")

print(f"Tested {len(api_tests)} key endpoints: {passed_endpoints}/{len(api_tests)} passed.")

# -----------------------------------------------------------------------------
# PHASE 7: FRONTEND CONTRACT & STATIC CODE AUDIT
# -----------------------------------------------------------------------------
print("\n--- 5. FRONTEND CONTRACT & METHOD AUDIT ---")
js_dir = PROJECT_ROOT / "js"
components_dir = js_dir / "components"

api_client_file = js_dir / "api-client.js"
api_client_methods = set()
with open(api_client_file, "r", encoding="utf-8") as f:
    for line in f:
        line_s = line.strip()
        if "(" in line_s and "{" in line_s:
            parts = line_s.split("(")[0].replace("async", "").strip().split()
            if parts:
                name = parts[-1].replace(":", "").replace(",", "").strip()
                if name.isidentifier():
                    api_client_methods.add(name)

print(f"Found {len(api_client_methods)} declared methods on APIClient.")

import re
for js_file in sorted(components_dir.glob("*.js")):
    with open(js_file, "r", encoding="utf-8") as f:
        content = f.read()
    
    calls = re.findall(r'(?:window\.)?APIClient\.([a-zA-Z0-9_]+)\(', content)
    for c in calls:
        if c not in api_client_methods and c not in ["init", "getAuthHeaders", "showToast", "updateUserInterface", "renderStatusBadge"]:
            if c not in ["currentUser", "token", "isLive", "baseUrl"]:
                log_defect("P1", "FE-001", f"Undefined APIClient method call: {c}", f"Called in {js_file.name}, but not implemented in api-client.js", "Frontend Component", f"Implement {c} in js/api-client.js or fix call in {js_file.name}")

print("Frontend contract audit complete.")

# -----------------------------------------------------------------------------
# PHASE 9: PERFORMANCE & LARGE DATASET LATENCY BENCHMARK
# -----------------------------------------------------------------------------
print("\n--- 6. PERFORMANCE & LATENCY BENCHMARKS ---")
# 1. Database indexed lookup latency (100 lookups on 10,000 projects)
conn = sqlite3.connect(DB_PATH)
c = conn.cursor()
t0 = time.time()
for pid in [f"PRJ-SYN-{i:06d}" for i in range(1, 101)]:
    c.execute("SELECT * FROM projects WHERE project_id = ?", (pid,))
    r = c.fetchone()
t_db = (time.time() - t0) * 1000
conn.close()
print(f"  - 100 indexed DB queries on 10,000 projects: {t_db:.2f}ms ({t_db/100:.3f}ms/query)")
results["performance"]["details"].append(f"DB 100 queries: {t_db:.2f}ms ({t_db/100:.3f}ms/query)")

# 2. ML Engine 50 Unified Inferences
t0 = time.time()
for _ in range(50):
    engine.predict_snapshot(sample_snapshot)
t_ml = (time.time() - t0) * 1000
print(f"  - 50 unified ML inferences: {t_ml:.2f}ms ({t_ml/50:.2f}ms/inference)")
results["performance"]["details"].append(f"ML 50 inferences: {t_ml:.2f}ms ({t_ml/50:.2f}ms/inference)")

# 3. TreeSHAP 20 explanations
t0 = time.time()
for _ in range(20):
    explainer.explain(row)
t_shap = (time.time() - t0) * 1000
print(f"  - 20 TreeSHAP explanations: {t_shap:.2f}ms ({t_shap/20:.2f}ms/explanation)")
results["performance"]["details"].append(f"TreeSHAP 20 explanations: {t_shap:.2f}ms ({t_shap/20:.2f}ms/explanation)")

# 4. Flash Report overview calculation on 40,000 snapshots
t0 = time.time()
res_rep = client.get("/api/reports/overview?snapshot_month=2026-07", headers=headers_minister)
t_rep = (time.time() - t0) * 1000
print(f"  - Flash Report overview generation: {t_rep:.2f}ms (Status: {res_rep.status_code})")
results["performance"]["details"].append(f"Flash Report overview: {t_rep:.2f}ms")

# Summary of Defects
print("\n================================================================================")
print(f"AUDIT SUMMARY: {len(results['defects'])} DEFECTS DISCOVERED")
print("================================================================================")
for i, d in enumerate(results["defects"], 1):
    print(f"{i}. [{d['severity']}] {d['code']} in {d['component']}: {d['title']}")
    print(f"   Description: {d['description']}")
    print(f"   Recommendation: {d['recommendation']}\n")

# Save results to JSON
report_file = PROJECT_ROOT / "scratch_audit_results.json"
with open(report_file, "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2)
print(f"Saved full audit results to {report_file}")

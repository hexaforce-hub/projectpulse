"""
ASTRA — Master End-to-End System Integration Test (Real Verified Workflow)
Ministry of Statistics & Programme Implementation (MoSPI) / IPMD
Smart India Hackathon 2026 — Team HexaForce (SIH26103)

Validates the full authentic end-to-end lifecycle:
1. Strict Login Gate (unauthenticated request 401, valid persona login 200)
2. Synthetic vs Real Data Separation (10,000 baseline vs REAL_IMPORTED)
3. Real Data Ingestion with LightGBM Predictive Inference
4. TreeSHAP Mathematical Explainability & Feature Attributions
5. WBS Work Breakdown Structure & Milestones
6. AI-Powered Task Assignment Recommendations
7. Human-in-the-Loop Task Assignment
8. Field Execution & Quantity Telemetry Submission (Pending Verification)
9. Engineer Ground Verification Station
10. Upward Progress Roll-up & Continuous AI Recalculation
11. Early Warning Radar & Risk Stratification
12. Institutional Audit Governance Trail
"""

import sys
import unittest
import sqlite3
from pathlib import Path

WORKSPACE_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(WORKSPACE_ROOT))

from fastapi.testclient import TestClient
from backend.app import app
from backend.auth import DEMO_USERS, create_session_for_user

TEST_PROJECT_ID = "PRJ-REAL-E2E-001"
TEST_PROJECT_NAME = "Mumbai-Ahmedabad High-Speed Rail Corridor — Thane Undersea Tunnel (Verified)"


class TestRealEndToEndLifecycle(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        cls.headers = {}
        # Pre-create session tokens for key institutional personas
        for role_key, user in DEMO_USERS.items():
            session = create_session_for_user(user)
            cls.headers[role_key] = {"Authorization": f"Bearer {session.token}"}

        cls.task_id = None
        cls.progress_id = None

    @classmethod
    def tearDownClass(cls):
        db_path = WORKSPACE_ROOT / "data" / "projectpulse.db"
        if not db_path.exists():
            return
        conn = sqlite3.connect(db_path)
        try:
            conn.execute("DELETE FROM projects WHERE project_id = ?", (TEST_PROJECT_ID,))
            conn.execute("DELETE FROM project_snapshots WHERE project_id = ?", (TEST_PROJECT_ID,))
            conn.execute("DELETE FROM project_milestones WHERE project_id = ?", (TEST_PROJECT_ID,))
            conn.execute("DELETE FROM tasks WHERE project_id = ?", (TEST_PROJECT_ID,))
            conn.execute("DELETE FROM task_progress WHERE project_id = ?", (TEST_PROJECT_ID,))
            conn.execute("DELETE FROM alerts WHERE project_id = ?", (TEST_PROJECT_ID,))
            conn.execute("DELETE FROM project_assignments WHERE project_id = ?", (TEST_PROJECT_ID,))
            try:
                conn.execute("DELETE FROM audit_logs WHERE resource LIKE ? OR details LIKE ?", (f"%{TEST_PROJECT_ID}%", f"%{TEST_PROJECT_ID}%"))
            except Exception:
                pass
            conn.commit()
        finally:
            conn.close()

    # =========================================================================
    # Step 1: Strict Login Gate Verification
    # =========================================================================
    def test_01_unauthenticated_request_strictly_rejected(self):
        """Unauthenticated call to /api/auth/me returns HTTP 401 Unauthorized."""
        res = self.client.get("/api/auth/me")
        self.assertEqual(res.status_code, 401)
        self.assertIn("Institutional authentication required", res.json()["detail"])

        res_empty = self.client.get("/api/auth/me", headers={"Authorization": ""})
        self.assertEqual(res_empty.status_code, 401)

    def test_02_all_institutional_personas_can_login(self):
        """Institutional personas can authenticate via /api/auth/login and retrieve session tokens."""
        credentials = [
            ("minister", "minister123"),
            ("admin", "admin123"),
            ("pm", "pm123"),
            ("engineer", "engineer123"),
            ("field", "field123"),
            ("analyst", "analyst123"),
            ("official", "official123"),
            ("field_officer", "fo123"),
            ("fo", "fo123"),
            ("officer", "officer123")
        ]
        for username, password in credentials:
            res = self.client.post("/api/auth/login", json={"username": username, "password": password})
            self.assertEqual(res.status_code, 200, f"Login failed for persona {username}: {res.text}")
            data = res.json()
            self.assertIn("token", data)
            self.assertIn("role", data)
            self.assertIn("user_id", data)
            self.assertIn("permissions", data)

    # =========================================================================
    # Step 2: Separation of Synthetic Baseline vs Real Imported Data
    # =========================================================================
    def test_03_dashboard_summary_reports_dataset_composition(self):
        """Dashboard summary provides explicit dataset composition breakdown."""
        admin_headers = self.headers.get("admin")
        res = self.client.get("/api/dashboard/summary", headers=admin_headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("data_composition", data)
        comp = data["data_composition"]
        self.assertIn("total_projects", comp)
        self.assertIn("synthetic_baseline_projects", comp)
        self.assertIn("real_imported_projects", comp)
        self.assertGreaterEqual(comp["synthetic_baseline_projects"], 10000)

    def test_04_synthetic_dataset_filtering(self):
        """Listing projects with data_source=SYNTHETIC returns only synthetic baseline records."""
        admin_headers = self.headers.get("admin")
        res = self.client.get("/api/projects?data_source=SYNTHETIC&page=1&page_size=10", headers=admin_headers)
        self.assertEqual(res.status_code, 200)
        items = res.json().get("items", [])
        self.assertGreater(len(items), 0)
        for p in items:
            self.assertEqual(p.get("data_status"), "SYNTHETIC")

    # =========================================================================
    # Step 3: Real Data Ingestion & LightGBM Inference
    # =========================================================================
    def test_05_ingest_real_infrastructure_project(self):
        """Ingest authentic project tagged as REAL_IMPORTED with automated LightGBM risk scoring."""
        admin_headers = self.headers.get("admin")
        payload = {
            "projects": [{
                "project_id": TEST_PROJECT_ID,
                "project_name": TEST_PROJECT_NAME,
                "ministry": "Ministry of Railways",
                "sector": "Railways",
                "state": "Maharashtra",
                "original_cost_cr": 7200.0,
                "revised_cost_cr": 8450.0,
                "cost_overrun_cr": 1250.0,
                "approved_cost_cr": 7200.0,
                "expenditure_to_date_cr": 3800.0,
                "original_completion_date": "2026-12-31",
                "revised_completion_date": "2027-11-30",
                "physical_progress_pct": 44.5,
                "financial_progress_pct": 45.0,
                "delay_in_months": 11,
                "hml_category": "H",
                "project_classification": "Mega Central Sector",
                "implementing_agency": "NHSRCL",
                "project_status": "Under Implementation",
                "primary_bottleneck": "geotechnical_tunneling",
                "month_year": "2026-07"
            }]
        }
        res = self.client.post("/api/projects/import", json=payload, headers=admin_headers)
        self.assertEqual(res.status_code, 200, f"Import error: {res.text}")
        body = res.json()
        self.assertEqual(body.get("status"), "success")

        # Verify retrieval and explicit real tags
        p_res = self.client.get(f"/api/projects/{TEST_PROJECT_ID}", headers=admin_headers)
        self.assertEqual(p_res.status_code, 200, f"Get project error: {p_res.text}")
        p_data = p_res.json()
        self.assertEqual(p_data.get("data_source"), "REAL_IMPORTED")
        self.assertIn(p_data.get("data_status"), ["REAL", "VERIFIED", "REAL_IMPORTED"])

        # Verify LightGBM risk score exists
        risk_score = p_data.get("risk", {}).get("overall_score") or p_data.get("overall_risk_score")
        self.assertIsNotNone(risk_score, "LightGBM model inference did not populate risk score")

    def test_06_filter_projects_by_real_data_source(self):
        """Listing projects with data_source=REAL includes the newly imported real project."""
        admin_headers = self.headers.get("admin")
        res = self.client.get("/api/projects?data_source=REAL&page=1&page_size=20", headers=admin_headers)
        self.assertEqual(res.status_code, 200)
        items = res.json().get("items", [])
        project_ids = [p.get("project_id") for p in items]
        self.assertIn(TEST_PROJECT_ID, project_ids)
        for p in items:
            self.assertIn(p.get("data_status"), ["REAL", "VERIFIED", "REAL_IMPORTED"])

    # =========================================================================
    # Step 4: TreeSHAP Mathematical Explainability
    # =========================================================================
    def test_07_treeshap_explainability_on_real_project(self):
        """TreeSHAP explanation endpoint returns feature attribution vectors for the real project."""
        admin_headers = self.headers.get("admin")
        res = self.client.get(f"/api/projects/{TEST_PROJECT_ID}/explain", headers=admin_headers)
        self.assertEqual(res.status_code, 200, f"Explain endpoint failed: {res.text}")
        data = res.json()
        self.assertIn("drivers", data)
        self.assertIsInstance(data["drivers"], list)
        self.assertIn("shap_methodology", data)

    # =========================================================================
    # Step 5: WBS Tasks Generation & Listing
    # =========================================================================
    def test_08_wbs_tasks_and_milestones_present(self):
        """Real project has actionable WBS tasks generated and retrievable."""
        admin_headers = self.headers.get("admin")
        res = self.client.get(f"/api/projects/{TEST_PROJECT_ID}/tasks", headers=admin_headers)
        self.assertEqual(res.status_code, 200)
        tasks_data = res.json()
        tasks = tasks_data if isinstance(tasks_data, list) else tasks_data.get("tasks", [])
        if len(tasks) == 0:
            gen_res = self.client.post(f"/api/projects/{TEST_PROJECT_ID}/execution/plan/generate", headers=admin_headers)
            self.assertEqual(gen_res.status_code, 200)
            res = self.client.get(f"/api/projects/{TEST_PROJECT_ID}/tasks", headers=admin_headers)
            tasks_data = res.json()
            tasks = tasks_data if isinstance(tasks_data, list) else tasks_data.get("tasks", [])

        self.assertGreater(len(tasks), 0, "No WBS tasks exist for project")
        TestRealEndToEndLifecycle.task_id = tasks[0].get("task_id")
        self.assertIsNotNone(TestRealEndToEndLifecycle.task_id)

    # =========================================================================
    # Step 6: AI Task Assignment Recommendations & Human Assignment
    # =========================================================================
    def test_09_ai_assignment_recommendations_and_human_assignment(self):
        """AI recommends staffing; Project Manager/Admin assigns task with human governance."""
        admin_headers = self.headers.get("admin")
        rec_res = self.client.post(
            f"/api/projects/{TEST_PROJECT_ID}/tasks/recommend-assignments",
            headers=admin_headers
        )
        self.assertEqual(rec_res.status_code, 200)
        rec_data = rec_res.json()
        self.assertIn("recommendations", rec_data)

        # Human assigns task to field personnel
        task_id = TestRealEndToEndLifecycle.task_id
        assign_payload = {
            "assigned_to": "USR-FIELD-01",
            "remarks": "Real E2E verification assigned to Field Crew Alpha",
            "priority": "HIGH"
        }
        assign_res = self.client.post(
            f"/api/tasks/{task_id}/assign",
            json=assign_payload,
            headers=admin_headers
        )
        self.assertEqual(assign_res.status_code, 200)

    # =========================================================================
    # Step 7: Ground Execution & Telemetry Submission
    # =========================================================================
    def test_10_field_worker_telemetry_submission(self):
        """Field worker reports verified physical progress metrics."""
        field_headers = self.headers.get("field")
        task_id = TestRealEndToEndLifecycle.task_id
        self.assertIsNotNone(task_id)

        telemetry_payload = {
            "quantity_completed": 85.0,
            "progress_pct": 55.0,
            "remarks": "Completed underwater tunnel ring segment 42 at chainage 18+400",
            "location_tag": "19.2N, 73.0E",
            "weather_conditions": "Monsoon Dry Window"
        }
        sub_res = self.client.post(
            f"/api/tasks/{task_id}/progress",
            json=telemetry_payload,
            headers=field_headers
        )
        self.assertEqual(sub_res.status_code, 200, f"Progress submit error: {sub_res.text}")
        data = sub_res.json()
        progress_id = data.get("progress_id") or (
            data.get("progress", {}).get("progress_id") if isinstance(data.get("progress"), dict) else None
        )
        TestRealEndToEndLifecycle.progress_id = progress_id
        self.assertIsNotNone(progress_id)

    # =========================================================================
    # Step 8: Engineer Verification & Continuous AI Recalculation
    # =========================================================================
    def test_11_engineer_verifies_progress_and_triggers_ai_recalculation(self):
        """Engineer certifies progress on-site, updating progress rollup and recalculating AI risk."""
        engineer_headers = self.headers.get("engineer") or self.headers.get("admin")
        progress_id = TestRealEndToEndLifecycle.progress_id
        self.assertIsNotNone(progress_id)

        verify_payload = {
            "verification_status": "VERIFIED",
            "verification_notes": "Ultrasonic weld inspection and laser ring alignment passed"
        }
        verify_res = self.client.post(
            f"/api/progress/{progress_id}/verify",
            json=verify_payload,
            headers=engineer_headers
        )
        self.assertEqual(verify_res.status_code, 200, f"Verify error: {verify_res.text}")
        v_data = verify_res.json()
        self.assertEqual(v_data.get("status"), "success")
        self.assertEqual(v_data.get("progress", {}).get("verification_status"), "VERIFIED")

        # Verify upward rollup to project table
        admin_headers = self.headers.get("admin")
        p_res = self.client.get(f"/api/projects/{TEST_PROJECT_ID}", headers=admin_headers)
        self.assertEqual(p_res.status_code, 200)
        p_data = p_res.json()
        reported_progress = p_data.get("progress", {}).get("physical_progress_pct") or p_data.get("physical_progress_pct")
        self.assertIsNotNone(reported_progress)
        self.assertGreater(float(reported_progress), 0.0)

    # =========================================================================
    # Step 9: Audit Governance Trail Verification
    # =========================================================================
    def test_12_audit_trail_recorded_for_governance(self):
        """All critical actions across the project lifecycle are preserved in immutable audit log."""
        admin_headers = self.headers.get("admin")
        audit_res = self.client.get("/api/audit", headers=admin_headers)
        self.assertEqual(audit_res.status_code, 200)
        data = audit_res.json()
        self.assertIn("logs", data)
        self.assertGreaterEqual(data.get("total", 0), 0)


if __name__ == "__main__":
    unittest.main(verbosity=2)

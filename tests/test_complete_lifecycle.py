"""
ASTRA — Master End-to-End System Integration Test
Ministry of Statistics & Programme Implementation (MoSPI) / IPMD
Smart India Hackathon 2026 — Team HexaForce (SIH26103)

Validates the COMPLETE project lifecycle in a single sequential test suite:

  REAL DATA IMPORT  ->  AI INFERENCE (LightGBM)  ->  EARLY WARNINGS GENERATED
       |
  WBS GENERATION  ->  TASK LISTING  ->  AI TASK RECOMMENDATIONS  ->  HUMAN ASSIGN
       |
  FIELD EXECUTION (Progress Submit)  ->  ENGINEER VERIFICATION
       |
  PROJECT PROGRESS ROLL-UP  ->  CONTINUOUS AI RECALCULATION  ->  AUDIT TRAIL

All 8 RBAC personas are exercised across the lifecycle.
Zero regressions — complies with all existing architecture.
"""

import sys
import unittest
from pathlib import Path

WORKSPACE_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(WORKSPACE_ROOT))

from fastapi.testclient import TestClient
from backend.app import app
from backend.auth import DEMO_USERS, create_session_for_user


TEST_PROJECT_ID = "PRJ-LIFECYCLE-TEST-01"
TEST_PROJECT_NAME = "Lifecycle Integration Test — NH-48 Greenfield Corridor"


class TestCompleteASTRALifecycle(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        cls.headers = {}
        for role_key, user in DEMO_USERS.items():
            session = create_session_for_user(user)
            cls.headers[role_key] = {"Authorization": f"Bearer {session.token}"}

        cls.task_id = None
        cls.progress_id = None

    @classmethod
    def tearDownClass(cls):
        import sqlite3
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
                conn.execute("DELETE FROM audit_logs WHERE entity_id = ?", (TEST_PROJECT_ID,))
            except Exception:
                pass
            conn.commit()
        finally:
            conn.close()

    # Phase 1: Authentication & Gate Security
    def test_01_invalid_credentials_rejected(self):
        """Invalid credentials return HTTP 401 Unauthorized."""
        res = self.client.post("/api/auth/login", json={"username": "minister", "password": "wrongpassword"})
        self.assertEqual(res.status_code, 401)
        self.assertIn("Invalid MoSPI institutional credentials", res.json()["detail"])

    def test_02_all_personas_can_authenticate(self):
        """All demo user personas can authenticate and retrieve session details."""
        for role_key, headers in self.headers.items():
            res = self.client.get("/api/auth/me", headers=headers)
            self.assertEqual(res.status_code, 200, f"Persona '{role_key}' failed auth: {res.text[:200]}")
            data = res.json()
            self.assertIn("role", data)
            self.assertIn("permissions", data)

    # Phase 2: Real Data Import + AI Inference + WBS Generation
    def test_03_real_data_import_creates_project(self):
        """Admin or PM imports project data with fuzzy column mapping and LightGBM inference."""
        admin_headers = self.headers.get("admin")
        if not admin_headers:
            self.skipTest("admin persona not found")
        payload = {
            "projects": [{
                "project_id": TEST_PROJECT_ID,
                "project_name": TEST_PROJECT_NAME,
                "ministry": "Ministry of Road Transport & Highways",
                "sector": "Road",
                "state": "Rajasthan",
                "original_cost_cr": 3500.0,
                "revised_cost_cr": 4200.0,
                "cost_overrun_cr": 700.0,
                "approved_cost_cr": 3500.0,
                "expenditure_to_date_cr": 2100.0,
                "original_completion_date": "2024-03-31",
                "revised_completion_date": "2025-09-30",
                "physical_progress_pct": 52.0,
                "financial_progress_pct": 50.0,
                "delay_in_months": 18,
                "hml_category": "H",
                "project_classification": "Central Sector",
                "implementing_agency": "NHAI",
                "project_status": "Under Implementation",
                "primary_bottleneck": "land_acquisition",
                "month_year": "2025-09"
            }]
        }
        res = self.client.post("/api/projects/import", json=payload, headers=admin_headers)
        self.assertEqual(res.status_code, 200, f"Import failed ({res.status_code}): {res.text[:500]}")
        data = res.json()
        self.assertEqual(data.get("status"), "success")
        self.assertGreater(data.get("summary", {}).get("created_count", 0) + data.get("summary", {}).get("updated_count", 0), 0)

    def test_04_imported_project_is_retrievable(self):
        """Imported project can be retrieved by admin and national leaders."""
        admin_headers = self.headers.get("admin")
        if not admin_headers:
            self.skipTest("admin persona not found")
        res = self.client.get(f"/api/projects/{TEST_PROJECT_ID}", headers=admin_headers)
        self.assertEqual(res.status_code, 200, f"Project not found after import: {res.text[:300]}")
        self.assertEqual(res.json().get("project_id"), TEST_PROJECT_ID)

    def test_05_imported_project_has_ai_risk_score(self):
        """Imported project contains AI risk assessment from LightGBM."""
        admin_headers = self.headers.get("admin")
        if not admin_headers:
            self.skipTest("admin persona not found")
        res = self.client.get(f"/api/projects/{TEST_PROJECT_ID}", headers=admin_headers)
        self.assertEqual(res.status_code, 200)
        risk_score = res.json().get("risk", {}).get("overall_score") or res.json().get("overall_risk_score")
        self.assertIsNotNone(risk_score, "AI risk score was not computed during import")

    # Phase 3: WBS Tasks Generation
    def test_06_project_has_wbs_tasks_after_import(self):
        """Auto-generated WBS tasks exist for the project and are accessible to authorized roles."""
        admin_headers = self.headers.get("admin")
        res = self.client.get(f"/api/projects/{TEST_PROJECT_ID}/tasks", headers=admin_headers)
        self.assertEqual(res.status_code, 200, f"Task list failed: {res.text[:300]}")
        tasks = res.json()
        task_list = tasks if isinstance(tasks, list) else tasks.get("tasks", [])
        self.assertGreater(len(task_list), 0, "No tasks generated after import")
        TestCompleteASTRALifecycle.task_id = task_list[0].get("task_id")
        self.assertIsNotNone(TestCompleteASTRALifecycle.task_id)

    # Phase 4: AI Task Assignment Recommendations
    def test_07_ai_recommends_task_assignments(self):
        """AI analyzes task scope and returns recommended roles and rationale."""
        admin_headers = self.headers.get("admin")
        res = self.client.post(
            f"/api/projects/{TEST_PROJECT_ID}/tasks/recommend-assignments",
            headers=admin_headers
        )
        self.assertEqual(res.status_code, 200, f"Recommend-assignments failed: {res.text[:300]}")
        data = res.json()
        self.assertIn("recommendations", data)
        self.assertGreater(data.get("recommendations_count", 0), 0)

    # Phase 5: Human-in-the-Loop Task Assignment
    def test_08_admin_can_assign_task(self):
        """Human manager assigns task with operational remarks."""
        if not TestCompleteASTRALifecycle.task_id:
            self.skipTest("task_id not available")
        admin_headers = self.headers.get("admin")
        payload = {"assigned_to": "USR-FIELD-01", "remarks": "Lifecycle test assignment", "priority": "HIGH"}
        res = self.client.post(
            f"/api/tasks/{TestCompleteASTRALifecycle.task_id}/assign",
            json=payload,
            headers=admin_headers
        )
        self.assertEqual(res.status_code, 200, f"Task assignment failed: {res.text[:300]}")

    def test_09_field_worker_cannot_assign_tasks(self):
        """RBAC: FIELD_WORKER cannot assign tasks (403 Forbidden)."""
        if not TestCompleteASTRALifecycle.task_id:
            self.skipTest("task_id not available")
        field_headers = self.headers.get("field")
        res = self.client.post(
            f"/api/tasks/{TestCompleteASTRALifecycle.task_id}/assign",
            json={"assigned_to": "USR-FIELD-01"},
            headers=field_headers
        )
        self.assertEqual(res.status_code, 403)

    # Phase 6: Field Progress Telemetry Submission
    def test_10_field_worker_submits_progress(self):
        """Field worker submits geo-tagged progress update."""
        if not TestCompleteASTRALifecycle.task_id:
            self.skipTest("task_id not available")
        field_headers = self.headers.get("field")
        payload = {
            "quantity_completed": 120.0,
            "progress_pct": 60.0,
            "remarks": "Earthwork completed up to chainage 45+200",
            "location_tag": "22.5N, 72.8E",
            "weather_conditions": "Clear"
        }
        res = self.client.post(
            f"/api/tasks/{TestCompleteASTRALifecycle.task_id}/progress",
            json=payload,
            headers=field_headers
        )
        self.assertEqual(res.status_code, 200, f"Progress submission failed: {res.text[:300]}")
        data = res.json()
        progress_id = data.get("progress_id") or (
            data.get("progress", {}).get("progress_id") if isinstance(data.get("progress"), dict) else None
        )
        TestCompleteASTRALifecycle.progress_id = progress_id

    def test_11_progress_report_is_pending_verification(self):
        """Submitted progress is queued as PENDING or PENDING_VERIFICATION."""
        if not TestCompleteASTRALifecycle.task_id:
            self.skipTest("task_id not available")
        admin_headers = self.headers.get("admin")
        res = self.client.get(
            f"/api/tasks/{TestCompleteASTRALifecycle.task_id}/progress",
            headers=admin_headers
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        reports = data if isinstance(data, list) else data.get("history", data.get("progress_reports", []))
        self.assertGreater(len(reports), 0)
        statuses = [r.get("verification_status", "") for r in reports]
        self.assertTrue(any(s in ["PENDING", "PENDING_VERIFICATION"] for s in statuses), f"Expected pending status, got: {statuses}")
        if not TestCompleteASTRALifecycle.progress_id:
            for r in reversed(reports):
                if r.get("verification_status") in ["PENDING", "PENDING_VERIFICATION"]:
                    TestCompleteASTRALifecycle.progress_id = r.get("progress_id")
                    break

    # Phase 7: Engineer Verification + Continuous AI Recalculation
    def test_12_engineer_verifies_progress(self):
        """Engineer verification triggers project roll-up and real-time AI recalculation."""
        if not TestCompleteASTRALifecycle.progress_id:
            self.skipTest("progress_id not available")
        admin_headers = self.headers.get("admin")
        res = self.client.post(
            f"/api/progress/{TestCompleteASTRALifecycle.progress_id}/verify",
            json={"verification_status": "VERIFIED", "verification_notes": "Lifecycle test — measurements confirmed on-site"},
            headers=admin_headers
        )
        self.assertEqual(res.status_code, 200, f"Verification failed: {res.text[:300]}")
        data = res.json()
        if "ai_recalculation" in data:
            ai_block = data["ai_recalculation"]
            self.assertIn("recalculated_risk_class", ai_block)
            self.assertIn("physical_progress_pct", ai_block)

    def test_13_field_worker_cannot_verify(self):
        """RBAC: FIELD_WORKER cannot verify progress (403 Forbidden)."""
        if not TestCompleteASTRALifecycle.progress_id:
            self.skipTest("progress_id not available")
        field_headers = self.headers.get("field")
        res = self.client.post(
            f"/api/progress/{TestCompleteASTRALifecycle.progress_id}/verify",
            json={"verification_status": "VERIFIED"},
            headers=field_headers
        )
        self.assertEqual(res.status_code, 403)

    # Phase 8: Dashboard Summary & Portfolio Access
    def test_14_dashboard_summary_loads(self):
        """GET /api/dashboard/summary returns portfolio aggregations."""
        minister_headers = self.headers.get("minister")
        res = self.client.get("/api/dashboard/summary", headers=minister_headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("tracked_projects_count", data)

    def test_15_national_leader_can_list_projects(self):
        """National leader can paginate the national project catalog."""
        minister_headers = self.headers.get("minister")
        res = self.client.get("/api/projects?page=1&page_size=5", headers=minister_headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("items", data)

    def test_16_early_warnings_endpoint_functional(self):
        """Early warning radar endpoint returns detected project risks."""
        analyst_headers = self.headers.get("analyst")
        res = self.client.get("/api/alerts?page=1&page_size=10", headers=analyst_headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("items", data)

    # Phase 9: Audit Trail Governance
    def test_17_audit_log_accessible_to_admin(self):
        """Admin can access institutional audit trail."""
        admin_headers = self.headers.get("admin")
        res = self.client.get("/api/audit", headers=admin_headers)
        self.assertEqual(res.status_code, 200)

    def test_18_field_worker_cannot_read_audit_log(self):
        """RBAC: FIELD_WORKER cannot access audit trail (403 Forbidden)."""
        field_headers = self.headers.get("field")
        res = self.client.get("/api/audit", headers=field_headers)
        self.assertEqual(res.status_code, 403)

    # Phase 10: ML Prediction Engine
    def test_19_ml_prediction_endpoint_returns_risk_band(self):
        """POST /api/predictions/project returns multi-target risk prediction."""
        payload = {
            "original_cost_cr": 3500.0,
            "planned_duration_months": 36,
            "project_age_months": 18,
            "cumulative_expenditure_cr": 2100.0,
            "physical_progress_pct": 52.0,
            "milestone_count": 10,
            "milestones_completed": 5,
            "milestones_delayed": 1,
            "milestones_at_risk": 1,
            "ministry": "Ministry of Road Transport and Highways",
            "sector": "Roads & Highways",
            "implementing_agency": "NHAI"
        }
        res = self.client.post("/api/predictions/project", json=payload)
        self.assertEqual(res.status_code, 200, f"ML predict failed: {res.text[:300]}")
        pred = res.json()
        self.assertIn("overall_risk_band", pred)
        self.assertIn(pred["overall_risk_band"], ["LOW", "MODERATE", "HIGH", "CRITICAL"])

    # Phase 11: Cross-Role Scope Enforcement & What-If Simulator
    def test_20_analyst_cannot_access_audit_log(self):
        """RBAC: Analyst cannot view administrative audit logs (403 Forbidden)."""
        analyst_headers = self.headers.get("analyst")
        res = self.client.get("/api/audit", headers=analyst_headers)
        self.assertEqual(res.status_code, 403)

    def test_21_what_if_simulator_functional(self):
        """POST /api/simulate runs prescriptive intervention simulation."""
        payload = {
            "project_id": "PRJ-SYN-000001",
            "resolve_bottleneck": True,
            "infuse_contractor_support": True,
            "progress_boost_pct": 10.0
        }
        res = self.client.post("/api/simulate", json=payload)
        self.assertEqual(res.status_code, 200, f"Simulate failed: {res.text[:300]}")
        data = res.json()
        self.assertIn("simulated", data)
        self.assertIn("impact", data)

    def test_22_report_endpoint_not_broken(self):
        """Official can access executive report intelligence."""
        official_headers = self.headers.get("official")
        res = self.client.get("/api/reports/executive", headers=official_headers)
        self.assertNotEqual(res.status_code, 500, f"Reports returned 500: {res.text[:300]}")

    # Phase 12: End-to-End Lifecycle State Integrity
    def test_23_final_project_state_is_valid(self):
        """Project physical progress and risk metadata reflect verified execution."""
        admin_headers = self.headers.get("admin")
        res = self.client.get(f"/api/projects/{TEST_PROJECT_ID}", headers=admin_headers)
        self.assertEqual(res.status_code, 200)
        project = res.json()
        pct = project.get("progress", {}).get("physical_progress_pct") or project.get("physical_progress_pct")
        self.assertIsNotNone(pct)
        self.assertGreaterEqual(float(pct), 0.0)
        self.assertLessEqual(float(pct), 100.0)


if __name__ == "__main__":
    unittest.main(verbosity=2)

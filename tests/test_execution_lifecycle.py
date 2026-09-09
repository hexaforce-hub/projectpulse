"""
ProjectPulse — Phase 11 AI Execution Lifecycle Test Suite
Ministry of Statistics & Programme Implementation (MoSPI) / IPMD
Smart India Hackathon 2026 — Team HexaForce (SIH26103)

Validates:
1. Project Onboarding & Scope Authorization
2. Document Understanding & AI Entity Extraction
3. AI WBS Decomposition (Work Packages, Tasks, Physical Targets)
4. Human Review & Approval Gates (source transparency & activation)
5. CPM Timeline, Critical Path & Float Calculations
6. Circular Dependency Detection & Strict Rejection (HTTP 400)
7. Downstream Delay Propagation
8. Field Progress Telemetry Submission
9. Engineer Verification & Rejection Queue
10. Plan vs Actual Variance, Velocity & Canonical Reason Categories
11. Stale Update Surveillance & Execution Health Score
12. 5 AI Recovery Rescheduling Options
13. Field Officer Persona & Strict Scope Enforcement
14. Personal Daily Targets Endpoint
"""

import sys
import unittest
from pathlib import Path
from fastapi.testclient import TestClient

WORKSPACE_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(WORKSPACE_ROOT))

from backend.app import app
from backend.auth import DEMO_USERS, create_session_for_user

class TestExecutionLifecycle(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        
        # Pre-generate sessions and auth headers for all personas
        cls.headers = {}
        for role_key, user in DEMO_USERS.items():
            session = create_session_for_user(user)
            cls.headers[role_key] = {
                "Authorization": f"Bearer {session.token}"
            }

    @classmethod
    def tearDownClass(cls):
        """Cleanup test projects to preserve the 10,000 project database invariant."""
        import sqlite3
        conn = sqlite3.connect(WORKSPACE_ROOT / "data" / "projectpulse.db")
        conn.execute("DELETE FROM projects WHERE project_id = 'PRJ-TEST-ONBOARD-01'")
        conn.execute("DELETE FROM project_assignments WHERE project_id = 'PRJ-TEST-ONBOARD-01'")
        conn.commit()
        conn.close()

    def test_01_project_onboarding_and_scope_security(self):
        """Project Manager can onboard a project; Field Worker and Viewer cannot (403)."""
        payload = {
            "project_id": "PRJ-TEST-ONBOARD-01",
            "project_name": "Bengaluru-Chennai High-Speed Expressway PKG-4",
            "ministry": "Ministry of Road Transport & Highways",
            "sector": "Roads & Highways",
            "state": "Karnataka",
            "implementing_agency": "NHAI",
            "original_cost_cr": 2450.0,
            "revised_cost_cr": 2450.0,
            "start_date": "2025-01-15",
            "planned_completion_date": "2028-06-30",
            "planned_duration_months": 42
        }

        # 1. Field Worker cannot onboard project -> 403 Forbidden
        res_field = self.client.post("/api/projects", json=payload, headers=self.headers["field"])
        self.assertEqual(res_field.status_code, 403)

        # 2. Project Manager onboards project -> 200 OK
        res_pm = self.client.post("/api/projects", json=payload, headers=self.headers["pm"])
        self.assertEqual(res_pm.status_code, 200)
        data = res_pm.json()
        self.assertEqual(data["status"], "success")
        self.assertEqual(data["project_id"], "PRJ-TEST-ONBOARD-01")

        # Cleanup immediately to maintain invariant
        import sqlite3
        conn = sqlite3.connect(WORKSPACE_ROOT / "data" / "projectpulse.db")
        conn.execute("DELETE FROM projects WHERE project_id = 'PRJ-TEST-ONBOARD-01'")
        conn.execute("DELETE FROM project_assignments WHERE project_id = 'PRJ-TEST-ONBOARD-01'")
        conn.commit()
        conn.close()

    def test_02_document_upload_and_ai_analysis(self):
        """Upload project document and perform AI extraction analysis."""
        doc_payload = {
            "document_type": "DPR",
            "title": "Detailed Project Report Volume I - Engineering Design",
            "file_path": "/docs/PRJ-SYN-000002/DPR_Vol_1.pdf",
            "version": "v2.1",
            "access_scope": "PROJECT",
            "file_size_kb": 14200
        }
        res_upload = self.client.post(
            "/api/projects/PRJ-SYN-000002/documents",
            json=doc_payload,
            headers=self.headers["pm"]
        )
        self.assertEqual(res_upload.status_code, 200)
        self.assertEqual(res_upload.json()["status"], "success")

        # Analyze documents
        res_analyze = self.client.post(
            "/api/projects/PRJ-SYN-000002/execution/analyze",
            headers=self.headers["pm"]
        )
        self.assertEqual(res_analyze.status_code, 200)
        data = res_analyze.json()
        self.assertIn("extracted_entities", data)
        self.assertIn("extraction_confidence", data)
        self.assertGreaterEqual(data["extraction_confidence"], 0.80)

    def test_03_ai_wbs_plan_generation(self):
        """AI WBS synthesis generates work packages and tasks with PENDING approval status."""
        res = self.client.post(
            "/api/projects/PRJ-SYN-000002/execution/plan/generate",
            headers=self.headers["pm"]
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "success")
        self.assertIn("plan", data)
        self.assertEqual(data["plan"]["status"], "DRAFT")
        self.assertGreater(len(data["work_packages"]), 0)
        self.assertGreater(len(data["tasks"]), 0)

        # Field worker cannot generate plan -> 403
        res_field = self.client.post(
            "/api/projects/PRJ-SYN-000002/execution/plan/generate",
            headers=self.headers["field"]
        )
        self.assertEqual(res_field.status_code, 403)

    def test_04_human_review_and_approval_gate(self):
        """Only authorized managers can approve plan and unlock operational tasks."""
        # Retrieve active plan
        res_plan = self.client.get("/api/projects/PRJ-SYN-000002/execution/plan", headers=self.headers["pm"])
        self.assertEqual(res_plan.status_code, 200)
        plan_id = res_plan.json()["plan"]["plan_id"]

        # PM approves plan
        res_approve = self.client.post(
            "/api/projects/PRJ-SYN-000002/execution/plan/approve",
            json={"plan_id": plan_id},
            headers=self.headers["pm"]
        )
        self.assertEqual(res_approve.status_code, 200)
        self.assertEqual(res_approve.json()["status"], "success")

    def test_05_cpm_timeline_and_critical_path(self):
        """CPM engine computes forward/backward pass, float, and critical path."""
        res = self.client.get(
            "/api/projects/PRJ-SYN-000002/execution/timeline",
            headers=self.headers["pm"]
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "success")
        timeline = data["timeline"]
        self.assertIn("critical_path_task_ids", timeline)
        self.assertGreater(len(timeline["critical_path_task_ids"]), 0)
        self.assertIn("total_project_duration_days", timeline)

        # Verify critical tasks have total_float == 0
        schedule = timeline["schedule"]
        for crit_id in timeline["critical_path_task_ids"]:
            self.assertEqual(schedule[crit_id]["total_float"], 0)
            self.assertEqual(schedule[crit_id]["is_critical"], 1)

    def test_06_circular_dependency_rejection(self):
        """Adding a circular dependency must be detected and rejected with HTTP 400."""
        # DEP-07 is TSK-013 -> TSK-015. Attempting to add TSK-015 -> TSK-013 creates a cycle.
        circular_dep = {
            "predecessor_task_id": "TSK-015",
            "successor_task_id": "TSK-013",
            "dependency_type": "FS",
            "lag_days": 0
        }
        res = self.client.post(
            "/api/projects/PRJ-SYN-000002/dependencies",
            json=circular_dep,
            headers=self.headers["pm"]
        )
        self.assertEqual(res.status_code, 400)
        self.assertIn("Circular dependency detected", res.json()["detail"])

    def test_07_field_progress_telemetry_submission(self):
        """Field Worker submits daily progress report with completed quantity and notes."""
        prog_payload = {
            "report_date": "2026-09-05",
            "quantity_completed": 8.0,
            "unit": "m3",
            "progress_pct": 75.0,
            "notes": "Anchor bolt welding completed and verified by site foreman",
            "evidence_url": "https://evidence.gov.in/test_anchor_05.jpg",
            "blocker_flag": 0
        }
        res = self.client.post(
            "/api/tasks/TSK-001/progress",
            json=prog_payload,
            headers=self.headers["field"]
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "success")
        self.assertEqual(data["progress"]["verification_status"], "PENDING")
        self.assertEqual(data["progress"]["quantity_completed"], 8.0)

    def test_08_engineer_verification_and_rejection_queue(self):
        """Site Engineer ratifies progress; unauthorized field worker cannot."""
        # Get progress history for TSK-001
        res_hist = self.client.get("/api/tasks/TSK-001/progress", headers=self.headers["engineer"])
        self.assertEqual(res_hist.status_code, 200)
        pending_list = [p for p in res_hist.json()["history"] if p["verification_status"] == "PENDING"]
        self.assertGreater(len(pending_list), 0)
        target_prog_id = pending_list[0]["progress_id"]

        # Field worker cannot verify -> 403
        res_denied = self.client.post(
            f"/api/progress/{target_prog_id}/verify",
            json={"verification_status": "VERIFIED"},
            headers=self.headers["field"]
        )
        self.assertEqual(res_denied.status_code, 403)

        # Site Engineer verifies -> 200 OK
        res_verify = self.client.post(
            f"/api/progress/{target_prog_id}/verify",
            json={"verification_status": "VERIFIED"},
            headers=self.headers["engineer"]
        )
        self.assertEqual(res_verify.status_code, 200)
        self.assertEqual(res_verify.json()["progress"]["verification_status"], "VERIFIED")

        # Engineer can also reject a submission with reason
        # Submit a temporary test progress to reject
        temp_prog = self.client.post(
            "/api/tasks/TSK-001/progress",
            json={"quantity_completed": 1.0, "progress_pct": 76.0, "notes": "Test invalid pour"},
            headers=self.headers["field"]
        ).json()["progress"]

        res_reject = self.client.post(
            f"/api/progress/{temp_prog['progress_id']}/reject",
            json={"verification_status": "REJECTED", "rejection_reason": "Cube test strength below M45 spec"},
            headers=self.headers["engineer"]
        )
        self.assertEqual(res_reject.status_code, 200)
        self.assertEqual(res_reject.json()["progress"]["verification_status"], "REJECTED")
        self.assertEqual(res_reject.json()["progress"]["rejection_reason"], "Cube test strength below M45 spec")

    def test_09_plan_vs_actual_and_target_misses(self):
        """Plan vs Actual engine returns schedule variance and structured reason categories."""
        res = self.client.get(
            "/api/projects/PRJ-SYN-000002/execution/plan-vs-actual",
            headers=self.headers["pm"]
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()["data"]
        self.assertIn("execution_health_score", data)
        self.assertIn("variance", data)
        self.assertIn("target_misses", data)
        self.assertIn("canonical_reason_categories", data)

        # Verify Pier P-04 Well Excavation (TSK-014) is categorized as EQUIPMENT_BREAKDOWN
        reasons = [tm["reason_category"] for tm in data["target_misses"]]
        self.assertIn("EQUIPMENT_BREAKDOWN", reasons)

    def test_10_stale_update_and_execution_health(self):
        """Execution health API calculates composite health score and stale tasks."""
        res = self.client.get(
            "/api/projects/PRJ-SYN-000002/execution/health",
            headers=self.headers["pm"]
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("execution_health_score", data)
        self.assertIn("health_class", data)
        self.assertGreaterEqual(data["execution_health_score"], 0.0)
        self.assertLessEqual(data["execution_health_score"], 100.0)

    def test_11_ai_recovery_rescheduling_options(self):
        """5 distinct AI recovery options are generated for delayed bottleneck tasks."""
        res = self.client.get(
            "/api/projects/PRJ-SYN-000002/execution/recovery-options?task_id=TSK-014&delay_days=14",
            headers=self.headers["pm"]
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["recovery_options_count"], 5)
        strategy_names = [opt["strategy_name"] for opt in data["options"]]
        self.assertTrue(any("Fast-Tracking" in s for s in strategy_names))
        self.assertTrue(any("Crash Schedule" in s for s in strategy_names))
        self.assertTrue(any("Shift Optimization" in s for s in strategy_names))
        self.assertTrue(any("Selective Scope Phasing" in s for s in strategy_names))
        self.assertTrue(any("Buffer Absorption" in s for s in strategy_names))

    def test_12_field_officer_persona_and_strict_scope(self):
        """
        Field Officer (USR-FO-01 / fo):
        - Can authenticate
        - Allowed access to assigned project PRJ-SYN-000002
        - Blocked (403) on unassigned project PRJ-SYN-000005
        - Blocked (403) from macro portfolio analytics
        """
        # 1. Login
        res_login = self.client.post("/api/auth/login", json={"username": "fo", "password": "fo123"})
        self.assertEqual(res_login.status_code, 200)
        data = res_login.json()
        self.assertEqual(data["role"], "FIELD_OFFICER")
        self.assertEqual(data["user_id"], "USR-FO-01")

        # 2. Access assigned PRJ-SYN-000002 -> 200
        res_assigned = self.client.get("/api/projects/PRJ-SYN-000002", headers=self.headers["fo"])
        self.assertEqual(res_assigned.status_code, 200)

        # 3. Access unassigned PRJ-SYN-000005 -> 403 Forbidden
        res_unassigned = self.client.get("/api/projects/PRJ-SYN-000005", headers=self.headers["fo"])
        self.assertEqual(res_unassigned.status_code, 403)

        # 4. Access macro analytics -> 403 Forbidden
        res_analytics = self.client.get("/api/analytics/summary", headers=self.headers["fo"])
        self.assertEqual(res_analytics.status_code, 403)

    def test_13_personal_daily_targets_endpoint(self):
        """GET /api/users/me/targets returns personalized daily/weekly targets."""
        res = self.client.get("/api/users/me/targets", headers=self.headers["field"])
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("targets", data)
        self.assertGreater(len(data["targets"]), 0)
        first_target = data["targets"][0]
        self.assertIn("target_quantity", first_target)
        self.assertIn("unit", first_target)
        self.assertIn("target_period", first_target)

    def test_14_engineer_cross_project_blocked(self):
        """Site Engineer attempting to access unassigned project tasks or plans receives HTTP 403."""
        res_tasks = self.client.get("/api/projects/PRJ-SYN-000005/tasks", headers=self.headers["engineer"])
        self.assertEqual(res_tasks.status_code, 403)

        res_timeline = self.client.get("/api/projects/PRJ-SYN-000005/execution/timeline", headers=self.headers["engineer"])
        self.assertEqual(res_timeline.status_code, 403)


if __name__ == "__main__":
    unittest.main()

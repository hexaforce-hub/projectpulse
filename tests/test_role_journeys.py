"""
ASTRA End-to-End Role Journeys Test Suite
Validates the complete end-to-end user workflows for all 8 official personas.
"""

import unittest
import sqlite3
import sys
from pathlib import Path
PROJECT_ROOT = Path(__file__).parent.parent.resolve()
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from fastapi.testclient import TestClient

from backend.app import app
from backend.auth import DEMO_USERS

DB_PATH = Path(__file__).parent.parent / "data" / "projectpulse.db"

class TestASTRAAllRoleJourneys(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        cls.tokens = {}
        for uname, udata in DEMO_USERS.items():
            res = cls.client.post("/api/auth/login", json={"username": uname, "password": udata["password"]})
            if res.status_code == 200:
                cls.tokens[uname] = res.json()["token"]

    def auth_headers(self, username):
        return {"Authorization": f"Bearer {self.tokens[username]}"}

    # -------------------------------------------------------------------------
    # JOURNEY 1: National Leader / Minister
    # -------------------------------------------------------------------------
    def test_journey_01_national_leader(self):
        h = self.auth_headers("minister")
        
        # 1. Executive Dashboard
        res = self.client.get("/api/dashboard/summary", headers=h)
        self.assertEqual(res.status_code, 200)
        dash = res.json()
        self.assertIn("tracked_projects_count", dash)
        self.assertIn("capital_at_risk_formatted", dash)

        # 2. Portfolio Risk Matrix
        res = self.client.get("/api/portfolio/matrix", headers=h)
        self.assertEqual(res.status_code, 200)
        self.assertIn("matrix", res.json())

        # 3. National Scope on Projects (PRJ-SYN-000001, 02, etc.)
        res = self.client.get("/api/projects/PRJ-SYN-000001", headers=h)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["project_id"], "PRJ-SYN-000001")

        # 4. TreeSHAP Explainability
        res = self.client.get("/api/projects/PRJ-SYN-000001/explain", headers=h)
        self.assertEqual(res.status_code, 200)
        self.assertIn("drivers", res.json())
        self.assertGreater(len(res.json()["drivers"]), 0)

        # 5. Issue Secretarial Directive
        res = self.client.post("/api/directives", json={
            "title": "Fast-Track Land Acquisition Priority",
            "instructions": "Expedite ROW clearance across Western Corridor PKG-3",
            "target_scope": "NATIONAL",
            "target_id": "ALL",
            "priority": "HIGH"
        }, headers=h)
        self.assertEqual(res.status_code, 200)
        self.assertIn("directive", res.json())
        self.assertIn("directive_id", res.json()["directive"])

        # 6. Flash Report Overview
        res = self.client.get("/api/reports/overview?snapshot_month=2026-07", headers=h)
        self.assertEqual(res.status_code, 200)
        self.assertIn("paimana_monitoring", res.json())
        self.assertIn("astra_intelligence", res.json())

    # -------------------------------------------------------------------------
    # JOURNEY 2: Ministry Official
    # -------------------------------------------------------------------------
    def test_journey_02_ministry_official(self):
        h = self.auth_headers("official")

        # 1. Ministry Summary
        res = self.client.get("/api/ministry/summary", headers=h)
        self.assertEqual(res.status_code, 200)

        # 2. Access MoRTH project (Allowed)
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute("SELECT project_id FROM projects WHERE ministry LIKE '%Road Transport%' LIMIT 1")
        morth_id = c.fetchone()[0]
        c.execute("SELECT project_id FROM projects WHERE ministry NOT LIKE '%Road Transport%' LIMIT 1")
        railway_id = c.fetchone()[0]
        conn.close()

        res_morth = self.client.get(f"/api/projects/{morth_id}", headers=h)
        self.assertEqual(res_morth.status_code, 200)

        # 3. Access foreign ministry project (Forbidden)
        res_railway = self.client.get(f"/api/projects/{railway_id}", headers=h)
        self.assertEqual(res_railway.status_code, 403)

    # -------------------------------------------------------------------------
    # JOURNEY 3: Senior Analyst
    # -------------------------------------------------------------------------
    def test_journey_03_senior_analyst(self):
        h = self.auth_headers("analyst")

        # 1. Analytics Summary
        res = self.client.get("/api/analytics/summary", headers=h)
        self.assertEqual(res.status_code, 200)

        # 2. Counterfactual Simulation
        res = self.client.post("/api/scenarios/simulate", json={
            "project_id": "PRJ-SYN-000001",
            "scenario_name": "Analyst Clearance Simulation",
            "modifications": [
                {
                    "feature": "primary_bottleneck",
                    "baseline_value": "LAND_ACQUISITION",
                    "scenario_value": "NONE",
                    "description": "Clearance resolved"
                }
            ]
        }, headers=h)
        self.assertEqual(res.status_code, 200)
        sim_data = res.json()
        self.assertIn("scenario_id", sim_data)
        self.assertIn("delta", sim_data)

        # 3. Sensitivity Analysis
        res = self.client.post("/api/scenarios/sensitivity", json={
            "project_id": "PRJ-SYN-000001",
            "feature": "physical_progress_pct",
            "points_count": 5
        }, headers=h)
        self.assertEqual(res.status_code, 200)
        self.assertIn("points", res.json())

        # 4. Analyst should be BLOCKED from audit logs
        res = self.client.get("/api/audit", headers=h)
        self.assertEqual(res.status_code, 403)

    # -------------------------------------------------------------------------
    # JOURNEY 4: Project Manager
    # -------------------------------------------------------------------------
    def test_journey_04_project_manager(self):
        h = self.auth_headers("pm")

        # 1. Access assigned project PRJ-SYN-000002
        res = self.client.get("/api/projects/PRJ-SYN-000002", headers=h)
        self.assertEqual(res.status_code, 200)

        # 2. Execution health and CPM timeline
        res = self.client.get("/api/projects/PRJ-SYN-000002/execution/health", headers=h)
        self.assertEqual(res.status_code, 200)

        res = self.client.get("/api/projects/PRJ-SYN-000002/execution/timeline", headers=h)
        self.assertEqual(res.status_code, 200)

        # 3. Recovery options
        res = self.client.get("/api/projects/PRJ-SYN-000002/execution/recovery-options", headers=h)
        self.assertEqual(res.status_code, 200)

        # 4. Access unassigned project (Forbidden)
        res = self.client.get("/api/projects/PRJ-SYN-000001", headers=h)
        self.assertEqual(res.status_code, 403)

    # -------------------------------------------------------------------------
    # JOURNEY 5 & 7: Site Engineer & Field Worker Interaction
    # -------------------------------------------------------------------------
    def test_journey_05_and_07_field_and_engineer(self):
        h_field = self.auth_headers("field")
        h_eng = self.auth_headers("engineer")

        # 1. Field Worker checks assigned daily tasks & targets
        res = self.client.get("/api/users/me/targets", headers=h_field)
        self.assertEqual(res.status_code, 200)
        targets = res.json()
        self.assertIn("targets", targets)
        self.assertGreater(len(targets["targets"]), 0)
        first_task = targets["targets"][0]
        task_id = first_task["task_id"]

        # 2. Field Worker submits daily progress report
        res_submit = self.client.post(f"/api/tasks/{task_id}/progress", json={
            "quantity_completed": 12.5,
            "unit": "meters",
            "progress_pct": 55.0,
            "notes": "Subgrade compaction completed for section KM 14+200."
        }, headers=h_field)
        self.assertEqual(res_submit.status_code, 200)
        prog_id = res_submit.json()["progress"]["progress_id"]

        # 3. Field Worker is BLOCKED from audit logs and analytics summary
        self.assertEqual(self.client.get("/api/audit", headers=h_field).status_code, 403)
        self.assertEqual(self.client.get("/api/analytics/summary", headers=h_field).status_code, 403)

        # 4. Site Engineer verifies the submitted progress report
        res_verify = self.client.post(f"/api/progress/{prog_id}/verify", json={
            "verification_status": "VERIFIED",
            "rejection_reason": None
        }, headers=h_eng)
        self.assertEqual(res_verify.status_code, 200)
        self.assertTrue(res_verify.json().get("success", True))

    # -------------------------------------------------------------------------
    # JOURNEY 6: Field Officer Inspection Desk
    # -------------------------------------------------------------------------
    def test_journey_06_field_officer(self):
        h_fo = self.auth_headers("fo")

        # 1. Field Officer views assigned project sites
        res = self.client.get("/api/projects/PRJ-SYN-000002/sites", headers=h_fo)
        self.assertEqual(res.status_code, 200)

        # 2. Field Officer views work packages
        res = self.client.get("/api/projects/PRJ-SYN-000002/work-packages", headers=h_fo)
        self.assertEqual(res.status_code, 200)

        # 3. Field Officer is BLOCKED from macro analytics
        self.assertEqual(self.client.get("/api/analytics/summary", headers=h_fo).status_code, 403)

    # -------------------------------------------------------------------------
    # JOURNEY 8: Central Administrator
    # -------------------------------------------------------------------------
    def test_journey_08_administrator(self):
        h_admin = self.auth_headers("admin")

        # 1. Audit Trail Surveillance
        res = self.client.get("/api/audit?page=1&page_size=20", headers=h_admin)
        self.assertEqual(res.status_code, 200)
        self.assertIn("logs", res.json())

        # 2. Data Quality Observatory
        res = self.client.get("/api/reports/data-quality?snapshot_month=2026-07", headers=h_admin)
        self.assertEqual(res.status_code, 200)
        dq_data = res.json()
        self.assertIn("total_flags_count", dq_data)
        self.assertIn("rules_summary", dq_data)

        # 3. Multi-Model Comparison
        res = self.client.get("/api/reports/models/comparison", headers=h_admin)
        self.assertEqual(res.status_code, 200)


if __name__ == "__main__":
    unittest.main()

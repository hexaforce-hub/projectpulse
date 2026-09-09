"""
PROJECTPULSE — Phase 9 End-to-End Decision Workflow & System Integration Tests
Ministry of Statistics & Programme Implementation (MoSPI) - IPMD
Smart India Hackathon 2026 — Team HexaForce

Validates complete institutional decision lifecycle:
1. Executive login & role-based dashboard surveillance
2. Risk-based filtering and drill-down into high-risk projects
3. Early warning radar detection, filtering, and operational triage
4. What-If counterfactual scenario simulation with quantitative deltas
5. Scenario persistence and project audit trail capture
6. Strict portfolio database immutability verification (10,000 project invariant)
"""

import unittest
from fastapi.testclient import TestClient
from backend.app import app
from database.db_client import DatabaseClient

class TestPhase9E2EWorkflow(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        cls.db = DatabaseClient()

    def test_database_invariants_pre_and_post(self):
        """Ensure project database count strictly remains 10,000 without corruption."""
        with self.db._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) as cnt FROM projects")
            count = cursor.fetchone()["cnt"]
            self.assertEqual(count, 10000, "Project catalog count must strictly be 10,000")

    def test_full_officer_decision_support_lifecycle(self):
        """
        Simulates the entire judge demonstration walkthrough:
        Dashboard -> Early Warning -> Triage -> Project Detail -> SHAP -> What-If Simulation -> Audit Log
        """
        # Step 1: Officer Login
        login_res = self.client.post("/api/auth/login", json={"username": "officer", "password": "officer123"})
        self.assertEqual(login_res.status_code, 200)
        officer = login_res.json()
        token = officer["token"]
        headers = {"Authorization": f"Bearer {token}"}
        self.assertEqual(officer["role"], "MONITORING_OFFICER")

        # Step 2: Access Macro Dashboard & Analytics
        dash_res = self.client.get("/api/dashboard/summary")
        self.assertEqual(dash_res.status_code, 200)
        dash_data = dash_res.json()
        self.assertEqual(dash_data["tracked_projects_count"], 10000)
        self.assertIn("risk_distribution", dash_data)
        self.assertIn("critical", dash_data["risk_distribution"])

        analytics_res = self.client.get("/api/analytics/summary")
        self.assertEqual(analytics_res.status_code, 200)
        analytics_data = analytics_res.json()
        self.assertIn("sectors", analytics_data)
        self.assertIn("bottlenecks", analytics_data)
        self.assertIn("states", analytics_data)

        # Step 3: Query Early Warning Radar for CRITICAL alerts
        alerts_res = self.client.get("/api/alerts?severity=CRITICAL&page=1&page_size=5")
        self.assertEqual(alerts_res.status_code, 200)
        alerts_page = alerts_res.json()
        self.assertTrue(len(alerts_page["items"]) > 0)
        critical_alert = alerts_page["items"][0]
        alert_id = critical_alert["alert_id"]
        target_project_id = critical_alert["project_id"]

        # Step 4: Triage the Alert (Transition from OPEN to UNDER REVIEW)
        triage_res = self.client.patch(
            f"/api/alerts/{alert_id}/status",
            json={"status": "UNDER REVIEW", "notes": "Escalated to Empowered Committee in weekly review"},
            headers=headers
        )
        self.assertEqual(triage_res.status_code, 200)
        self.assertEqual(triage_res.json()["new_status"], "UNDER REVIEW")

        # Step 5: Drill Down into Target Project Detail & TreeSHAP Drivers
        proj_res = self.client.get(f"/api/projects/{target_project_id}?include_shap=true")
        self.assertEqual(proj_res.status_code, 200)
        project_data = proj_res.json()
        self.assertEqual(project_data["project_id"], target_project_id)
        self.assertIn("risk", project_data)
        self.assertIn("drivers", project_data["risk"])
        self.assertTrue(len(project_data["risk"]["drivers"]) >= 3)
        self.assertIn("milestones", project_data)

        # Step 6: Run What-If Counterfactual Intervention Simulation
        sim_payload = {
            "project_id": target_project_id,
            "scenario_name": "MoSPI Inter-Ministerial Fast-Track Clearance",
            "modifications": [
                {"feature": "primary_bottleneck", "scenario_value": "NONE"}
            ]
        }
        sim_res = self.client.post("/api/scenarios/simulate", json=sim_payload, headers=headers)
        self.assertEqual(sim_res.status_code, 200)
        sim_result = sim_res.json()
        self.assertIn("baseline", sim_result)
        self.assertIn("scenario", sim_result)
        self.assertIn("delta", sim_result)
        scn_id = sim_result["scenario_id"]

        # Step 7: Save Scenario to Project File
        save_res = self.client.post(f"/api/scenarios/{scn_id}/save", json=sim_result, headers=headers)
        self.assertEqual(save_res.status_code, 200)
        self.assertEqual(save_res.json()["status"], "success")

        # Step 8: Verify Project Scenarios List
        scenarios_list_res = self.client.get(f"/api/projects/{target_project_id}/scenarios")
        self.assertEqual(scenarios_list_res.status_code, 200)
        scenarios = scenarios_list_res.json()
        self.assertTrue(any(s["scenario_id"] == scn_id for s in scenarios))

        # Step 9: Verify Institutional Audit Log captured the actions
        audit_res = self.client.get(f"/api/projects/{target_project_id}/history")
        self.assertEqual(audit_res.status_code, 200)
        history = audit_res.json()
        self.assertTrue(len(history) > 0)
        # Should show the alert update and/or scenario save
        self.assertTrue(any(alert_id in h.get("details", "") or "SCENARIO" in h.get("action", "") for h in history))

        # Step 10: Verify Database Count Invariant Preserved
        with self.db._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) as cnt FROM projects")
            count = cursor.fetchone()["cnt"]
            self.assertEqual(count, 10000)

    def test_hero_demo_project_integrity(self):
        """Validates that signature Hero Demo PRJ-DEMO-001 resolves accurately with TreeSHAP and metrics."""
        res = self.client.get("/api/projects/PRJ-DEMO-001?include_shap=true")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["project_id"], "PRJ-DEMO-001")
        self.assertTrue("Dedicated Freight Corridor" in data["project_name"] or "Expressway" in data["project_name"] or "Metro" in data["project_name"] or len(data["project_name"]) > 5)
        self.assertIn("risk", data)
        self.assertIn("drivers", data["risk"])
        self.assertIn("milestones", data)
        self.assertIn("progress_gap_pct", data["progress"])

if __name__ == "__main__":
    unittest.main()

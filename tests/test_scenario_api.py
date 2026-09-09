"""
ProjectPulse — Unit Tests: Scenario REST API Endpoints (Phase 7)
Verifies FastAPI endpoints for simulation, sensitivity analysis,
catalog retrieval, scenario persistence, and comparison.
"""

import sys
import unittest
from pathlib import Path
from fastapi.testclient import TestClient

PROJECT_ROOT = Path(__file__).parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.app import app

class TestScenarioAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        cls.project_id = "PRJ-SYN-002078"

    def test_catalog_endpoint(self):
        resp = self.client.get("/api/scenarios/catalog")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["status"], "success")
        self.assertGreater(len(data["categories"]), 0)
        self.assertGreater(len(data["presets"]), 0)
        self.assertIn("disclaimers", data)

    def test_simulate_endpoint_success(self):
        payload = {
            "project_id": self.project_id,
            "scenario_name": "API Fast-Track Clearance",
            "modifications": [
                {"feature": "primary_bottleneck", "scenario_value": "NONE"}
            ]
        }
        resp = self.client.post("/api/scenarios/simulate", json=payload)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertTrue(data["scenario_id"].startswith("SCN-"))
        self.assertEqual(data["status"], "SIMULATED")
        self.assertIn("baseline", data)
        self.assertIn("scenario", data)
        self.assertIn("delta", data)

    def test_simulate_endpoint_project_not_found(self):
        payload = {
            "project_id": "PRJ-NONEXISTENT-9999",
            "modifications": [{"feature": "primary_bottleneck", "scenario_value": "NONE"}]
        }
        resp = self.client.post("/api/scenarios/simulate", json=payload)
        self.assertEqual(resp.status_code, 404)

    def test_simulate_endpoint_forbidden_target_validation(self):
        payload = {
            "project_id": self.project_id,
            "modifications": [{"feature": "revised_cost_cr", "scenario_value": 500.0}]
        }
        resp = self.client.post("/api/scenarios/simulate", json=payload)
        self.assertEqual(resp.status_code, 422)

    def test_sensitivity_endpoint_success(self):
        payload = {
            "project_id": self.project_id,
            "feature": "milestones_delayed",
            "points_count": 5
        }
        resp = self.client.post("/api/scenarios/sensitivity", json=payload)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["project_id"], self.project_id)
        self.assertEqual(len(data["points"]), 5)

    def test_save_and_get_and_delete_scenario_api(self):
        # 1. Simulate
        sim_payload = {
            "project_id": self.project_id,
            "scenario_name": "API Persistence Test",
            "modifications": [{"feature": "primary_bottleneck", "scenario_value": "NONE"}]
        }
        sim_resp = self.client.post("/api/scenarios/simulate", json=sim_payload)
        self.assertEqual(sim_resp.status_code, 200)
        scn_data = sim_resp.json()
        scn_id = scn_data["scenario_id"]

        # 2. Save
        save_resp = self.client.post(f"/api/scenarios/{scn_id}/save", json=scn_data)
        self.assertEqual(save_resp.status_code, 200)

        # 3. Get Project Scenarios
        list_resp = self.client.get(f"/api/projects/{self.project_id}/scenarios")
        self.assertEqual(list_resp.status_code, 200)
        scenarios_list = list_resp.json()
        self.assertTrue(any(s["scenario_id"] == scn_id for s in scenarios_list))

        # 4. Get by Scenario ID
        get_resp = self.client.get(f"/api/scenarios/{scn_id}")
        self.assertEqual(get_resp.status_code, 200)
        self.assertEqual(get_resp.json()["scenario_name"], "API Persistence Test")

        # 5. Delete
        del_resp = self.client.delete(f"/api/scenarios/{scn_id}")
        self.assertEqual(del_resp.status_code, 200)

        # 6. Verify 404 after deletion
        get_after_del = self.client.get(f"/api/scenarios/{scn_id}")
        self.assertEqual(get_after_del.status_code, 404)

    def test_compare_endpoint(self):
        # Simulate 2 scenarios
        sim_a = self.client.post("/api/scenarios/simulate", json={
            "project_id": self.project_id,
            "scenario_name": "A",
            "modifications": [{"feature": "primary_bottleneck", "scenario_value": "NONE"}]
        }).json()

        sim_b = self.client.post("/api/scenarios/simulate", json={
            "project_id": self.project_id,
            "scenario_name": "B",
            "modifications": [{"feature": "milestones_delayed", "scenario_value": 0}]
        }).json()

        compare_resp = self.client.post("/api/scenarios/compare", json={
            "project_id": self.project_id,
            "scenarios": [sim_a, sim_b]
        })
        self.assertEqual(compare_resp.status_code, 200)
        comp_data = compare_resp.json()
        self.assertEqual(comp_data["compared_count"], 2)
        self.assertIn("lowest_modeled_risk_scenario", comp_data)

if __name__ == "__main__":
    unittest.main()

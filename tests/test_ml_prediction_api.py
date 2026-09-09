"""
ProjectPulse — Unit Tests: Prediction API Endpoints (Phase 4)
Verifies FastAPI endpoints for single project, arbitrary snapshot POST, portfolio, and health checks.
"""

import sys
import unittest
from pathlib import Path
from fastapi.testclient import TestClient

PROJECT_ROOT = Path(__file__).parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.app import app

class TestPredictionAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_predictions_health_endpoint(self):
        resp = self.client.get("/api/predictions/health")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["status"], "healthy")
        self.assertTrue(data["models_loaded"]["schedule_classifier"])
        self.assertTrue(data["models_loaded"]["cost_classifier"])
        self.assertTrue(data["models_loaded"]["risk_classifier"])

    def test_models_registry_endpoint(self):
        resp = self.client.get("/api/models")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["status"], "success")
        self.assertIn("schedule", data["active_models"])
        self.assertIn("cost", data["active_models"])
        self.assertIn("implementation", data["active_models"])

    def test_get_project_prediction_success(self):
        # Using known project ID in SQLite DB
        resp = self.client.get("/api/predictions/project/PRJ-SYN-002078")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["project_id"], "PRJ-SYN-002078")
        self.assertIn("overall_risk_score", data)
        self.assertIn("overall_risk_band", data)
        self.assertIn("schedule", data)
        self.assertIn("cost", data)
        self.assertIn("implementation", data)

    def test_get_project_prediction_not_found(self):
        resp = self.client.get("/api/predictions/project/PRJ-NONEXISTENT-9999")
        self.assertEqual(resp.status_code, 404)

    def test_post_project_prediction_success(self):
        payload = {
            "project_id": "PRJ-AD-HOC-100",
            "project_name": "Metro Rail Phase 3 Extension",
            "ministry": "Ministry of Housing and Urban Affairs",
            "sector": "Urban Development",
            "state": "Karnataka",
            "region": "Southern",
            "implementing_agency": "BMRCL",
            "project_type": "Greenfield",
            "primary_bottleneck": "LAND_ACQUISITION",
            "original_cost_cr": 12500.0,
            "planned_duration_months": 60,
            "project_age_months": 36,
            "cumulative_expenditure_cr": 7200.0,
            "physical_progress_pct": 42.0,
            "milestone_count": 24,
            "milestones_completed": 8,
            "milestones_delayed": 6,
            "milestones_at_risk": 4
        }
        resp = self.client.post("/api/predictions/project", json=payload)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["project_id"], "PRJ-AD-HOC-100")
        self.assertGreaterEqual(data["overall_risk_score"], 0.0)
        self.assertIn(data["overall_risk_band"], ["LOW", "MODERATE", "HIGH", "CRITICAL"])

    def test_post_project_prediction_validation_error(self):
        # Invalid original_cost_cr (negative)
        payload = {
            "original_cost_cr": -50.0,
            "planned_duration_months": 0
        }
        resp = self.client.post("/api/predictions/project", json=payload)
        self.assertEqual(resp.status_code, 422)

    def test_get_portfolio_predictions(self):
        resp = self.client.get("/api/predictions/portfolio?page=1&page_size=10")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("summary", data)
        self.assertIn("predictions", data)
        self.assertEqual(len(data["predictions"]), 10)
        self.assertGreater(data["total"], 0)

if __name__ == "__main__":
    unittest.main()

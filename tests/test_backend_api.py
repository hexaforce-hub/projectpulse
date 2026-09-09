"""
Unit & Integration Test Suite for Phase 8 FastAPI Backend & Offline Hardening
Smart India Hackathon 2026 — Team HexaForce
MoSPI IPMD / PAIMANA Endpoints & Decision Intelligence API
"""

import sys
import time
import unittest
from pathlib import Path

from fastapi.testclient import TestClient

# Add workspace root to sys.path
WORKSPACE_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(WORKSPACE_ROOT))

from backend.app import app

class TestPhase8BackendAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_health_check(self):
        """Verify GET /api/health returns healthy system status and loaded models."""
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "healthy")
        self.assertEqual(data["database"]["status"], "connected")
        self.assertEqual(data["ml_engines"]["risk_classifier"], "loaded")
        self.assertEqual(data["ml_engines"]["treeshap_explainer"], "ready")

    def test_dashboard_summary(self):
        """Verify GET /api/dashboard/summary returns portfolio aggregations for 10,000 projects."""
        response = self.client.get("/api/dashboard/summary")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["tracked_projects_count"], 10000)
        self.assertIn("risk_distribution", data)
        self.assertGreater(data["risk_distribution"]["critical"], 500)
        self.assertGreater(data["total_revised_cost_raw"], 1000000.0)

    def test_analytics_summary(self):
        """Verify GET /api/analytics/summary returns multidimensional aggregations."""
        response = self.client.get("/api/analytics/summary")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("sectors", data)
        self.assertIn("ministries", data)
        self.assertIn("bottlenecks", data)
        self.assertGreater(len(data["sectors"]), 3)

    def test_list_projects_pagination(self):
        """Verify GET /api/projects pagination and items structure."""
        response = self.client.get("/api/projects?page=1&page_size=15")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["total_records"], 10000)
        self.assertEqual(len(data["items"]), 15)
        self.assertEqual(data["page"], 1)

    def test_list_projects_filtering(self):
        """Verify GET /api/projects filtering by risk tier."""
        response = self.client.get("/api/projects?risk_level=CRITICAL&page_size=10")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertGreater(data["total_records"], 0)
        for item in data["items"]:
            self.assertEqual(item["risk"]["level"], "CRITICAL")

    def test_project_detail_with_shap(self):
        """Verify GET /api/projects/{id} returns relational record and TreeSHAP explainability."""
        response = self.client.get("/api/projects/PRJ-SYN-000001?include_shap=true")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["project_id"], "PRJ-SYN-000001")
        self.assertIn("milestones", data)
        self.assertIn("risk", data)
        self.assertIn("drivers", data["risk"])
        self.assertGreaterEqual(len(data["risk"]["drivers"]), 3)

    def test_project_detail_404(self):
        """Verify GET /api/projects/{invalid_id} returns 404."""
        response = self.client.get("/api/projects/PRJ-DOES-NOT-EXIST")
        self.assertEqual(response.status_code, 404)

    def test_alerts_endpoint(self):
        """Verify GET /api/alerts returns active radar signals."""
        response = self.client.get("/api/alerts?page=1&page_size=20&severity=CRITICAL")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertGreaterEqual(data["total_records"], 100)
        self.assertEqual(len(data["items"]), 20)
        for alert in data["items"]:
            self.assertEqual(alert["severity"], "CRITICAL")

    def test_simulate_endpoint(self):
        """Verify POST /api/simulate runs prescriptive what-if intervention."""
        payload = {
            "project_id": "PRJ-SYN-000001",
            "resolve_bottleneck": True,
            "infuse_contractor_support": True,
            "reschedule_milestones": True,
            "progress_boost_pct": 5.0
        }
        response = self.client.post("/api/simulate", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("baseline", data)
        self.assertIn("simulated", data)
        self.assertIn("impact", data)
        self.assertGreaterEqual(data["impact"]["risk_score_reduction"], 0.0)
        self.assertIn("➔", data["impact"]["tier_transition"])

    def test_static_dashboard_serving(self):
        """Verify GET / serves the HTML single-page dashboard."""
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        self.assertIn("text/html", response.headers.get("content-type", ""))
        self.assertIn("ProjectPulse", response.text)

    def test_api_latency_benchmark(self):
        """Benchmark: 50 API requests execute in under 1.5s (<30ms per request)."""
        t0 = time.time()
        for _ in range(50):
            res = self.client.get("/api/dashboard/summary")
            self.assertEqual(res.status_code, 200)
        elapsed = time.time() - t0
        avg_ms = (elapsed / 50.0) * 1000
        self.assertLess(elapsed, 1.50, f"50 API requests took {elapsed:.2f}s (avg {avg_ms:.2f}ms)")
        print(f"\n[FastAPI Benchmark] 50 API requests completed in {elapsed*1000:.2f}ms (Average: {avg_ms:.2f}ms / request)")

if __name__ == "__main__":
    unittest.main()

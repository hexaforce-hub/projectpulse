"""
Unit & Integration Test Suite for Phase 9 Frontend-Backend Integration
Smart India Hackathon 2026 — Team HexaForce
MoSPI IPMD / PAIMANA End-to-End System Integration Verification
"""

import re
import sys
import time
import unittest
from pathlib import Path

from fastapi.testclient import TestClient

# Add workspace root to sys.path
WORKSPACE_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(WORKSPACE_ROOT))

from backend.app import app

class TestPhase9FrontendBackendIntegration(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_static_assets_serving(self):
        """Verify FastAPI serves all critical frontend assets for offline single-command execution."""
        endpoints = [
            ("/", 200, "text/html"),
            ("/css/design-system.css", 200, "text/css"),
            ("/js/types.js", 200, "text/javascript"),
            ("/js/formatters.js", 200, "text/javascript"),
            ("/js/mockData.js", 200, "text/javascript"),
            ("/js/api-client.js", 200, "text/javascript"),
            ("/js/components/common.js", 200, "text/javascript"),
            ("/js/components/DashboardView.js", 200, "text/javascript"),
            ("/js/components/ProjectsView.js", 200, "text/javascript"),
            ("/js/components/ProjectDetailView.js", 200, "text/javascript"),
            ("/js/components/EarlyWarningsView.js", 200, "text/javascript"),
            ("/js/components/AnalyticsView.js", 200, "text/javascript"),
            ("/js/components/AppShell.js", 200, "text/javascript"),
            ("/js/router.js", 200, "text/javascript")
        ]
        
        for path, expected_status, content_type_prefix in endpoints:
            with self.subTest(path=path):
                res = self.client.get(path)
                self.assertEqual(res.status_code, expected_status, f"Failed to serve {path}")
                ct = res.headers.get("content-type", "")
                self.assertTrue(
                    content_type_prefix in ct or "application/javascript" in ct or "text/plain" in ct,
                    f"Unexpected content-type '{ct}' for {path}"
                )

    def test_api_client_contract_in_js(self):
        """Verify js/api-client.js contains all required methods and properties."""
        client_file = WORKSPACE_ROOT / "js" / "api-client.js"
        self.assertTrue(client_file.exists(), "js/api-client.js must exist")
        content = client_file.read_text(encoding="utf-8")
        
        required_tokens = [
            "APIClient", "init", "getDashboardSummary", "getProjects",
            "getProject", "getAlerts", "simulate", "fallbackSimulate",
            "window.APIClient = APIClient"
        ]
        for token in required_tokens:
            self.assertIn(token, content, f"Missing required token '{token}' in js/api-client.js")

    def test_index_html_integration_order(self):
        """Verify index.html imports api-client.js before UI components."""
        index_file = WORKSPACE_ROOT / "index.html"
        content = index_file.read_text(encoding="utf-8")
        
        api_idx = content.find("js/api-client.js")
        common_idx = content.find("js/components/common.js")
        router_idx = content.find("js/router.js")
        
        self.assertGreater(api_idx, 0, "api-client.js must be imported in index.html")
        self.assertLess(api_idx, common_idx, "api-client.js must be imported before components")
        self.assertLess(common_idx, router_idx, "common.js must be imported before router.js")

    def test_project_detail_simulation_roundtrip(self):
        """Verify full simulation lifecycle through /api/simulate for ProjectDetailView."""
        payload = {
            "project_id": "PRJ-SYN-000001",
            "resolve_bottleneck": True,
            "infuse_contractor_support": True,
            "reschedule_milestones": True,
            "progress_boost_pct": 5.0,
            "decoupling_reduction_pct": 10.0,
            "milestone_recovery_pct": 0.5
        }
        res = self.client.post("/api/simulate", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        
        self.assertIn("baseline", data)
        self.assertIn("simulated", data)
        self.assertIn("impact", data)
        self.assertGreater(data["impact"]["risk_score_reduction"], 0.0)
        self.assertGreater(data["impact"]["capital_saved_cr"], 0.0)
        self.assertGreater(data["impact"]["total_economic_benefit_cr"], 0.0)
        self.assertEqual(data["impact"]["recommendation_level"], "HIGH_PRIORITY_INTERVENTION")

    def test_treeshap_enrichment_in_detail_route(self):
        """Verify that GET /api/projects/{id}?include_shap=true returns TreeSHAP drivers."""
        res = self.client.get("/api/projects/PRJ-SYN-000002?include_shap=true")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        
        self.assertIn("risk", data)
        self.assertIn("drivers", data["risk"])
        self.assertGreaterEqual(len(data["risk"]["drivers"]), 3)
        self.assertIn("strength_pct", data["risk"]["drivers"][0])
        self.assertIn("evidence", data["risk"]["drivers"][0])

    def test_end_to_end_latency_benchmark(self):
        """Benchmark: 30 combined UI asset + API fetches execute in under 1.0s (<33ms avg)."""
        t0 = time.time()
        for i in range(15):
            r1 = self.client.get("/api/dashboard/summary")
            self.assertEqual(r1.status_code, 200)
            r2 = self.client.get("/api/projects?page=1&page_size=5")
            self.assertEqual(r2.status_code, 200)
        elapsed = time.time() - t0
        avg_ms = (elapsed / 30.0) * 1000
        self.assertLess(elapsed, 1.0, f"30 roundtrips took {elapsed:.2f}s (avg {avg_ms:.2f}ms)")
        print(f"\n[Integration Benchmark] 30 end-to-end cycles completed in {elapsed*1000:.2f}ms (Average: {avg_ms:.2f}ms / cycle)")

if __name__ == "__main__":
    unittest.main()

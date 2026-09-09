"""
PROJECTPULSE — Phase 9.5 Portfolio Matrix & Advanced Explorer Test Suite
Ministry of Statistics & Programme Implementation (MoSPI) - IPMD
Smart India Hackathon 2026 — Team HexaForce
"""

import sys
from pathlib import Path
PROJECT_ROOT = Path(__file__).parent.parent.resolve()
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import unittest
from fastapi.testclient import TestClient
from backend.app import app
from database.db_client import DatabaseClient

class TestPhase95MatrixAndFilters(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        cls.db = DatabaseClient()

    def test_portfolio_matrix_endpoint(self):
        """Validates that /api/portfolio/matrix returns coordinates for Risk vs Exposure scatter."""
        res = self.client.get("/api/portfolio/matrix?limit=50")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "success")
        matrix = data["matrix"]
        self.assertGreater(len(matrix), 0)
        self.assertLessEqual(len(matrix), 50)
        
        sample = matrix[0]
        self.assertIn("project_id", sample)
        self.assertIn("revised_cost_cr", sample)
        self.assertIn("overall_risk_score", sample)
        self.assertIn("target_risk_class", sample)
        self.assertIn("primary_bottleneck", sample)

    def test_list_projects_bottleneck_filter(self):
        """Validates filtering project catalog by primary bottleneck."""
        res = self.client.get("/api/projects?bottleneck=land_acquisition&page_size=10")
        self.assertEqual(res.status_code, 200)
        items = res.json()["items"]
        self.assertGreater(len(items), 0)
        for p in items:
            self.assertEqual(p["primary_bottleneck"].lower(), "land_acquisition")

    def test_list_projects_state_filter(self):
        """Validates filtering project catalog by state."""
        res = self.client.get("/api/projects?state=Maharashtra&page_size=10")
        self.assertEqual(res.status_code, 200)
        items = res.json()["items"]
        self.assertGreater(len(items), 0)
        for p in items:
            self.assertEqual(p["state"], "Maharashtra")

    def test_database_count_invariant(self):
        """Ensure 10,000 project count remains strictly intact."""
        with self.db._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) as cnt FROM projects")
            count = cursor.fetchone()["cnt"]
            self.assertEqual(count, 10000)

if __name__ == "__main__":
    unittest.main()

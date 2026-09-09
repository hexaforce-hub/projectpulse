"""
Unit & Performance Test Suite for Phase 3 Database Layer
Smart India Hackathon 2026 — Team HexaForce
MoSPI IPMD / PAIMANA Architecture
"""

import sys
import time
import unittest
from pathlib import Path

# Add workspace root to sys.path
WORKSPACE_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(WORKSPACE_ROOT))

from database.db_client import DatabaseClient

class TestPhase3DatabaseLayer(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.db_path = WORKSPACE_ROOT / "data" / "projectpulse.db"
        cls.client = DatabaseClient(db_path=cls.db_path)

    def test_database_file_exists(self):
        """Verify the SQLite database file exists and is populated."""
        self.assertTrue(self.db_path.exists(), "Database file data/projectpulse.db must exist")
        self.assertGreater(self.db_path.stat().st_size, 10 * 1024 * 1024, "Database size should exceed 10MB")

    def test_table_record_counts(self):
        """Verify table counts match the 10,000 project foundation."""
        with self.client._get_connection() as conn:
            cursor = conn.cursor()
            
            cursor.execute("SELECT COUNT(*) FROM projects")
            p_count = cursor.fetchone()[0]
            self.assertEqual(p_count, 10000, "Projects count must be exactly 10,000")
            
            cursor.execute("SELECT COUNT(*) FROM project_milestones")
            m_count = cursor.fetchone()[0]
            self.assertEqual(m_count, 100000, "Milestones count must be exactly 100,000")
            
            cursor.execute("SELECT COUNT(*) FROM project_progress")
            prog_count = cursor.fetchone()[0]
            self.assertEqual(prog_count, 9000, "Progress records count must be exactly 9,000")
            
            cursor.execute("SELECT COUNT(*) FROM alerts")
            alert_count = cursor.fetchone()[0]
            self.assertGreaterEqual(alert_count, 1000, "Alerts count should exceed 1,000")

    def test_relational_referential_integrity(self):
        """Verify zero orphan records across all child tables."""
        with self.client._get_connection() as conn:
            cursor = conn.cursor()
            
            # Orphan milestones check
            cursor.execute("""
                SELECT COUNT(*) FROM project_milestones m
                LEFT JOIN projects p ON m.project_id = p.project_id
                WHERE p.project_id IS NULL
            """)
            orphan_m = cursor.fetchone()[0]
            self.assertEqual(orphan_m, 0, "There must be zero orphan milestones")
            
            # Orphan progress check
            cursor.execute("""
                SELECT COUNT(*) FROM project_progress pr
                LEFT JOIN projects p ON pr.project_id = p.project_id
                WHERE p.project_id IS NULL
            """)
            orphan_pr = cursor.fetchone()[0]
            self.assertEqual(orphan_pr, 0, "There must be zero orphan progress records")
            
            # Orphan alerts check
            cursor.execute("""
                SELECT COUNT(*) FROM alerts a
                LEFT JOIN projects p ON a.project_id = p.project_id
                WHERE p.project_id IS NULL
            """)
            orphan_a = cursor.fetchone()[0]
            self.assertEqual(orphan_a, 0, "There must be zero orphan alerts")

    def test_dashboard_summary_contract(self):
        """Verify get_dashboard_summary() matches DATA_CONTRACT.md format."""
        summary = self.client.get_dashboard_summary()
        
        self.assertEqual(summary["tracked_projects_count"], 10000)
        self.assertIn("total_revised_cost_formatted", summary)
        self.assertIn("capital_at_risk_formatted", summary)
        self.assertIn("risk_distribution", summary)
        
        dist = summary["risk_distribution"]
        total_dist = dist["low"] + dist["moderate"] + dist["high"] + dist["critical"]
        self.assertEqual(total_dist, 10000, "Risk distribution sum must equal total projects")
        self.assertEqual(summary["metadata"]["data_status"], "SYNTHETIC")

    def test_list_projects_pagination_and_filter(self):
        """Verify multi-criteria filtering, pagination, and response timing."""
        t0 = time.time()
        res = self.client.list_projects(
            page=1,
            page_size=15,
            ministry="Ministry of Road Transport & Highways",
            risk_level="HIGH"
        )
        elapsed_ms = (time.time() - t0) * 1000
        
        self.assertLess(elapsed_ms, 30.0, f"Filtered query took {elapsed_ms:.2f}ms (target < 30ms)")
        self.assertGreater(res["total_records"], 0)
        self.assertEqual(len(res["items"]), 15)
        self.assertEqual(res["page"], 1)
        
        for p in res["items"]:
            self.assertEqual(p["ministry"], "Ministry of Road Transport & Highways")
            self.assertEqual(p["risk"]["level"], "HIGH")

    def test_get_project_detail_conformance(self):
        """Verify get_project(id) returns full entity with milestones matching DATA_CONTRACT.md."""
        p = self.client.get_project("PRJ-SYN-000001")
        
        self.assertIsNotNone(p)
        self.assertEqual(p["project_id"], "PRJ-SYN-000001")
        self.assertIn("financials", p)
        self.assertIn("progress", p)
        self.assertIn("schedule", p)
        self.assertIn("milestones", p)
        self.assertIn("risk", p)
        self.assertEqual(len(p["milestones"]), 10, "Each project must have 10 detailed milestones")
        
        m1 = p["milestones"][0]
        self.assertIn("id", m1)
        self.assertIn("name", m1)
        self.assertIn("status", m1)
        self.assertIn("dependency", m1)

    def test_list_alerts(self):
        """Verify list_alerts() returns ordered early warning signals."""
        alerts = self.client.list_alerts(page=1, page_size=20, severity="CRITICAL")
        self.assertGreater(alerts["total_records"], 0)
        self.assertEqual(len(alerts["items"]), 20)
        for a in alerts["items"]:
            self.assertEqual(a["severity"], "CRITICAL")
            self.assertIn("signal", a)

    def test_analytics_summary(self):
        """Verify portfolio aggregations across sectors, ministries, and bottlenecks."""
        analytics = self.client.get_analytics_summary()
        self.assertIn("sectors", analytics)
        self.assertIn("ministries", analytics)
        self.assertIn("bottlenecks", analytics)
        self.assertIn("states", analytics)
        
        self.assertGreaterEqual(len(analytics["sectors"]), 8)
        self.assertEqual(len(analytics["ministries"]), 9)
        self.assertGreaterEqual(len(analytics["bottlenecks"]), 10)

    def test_indexed_query_latency_performance(self):
        """Benchmark: 100 random indexed lookups must execute in under 0.25s (<2.5ms average)."""
        import random
        random_ids = [f"PRJ-SYN-{random.randint(1, 10000):06d}" for _ in range(100)]
        
        t0 = time.time()
        for pid in random_ids:
            proj = self.client.get_project(pid)
            self.assertIsNotNone(proj)
        total_time = time.time() - t0
        avg_ms = (total_time / 100.0) * 1000
        
        self.assertLess(total_time, 0.25, f"100 lookups took {total_time:.3f}s (avg {avg_ms:.2f}ms)")
        print(f"\n[Performance Benchmark] 100 indexed lookups completed in {total_time*1000:.1f}ms (Average: {avg_ms:.2f}ms / query)")

if __name__ == "__main__":
    unittest.main()

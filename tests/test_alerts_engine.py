"""
Unit & Integration Test Suite for Phase 6 Early Warning Signals Engine
Smart India Hackathon 2026 — Team HexaForce
MoSPI IPMD / PAIMANA Early Warning Radar Architecture
"""

import sqlite3
import sys
import time
import unittest
from pathlib import Path

# Add workspace root to sys.path
WORKSPACE_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(WORKSPACE_ROOT))

from ml.alerts_engine import EarlyWarningEngine

class TestPhase6EarlyWarningEngine(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.db_path = WORKSPACE_ROOT / "data" / "projectpulse.db"
        cls.engine = EarlyWarningEngine(db_path=cls.db_path)

    def test_decoupling_gap_trigger(self):
        """Verify Signal 1: Financial-Physical Decoupling Alarm triggers correctly."""
        p_decoupled = {
            "project_id": "PRJ-TEST-001",
            "project_name": "Test Decoupled Highway Project",
            "progress_decoupling_gap": 32.5,
            "physical_progress_pct": 35.0,
            "financial_progress_pct": 67.5,
            "cumulative_expenditure_cr": 800.0,
            "revised_cost_cr": 1200.0,
            "milestones_delayed": 0,
            "milestone_delay_rate": 0.0,
            "target_risk_class": "MODERATE",
            "primary_bottleneck": "NONE"
        }
        
        alerts = self.engine.evaluate_project(p_decoupled)
        self.assertGreaterEqual(len(alerts), 1)
        
        dec_alerts = [a for a in alerts if a["trigger_type"] == "DECOUPLING_GAP"]
        self.assertEqual(len(dec_alerts), 1)
        self.assertEqual(dec_alerts[0]["severity"], "CRITICAL")
        self.assertIn("+32.5", dec_alerts[0]["signal"])
        self.assertIn("reconciliation audit", dec_alerts[0]["recommended_action"])

    def test_milestone_cascade_trigger(self):
        """Verify Signal 2: Critical Path Milestone Cascade Slippage triggers correctly."""
        p_milestone_fail = {
            "project_id": "PRJ-TEST-002",
            "project_name": "Test Rail Doubling Package",
            "progress_decoupling_gap": 2.0,
            "physical_progress_pct": 45.0,
            "financial_progress_pct": 47.0,
            "cumulative_expenditure_cr": 450.0,
            "revised_cost_cr": 950.0,
            "milestones_delayed": 5,
            "milestone_count": 10,
            "milestone_delay_rate": 0.50,
            "target_risk_class": "LOW",
            "primary_bottleneck": "NONE"
        }
        
        alerts = self.engine.evaluate_project(p_milestone_fail)
        self.assertGreaterEqual(len(alerts), 1)
        
        mls_alerts = [a for a in alerts if a["trigger_type"] == "MILESTONE_CASCADE"]
        self.assertEqual(len(mls_alerts), 1)
        self.assertEqual(mls_alerts[0]["severity"], "CRITICAL")
        self.assertIn("5 of 10", mls_alerts[0]["signal"])

    def test_ml_predictive_escalation_trigger(self):
        """Verify Signal 3: Machine Learning Predictive Escalation triggers correctly."""
        p_critical = {
            "project_id": "PRJ-TEST-003",
            "project_name": "Test Distressed Port Facility",
            "progress_decoupling_gap": 5.0,
            "physical_progress_pct": 25.0,
            "financial_progress_pct": 30.0,
            "milestones_delayed": 1,
            "milestone_delay_rate": 0.10,
            "target_risk_class": "CRITICAL",
            "target_schedule_delay_months": 24,
            "primary_bottleneck": "NONE"
        }
        
        alerts = self.engine.evaluate_project(p_critical)
        mlp_alerts = [a for a in alerts if a["trigger_type"] == "ML_PREDICTIVE_ESCALATION"]
        self.assertEqual(len(mlp_alerts), 1)
        self.assertEqual(mlp_alerts[0]["severity"], "CRITICAL")
        self.assertIn("24 months", mlp_alerts[0]["signal"])

    def test_statutory_impasse_trigger(self):
        """Verify Signal 4: Statutory Bottleneck Impasse triggers correctly."""
        p_row_stalled = {
            "project_id": "PRJ-TEST-004",
            "project_name": "Test Urban Metro Phase-II",
            "progress_decoupling_gap": 4.0,
            "physical_progress_pct": 30.0,
            "financial_progress_pct": 34.0,
            "milestones_delayed": 1,
            "milestone_delay_rate": 0.10,
            "target_risk_class": "MODERATE",
            "primary_bottleneck": "LAND_ACQUISITION",
            "duration_elapsed_ratio": 0.65,
            "state": "Maharashtra"
        }
        
        alerts = self.engine.evaluate_project(p_row_stalled)
        btn_alerts = [a for a in alerts if a["trigger_type"] == "STATUTORY_IMPASSE"]
        self.assertEqual(len(btn_alerts), 1)
        self.assertEqual(btn_alerts[0]["severity"], "HIGH")
        self.assertIn("Land Acquisition", btn_alerts[0]["signal"])
        self.assertIn("State Task Force", btn_alerts[0]["recommended_action"])

    def test_portfolio_scan_and_db_sync(self):
        """Verify batch portfolio scan, priority sorting, and database sync."""
        alerts = self.engine.scan_portfolio()
        self.assertGreater(len(alerts), 5000)
        
        # Verify priority sorting (all CRITICAL come before HIGH)
        severities = [a["severity"] for a in alerts]
        first_high_idx = next((i for i, s in enumerate(severities) if s == "HIGH"), len(severities))
        for i in range(first_high_idx):
            self.assertEqual(severities[i], "CRITICAL", "All items before first HIGH must be CRITICAL")
            
        # Test synchronization
        synced_count = self.engine.sync_to_database(alerts)
        self.assertEqual(synced_count, len(alerts))
        
        # Verify in database
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM alerts")
        db_cnt = cursor.fetchone()[0]
        conn.close()
        self.assertEqual(db_cnt, len(alerts))
        self.assertGreaterEqual(db_cnt, 1000)

    def test_scanning_latency_performance(self):
        """Benchmark: Scanning 100 projects in under 0.10s (<1ms per project)."""
        # Create 100 synthetic project dicts
        sample_projects = [
            {
                "project_id": f"PRJ-BENCH-{i:04d}",
                "project_name": f"Bench Project {i}",
                "progress_decoupling_gap": 22.0 if i % 4 == 0 else 5.0,
                "physical_progress_pct": 40.0,
                "financial_progress_pct": 62.0 if i % 4 == 0 else 45.0,
                "milestones_delayed": 4 if i % 5 == 0 else 0,
                "milestone_count": 10,
                "milestone_delay_rate": 0.40 if i % 5 == 0 else 0.0,
                "target_risk_class": "CRITICAL" if i % 10 == 0 else "LOW",
                "target_schedule_delay_months": 22 if i % 10 == 0 else 2,
                "primary_bottleneck": "FOREST_CLEARANCE" if i % 6 == 0 else "NONE",
                "duration_elapsed_ratio": 0.55
            }
            for i in range(100)
        ]
        
        t0 = time.time()
        for p in sample_projects:
            _ = self.engine.evaluate_project(p)
        total_time = time.time() - t0
        avg_ms = (total_time / 100.0) * 1000
        
        self.assertLess(total_time, 0.10, f"100 evaluations took {total_time:.3f}s (avg {avg_ms:.3f}ms)")
        print(f"\n[Alerts Benchmark] 100 project scans completed in {total_time*1000:.2f}ms (Average: {avg_ms:.3f}ms / project)")

if __name__ == "__main__":
    unittest.main()

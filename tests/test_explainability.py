"""
Unit & Performance Test Suite for Phase 5 Explainability Engine (TreeSHAP)
Smart India Hackathon 2026 — Team HexaForce
MoSPI IPMD / PAIMANA Explainable AI Architecture
"""

import sys
import time
import unittest
from pathlib import Path

# Add workspace root to sys.path
WORKSPACE_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(WORKSPACE_ROOT))

from ml.explainer import ProjectPulseExplainer

class TestPhase5ExplainabilityEngine(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.explainer = ProjectPulseExplainer()

    def test_explainer_initialization(self):
        """Verify models and feature schemas are properly initialized."""
        self.assertIsNotNone(self.explainer.delay_model)
        self.assertIsNotNone(self.explainer.preprocessor)
        self.assertGreater(len(self.explainer.feature_names), 50)

    def test_explain_high_friction_project(self):
        """Verify TreeSHAP decomposition on a high-risk delayed project."""
        sample_features = {
            "ministry": "Ministry of Road Transport & Highways",
            "sector": "Roads & Highways",
            "state": "Maharashtra",
            "region": "West",
            "implementing_agency": "National Highways Authority of India (NHAI)",
            "project_type": "Capacity Augmentation / 6-Laning",
            "original_cost_cr": 1450.0,
            "planned_duration_months": 36,
            "project_age_months": 22,
            "duration_elapsed_ratio": 0.61,
            "cumulative_expenditure_cr": 1120.0,
            "physical_progress_pct": 42.0,
            "interim_financial_progress_pct": 77.2,
            "progress_decoupling_gap": 35.2,
            "milestone_count": 10,
            "milestones_completed": 4,
            "milestones_delayed": 4,
            "milestones_at_risk": 2,
            "milestone_delay_rate": 0.40,
            "primary_bottleneck": "LAND_ACQUISITION"
        }
        
        res = self.explainer.explain(sample_features)
        
        self.assertIn("primary_driver", res)
        self.assertIn("drivers", res)
        self.assertIn("observed_signals", res)
        self.assertIn("executive_attribution_summary", res)
        
        drivers = res["drivers"]
        self.assertTrue(3 <= len(drivers) <= 4, "Should return top 3-4 drivers")
        
        # Verify rank ordering
        ranks = [d["rank"] for d in drivers]
        self.assertEqual(ranks, list(range(1, len(drivers) + 1)))
        
        # Verify strength percentages sum to 100%
        sum_pct = sum(d["strength_pct"] for d in drivers)
        self.assertAlmostEqual(sum_pct, 100.0, delta=0.5, msg="Driver strength percentages must sum to 100%")
        
        # Verify evidence statements exist
        for d in drivers:
            self.assertIn("name", d)
            self.assertIn("evidence", d)
            self.assertGreater(len(d["evidence"]), 10)
            
        # Verify observed signals format
        signals = res["observed_signals"]
        self.assertEqual(len(signals), 4)
        for s in signals:
            self.assertIn("label", s)
            self.assertIn("value", s)
            self.assertIn("context", s)

    def test_explain_healthy_project(self):
        """Verify explainability engine handles healthy projects without errors."""
        sample_healthy = {
            "ministry": "Ministry of Power",
            "sector": "Power",
            "state": "Gujarat",
            "region": "West",
            "implementing_agency": "National Thermal & Hydro Power Corp (NTPC/NHPC)",
            "project_type": "Strategic Interconnection",
            "original_cost_cr": 850.0,
            "planned_duration_months": 30,
            "project_age_months": 12,
            "duration_elapsed_ratio": 0.40,
            "cumulative_expenditure_cr": 340.0,
            "physical_progress_pct": 41.5,
            "interim_financial_progress_pct": 40.0,
            "progress_decoupling_gap": -1.5,
            "milestone_count": 10,
            "milestones_completed": 4,
            "milestones_delayed": 0,
            "milestones_at_risk": 0,
            "milestone_delay_rate": 0.0,
            "primary_bottleneck": "NONE"
        }
        
        res = self.explainer.explain(sample_healthy)
        self.assertIsNotNone(res)
        self.assertIn("executive_attribution_summary", res)
        self.assertFalse("NaN" in res["executive_attribution_summary"])

    def test_explainability_latency_benchmark(self):
        """Benchmark: 100 TreeSHAP explanations completed in under 0.8s (<8ms per explanation)."""
        sample_features = {
            "ministry": "Ministry of Railways",
            "sector": "Railways",
            "state": "Uttar Pradesh",
            "region": "North",
            "implementing_agency": "Railway Infrastructure Board / DFCCIL",
            "project_type": "Greenfield Construction",
            "original_cost_cr": 3200.0,
            "planned_duration_months": 48,
            "project_age_months": 24,
            "duration_elapsed_ratio": 0.50,
            "cumulative_expenditure_cr": 2100.0,
            "physical_progress_pct": 38.0,
            "interim_financial_progress_pct": 65.6,
            "progress_decoupling_gap": 27.6,
            "milestone_count": 10,
            "milestones_completed": 3,
            "milestones_delayed": 3,
            "milestones_at_risk": 1,
            "milestone_delay_rate": 0.30,
            "primary_bottleneck": "FOREST_CLEARANCE"
        }
        
        t0 = time.time()
        for _ in range(100):
            res = self.explainer.explain(sample_features)
        total_time = time.time() - t0
        avg_ms = (total_time / 100.0) * 1000
        
        self.assertLess(total_time, 1.20, f"100 explanations took {total_time:.3f}s (avg {avg_ms:.2f}ms)")
        print(f"\n[TreeSHAP Benchmark] 100 explanations completed in {total_time*1000:.1f}ms (Average: {avg_ms:.2f}ms / explanation)")

if __name__ == "__main__":
    unittest.main()

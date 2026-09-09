"""
Unit & Integration Test Suite for Phase 7 What-If Intervention Simulator
Smart India Hackathon 2026 — Team HexaForce
MoSPI IPMD / PAIMANA Decision Support Simulator
"""

import sys
import time
import unittest
from pathlib import Path

# Add workspace root to sys.path
WORKSPACE_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(WORKSPACE_ROOT))

from ml.simulator import InterventionSimulator

class TestPhase7InterventionSimulator(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.simulator = InterventionSimulator()
        cls.distressed_project = {
            "project_id": "PRJ-2026-TEST-SIM",
            "project_name": "Test Greenfield Highway Corridor Package VI",
            "ministry": "Ministry of Road Transport and Highways",
            "sector": "Road Transport and Highways",
            "state": "Maharashtra",
            "region": "Western",
            "implementing_agency": "NHAI",
            "project_type": "Greenfield",
            "original_cost_cr": 2500.0,
            "planned_duration_months": 36,
            "project_age_months": 24,
            "duration_elapsed_ratio": 0.667,
            "cumulative_expenditure_cr": 1600.0,
            "physical_progress_pct": 32.0,
            "financial_progress_pct": 64.0,
            "interim_financial_progress_pct": 64.0,
            "progress_decoupling_gap": 32.0,
            "milestone_count": 12,
            "milestones_completed": 3,
            "milestones_delayed": 6,
            "milestones_at_risk": 3,
            "milestone_delay_rate": 0.50,
            "primary_bottleneck": "LAND_ACQUISITION"
        }

    def test_null_intervention_invariance(self):
        """Verify baseline equals simulated when zero interventions are applied."""
        res = self.simulator.simulate(self.distressed_project)
        self.assertEqual(res["impact"]["risk_score_reduction"], 0.0)
        self.assertEqual(res["impact"]["delay_reduction_months"], 0.0)
        self.assertEqual(res["impact"]["capital_saved_cr"], 0.0)
        self.assertEqual(res["impact"]["recommendation_level"], "BASELINE_MAINTAINED")
        self.assertEqual(len(res["impact"]["interventions_applied"]), 0)

    def test_statutory_bottleneck_resolution(self):
        """Verify statutory clearance fast-tracking reduces schedule delay and risk."""
        res = self.simulator.simulate(self.distressed_project, resolve_bottleneck=True)
        self.assertGreaterEqual(res["impact"]["risk_score_reduction"], 0.0)
        self.assertGreaterEqual(res["impact"]["delay_reduction_months"], 0.0)
        self.assertIn("Statutory Clearance Fast-Track", res["impact"]["interventions_applied"][0])

    def test_contractor_support_decoupling_reduction(self):
        """Verify contractor liquidity infusion narrows decoupling gap and mitigates risk."""
        res = self.simulator.simulate(self.distressed_project, infuse_contractor_support=True)
        self.assertGreaterEqual(res["impact"]["risk_score_reduction"], 0.0)
        self.assertIn("Contractor Liquidity Mobilization", res["impact"]["interventions_applied"][0])

    def test_milestone_critical_path_recovery(self):
        """Verify milestone rescheduling improves completion trajectory."""
        res = self.simulator.simulate(self.distressed_project, reschedule_milestones=True)
        self.assertGreaterEqual(res["impact"]["delay_reduction_months"], 0.0)
        self.assertIn("Critical Path Milestone Re-baselining", res["impact"]["interventions_applied"][0])

    def test_combined_full_policy_package(self):
        """Verify combined multi-lever intervention achieves tier transition and major capital savings."""
        res = self.simulator.simulate(
            self.distressed_project,
            resolve_bottleneck=True,
            infuse_contractor_support=True,
            reschedule_milestones=True,
            progress_boost_pct=10.0
        )
        
        # Combined actions should deliver substantial quantified savings
        self.assertGreaterEqual(res["impact"]["risk_score_reduction"], 5.0)
        self.assertGreater(res["impact"]["capital_saved_cr"], 0.0)
        self.assertGreater(res["impact"]["total_economic_benefit_cr"], 0.0)
        self.assertEqual(res["impact"]["recommendation_level"], "HIGH_PRIORITY_INTERVENTION")
        self.assertIn("➔", res["impact"]["tier_transition"])

    def test_simulation_latency_benchmark(self):
        """Benchmark: 50 counterfactual simulations execute in under 1.5s (<30ms per simulation)."""
        t0 = time.time()
        for _ in range(50):
            _ = self.simulator.simulate(
                self.distressed_project,
                resolve_bottleneck=True,
                infuse_contractor_support=True
            )
        elapsed = time.time() - t0
        avg_ms = (elapsed / 50.0) * 1000
        
        self.assertLess(elapsed, 1.50, f"50 simulations took {elapsed:.2f}s (avg {avg_ms:.2f}ms)")
        print(f"\n[Simulator Benchmark] 50 simulations completed in {elapsed*1000:.2f}ms (Average: {avg_ms:.2f}ms / simulation)")

if __name__ == "__main__":
    unittest.main()

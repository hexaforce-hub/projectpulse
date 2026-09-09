"""
ProjectPulse — Unit Tests: Scenario Engine (Phase 7)
Verifies baseline equivalence, single/multi-intervention simulation,
reproducibility, sensitivity sweeps, and persistence operations.
"""

import sys
import unittest
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from src.scenarios.scenario_engine import ScenarioEngine
from src.scenarios.scenario_models import (
    SimulationRequest,
    SensitivityRequest,
    ScenarioModification,
    ScenarioResult
)

class TestScenarioEngine(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.engine = ScenarioEngine()
        cls.project_id = "PRJ-SYN-002078"

    def test_baseline_prediction_matches_prediction_engine(self):
        raw_baseline = self.engine.get_baseline_snapshot(self.project_id)
        direct_pred = self.engine.prediction_engine.predict_snapshot(raw_baseline)

        req = SimulationRequest(
            project_id=self.project_id,
            scenario_name="Baseline Equivalence Test",
            modifications=[ScenarioModification(feature="primary_bottleneck", scenario_value="LAND_ACQUISITION")]
        )
        sim_res = self.engine.simulate_scenario(req)

        self.assertEqual(sim_res.baseline.overall_risk_score, direct_pred.overall_risk_score)
        self.assertEqual(sim_res.baseline.overall_risk_band, direct_pred.overall_risk_band)
        self.assertEqual(sim_res.baseline.schedule_probability, direct_pred.schedule.probability)
        self.assertEqual(sim_res.baseline.cost_probability, direct_pred.cost.probability)

    def test_single_intervention_simulation(self):
        req = SimulationRequest(
            project_id=self.project_id,
            scenario_name="Fast-Track Statutory Clearance",
            modifications=[ScenarioModification(feature="primary_bottleneck", scenario_value="NONE")]
        )
        res = self.engine.simulate_scenario(req)

        self.assertIsInstance(res, ScenarioResult)
        self.assertTrue(res.scenario_id.startswith("SCN-"))
        self.assertEqual(res.status, "SIMULATED")
        self.assertGreaterEqual(res.scenario.overall_risk_score, 0.0)
        self.assertLessEqual(res.scenario.overall_risk_score, 100.0)
        self.assertIn("Hypothetical", res.disclaimer)

    def test_multi_intervention_simulation(self):
        req = SimulationRequest(
            project_id=self.project_id,
            scenario_name="Comprehensive Turnaround Package",
            modifications=[
                ScenarioModification(feature="primary_bottleneck", scenario_value="NONE"),
                ScenarioModification(feature="milestones_delayed", scenario_value=1),
                ScenarioModification(feature="physical_progress_pct", scenario_value=55.0)
            ]
        )
        res = self.engine.simulate_scenario(req)

        self.assertEqual(len(res.modifications), 3)
        self.assertIn(res.delta.classification, ["IMPROVED", "STABLE", "DETERIORATED"])
        self.assertGreaterEqual(len(res.assumptions), 3)

    def test_scenario_reproducibility(self):
        req = SimulationRequest(
            project_id=self.project_id,
            scenario_name="Reproducibility Check",
            modifications=[ScenarioModification(feature="primary_bottleneck", scenario_value="NONE")]
        )
        run_1 = self.engine.simulate_scenario(req)
        run_2 = self.engine.simulate_scenario(req)

        self.assertEqual(run_1.scenario.overall_risk_score, run_2.scenario.overall_risk_score)
        self.assertEqual(run_1.scenario.schedule_probability, run_2.scenario.schedule_probability)
        self.assertEqual(run_1.scenario.cost_probability, run_2.scenario.cost_probability)
        self.assertEqual(run_1.delta.overall_risk_score, run_2.delta.overall_risk_score)

    def test_sensitivity_sweep_no_retraining(self):
        req = SensitivityRequest(
            project_id=self.project_id,
            feature="milestones_delayed",
            points_count=5
        )
        sens_res = self.engine.run_sensitivity_analysis(req)

        self.assertEqual(len(sens_res.points), 5)
        for pt in sens_res.points:
            self.assertGreaterEqual(pt.overall_risk_score, 0.0)
            self.assertLessEqual(pt.overall_risk_score, 100.0)
            self.assertIsInstance(pt.risk_reduction_points, float)

    def test_scenario_save_get_delete_cycle(self):
        req = SimulationRequest(
            project_id=self.project_id,
            scenario_name="Persistence Lifecycle Test",
            modifications=[ScenarioModification(feature="primary_bottleneck", scenario_value="NONE")]
        )
        sim_res = self.engine.simulate_scenario(req)
        sim_res.scenario_id = "SCN-TEST-LIFECYCLE-001"

        saved_ok = self.engine.save_scenario(sim_res)
        self.assertTrue(saved_ok)

        fetched = self.engine.get_scenario("SCN-TEST-LIFECYCLE-001")
        self.assertIsNotNone(fetched)
        self.assertEqual(fetched["scenario_name"], "Persistence Lifecycle Test")
        self.assertEqual(fetched["status"], "SAVED")

        deleted_ok = self.engine.delete_scenario("SCN-TEST-LIFECYCLE-001")
        self.assertTrue(deleted_ok)
        self.assertIsNone(self.engine.get_scenario("SCN-TEST-LIFECYCLE-001"))

if __name__ == "__main__":
    unittest.main()

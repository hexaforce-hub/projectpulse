"""
ProjectPulse — Unit Tests: Scenario Comparison & Deltas (Phase 7)
Verifies mathematical delta calculations, percentage points annotations,
outcome classification, and multi-scenario side-by-side rankings.
"""

import sys
import unittest
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from src.scenarios.scenario_comparison import ScenarioComparison
from src.scenarios.scenario_models import PredictionSummary

class TestScenarioComparison(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.comparison = ScenarioComparison(improved_threshold=5.0, deteriorated_threshold=-5.0)

        cls.baseline = PredictionSummary(
            overall_risk_score=82.0,
            overall_risk_band="CRITICAL",
            schedule_probability=0.78,
            predicted_delay_months=16.5,
            cost_probability=0.71,
            predicted_cost_overrun_pct=22.4,
            predicted_cost_overrun_cr=224.0,
            implementation_probability=0.84,
            implementation_risk_band="CRITICAL"
        )

    def test_delta_calculation_improvement(self):
        scenario_improved = PredictionSummary(
            overall_risk_score=68.0,
            overall_risk_band="HIGH",
            schedule_probability=0.63,
            predicted_delay_months=11.2,
            cost_probability=0.69,
            predicted_cost_overrun_pct=20.0,
            predicted_cost_overrun_cr=200.0,
            implementation_probability=0.73,
            implementation_risk_band="HIGH"
        )

        delta = self.comparison.calculate_delta(self.baseline, scenario_improved)

        self.assertEqual(delta.overall_risk_score, 14.0)
        self.assertEqual(delta.risk_score_display, "-14.0 points")
        self.assertEqual(delta.schedule_probability_pp, 15.0)  # 0.78 - 0.63 = 0.15 = 15.0 pp
        self.assertEqual(delta.cost_probability_pp, 2.0)       # 0.71 - 0.69 = 0.02 = 2.0 pp
        self.assertEqual(delta.implementation_probability_pp, 11.0) # 0.84 - 0.73 = 0.11 = 11.0 pp
        self.assertEqual(delta.classification, "IMPROVED")
        self.assertEqual(delta.risk_band_transition, "CRITICAL -> HIGH")
        self.assertIn("CRITICAL to HIGH", delta.warning_preview)

    def test_delta_calculation_deterioration(self):
        scenario_worse = PredictionSummary(
            overall_risk_score=90.0,
            overall_risk_band="CRITICAL",
            schedule_probability=0.88,
            predicted_delay_months=22.0,
            cost_probability=0.85,
            predicted_cost_overrun_pct=30.0,
            predicted_cost_overrun_cr=300.0,
            implementation_probability=0.92,
            implementation_risk_band="CRITICAL"
        )

        delta = self.comparison.calculate_delta(self.baseline, scenario_worse)

        self.assertEqual(delta.overall_risk_score, -8.0)
        self.assertEqual(delta.risk_score_display, "+8.0 points")
        self.assertEqual(delta.classification, "DETERIORATED")

    def test_delta_calculation_stable(self):
        scenario_stable = PredictionSummary(
            overall_risk_score=80.5,
            overall_risk_band="CRITICAL",
            schedule_probability=0.77,
            predicted_delay_months=16.0,
            cost_probability=0.70,
            predicted_cost_overrun_pct=22.0,
            predicted_cost_overrun_cr=220.0,
            implementation_probability=0.83,
            implementation_risk_band="CRITICAL"
        )

        delta = self.comparison.calculate_delta(self.baseline, scenario_stable)

        self.assertEqual(delta.classification, "STABLE")

    def test_multi_scenario_comparison_and_ranking(self):
        scenarios = [
            {
                "scenario_id": "SCN-01",
                "scenario_name": "Milestone Acceleration",
                "scenario": {"overall_risk_score": 75.0, "schedule_probability": 0.70, "cost_probability": 0.70, "implementation_probability": 0.75},
                "delta": {"classification": "IMPROVED"}
            },
            {
                "scenario_id": "SCN-02",
                "scenario_name": "Procurement Recovery",
                "scenario": {"overall_risk_score": 65.0, "schedule_probability": 0.60, "cost_probability": 0.68, "implementation_probability": 0.70},
                "delta": {"classification": "IMPROVED"}
            },
            {
                "scenario_id": "SCN-03",
                "scenario_name": "Comprehensive Turnaround",
                "scenario": {"overall_risk_score": 52.0, "schedule_probability": 0.45, "cost_probability": 0.55, "implementation_probability": 0.50},
                "delta": {"classification": "IMPROVED"}
            }
        ]

        result = self.comparison.compare_scenarios("PRJ-001", 82.0, scenarios)

        self.assertEqual(result.compared_count, 3)
        # SCN-03 should be rank 1 (lowest risk 52.0)
        self.assertEqual(result.scenarios[0].scenario_id, "SCN-03")
        self.assertEqual(result.scenarios[0].rank, 1)
        self.assertEqual(result.lowest_modeled_risk_scenario, "Comprehensive Turnaround")
        self.assertIn("lowest model-estimated risk", result.disclaimer.lower())

if __name__ == "__main__":
    unittest.main()

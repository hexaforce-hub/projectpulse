"""
ProjectPulse — Unit Tests: Reproducibility & Determinism (Phase 4)
Verifies deterministic inference output across repeated evaluation of identical inputs.
"""

import sys
import unittest
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from src.ml.prediction import PredictionEngine

class TestReproducibility(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.engine = PredictionEngine()

    def test_deterministic_predictions_for_identical_input(self):
        snapshot = {
            "project_id": "PRJ-DETERMINISM-01",
            "project_name": "Dedicated Freight Corridor Substation",
            "ministry": "Ministry of Railways",
            "sector": "Railways",
            "state": "Haryana",
            "region": "Northern",
            "implementing_agency": "DFCCIL",
            "project_type": "Greenfield",
            "primary_bottleneck": "EQUIPMENT_SUPPLY",
            "original_cost_cr": 1800.0,
            "planned_duration_months": 42,
            "project_age_months": 28,
            "cumulative_expenditure_cr": 1100.0,
            "physical_progress_pct": 52.0,
            "milestone_count": 18,
            "milestones_completed": 8,
            "milestones_delayed": 4,
            "milestones_at_risk": 2
        }

        run_1 = self.engine.predict_snapshot(snapshot)
        run_2 = self.engine.predict_snapshot(snapshot)

        self.assertEqual(run_1.overall_risk_score, run_2.overall_risk_score)
        self.assertEqual(run_1.overall_risk_band, run_2.overall_risk_band)
        self.assertEqual(run_1.schedule.probability, run_2.schedule.probability)
        self.assertEqual(run_1.schedule.predicted_delay_months, run_2.schedule.predicted_delay_months)
        self.assertEqual(run_1.cost.probability, run_2.cost.probability)
        self.assertEqual(run_1.cost.predicted_overrun_pct, run_2.cost.predicted_overrun_pct)
        self.assertEqual(run_1.cost.predicted_overrun_cr, run_2.cost.predicted_overrun_cr)
        self.assertEqual(run_1.implementation.probability, run_2.implementation.probability)
        self.assertEqual(run_1.implementation.class_probabilities, run_2.implementation.class_probabilities)

if __name__ == "__main__":
    unittest.main()

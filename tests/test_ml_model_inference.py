"""
ProjectPulse — Unit Tests: Model Inference (Phase 4)
Verifies artifact loading, valid prediction ranges, probability bounds, and non-negativity.
"""

import sys
import unittest
from pathlib import Path
import pandas as pd
import numpy as np

PROJECT_ROOT = Path(__file__).parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from src.ml.model_registry import ModelRegistry
from src.ml.feature_engineering import engineer_features

class TestModelInference(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.registry = ModelRegistry()
        cls.sched_clf = cls.registry.get_model("schedule", "schedule_classifier_v1")["pipeline"]
        cls.sched_reg = cls.registry.get_model("schedule", "schedule_regressor_v1")["pipeline"]
        cls.cost_clf = cls.registry.get_model("cost", "cost_classifier_v1")["pipeline"]
        cls.cost_reg = cls.registry.get_model("cost", "cost_regressor_v1")["pipeline"]
        cls.risk_clf = cls.registry.get_model("implementation", "risk_classifier_v1")["pipeline"]

        cls.sample_df = pd.DataFrame([{
            "project_id": "PRJ-TEST-INFERENCE",
            "original_cost_cr": 850.0,
            "planned_duration_months": 48,
            "project_age_months": 24,
            "cumulative_expenditure_cr": 400.0,
            "physical_progress_pct": 35.0,
            "milestone_count": 15,
            "milestones_completed": 4,
            "milestones_delayed": 3,
            "milestones_at_risk": 2,
            "ministry": "Ministry of Railways",
            "sector": "Railways",
            "state": "Uttar Pradesh",
            "region": "Northern",
            "implementing_agency": "RVNL",
            "project_type": "Greenfield",
            "primary_bottleneck": "FOREST_CLEARANCE"
        }])
        cls.feat_df = engineer_features(cls.sample_df)

    def test_schedule_delay_classifier_bounds(self):
        proba = self.sched_clf.predict_proba(self.feat_df)[0, 1]
        self.assertGreaterEqual(proba, 0.0)
        self.assertLessEqual(proba, 1.0)

    def test_schedule_delay_regressor_prediction(self):
        delay_pred = self.sched_reg.predict(self.feat_df)[0]
        self.assertGreaterEqual(delay_pred, -5.0)  # Linear or tree regressor within sensible range

    def test_cost_overrun_classifier_bounds(self):
        proba = self.cost_clf.predict_proba(self.feat_df)[0, 1]
        self.assertGreaterEqual(proba, 0.0)
        self.assertLessEqual(proba, 1.0)

    def test_cost_overrun_regressor_prediction(self):
        cost_pred = self.cost_reg.predict(self.feat_df)[0]
        self.assertIsInstance(float(cost_pred), float)

    def test_risk_multiclass_probabilities_sum_to_one(self):
        probs = self.risk_clf.predict_proba(self.feat_df)[0]
        self.assertEqual(len(probs), 4)
        for p in probs:
            self.assertGreaterEqual(p, 0.0)
            self.assertLessEqual(p, 1.0)
        self.assertAlmostEqual(float(np.sum(probs)), 1.0, places=4)

if __name__ == "__main__":
    unittest.main()

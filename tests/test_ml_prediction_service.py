"""
ProjectPulse — Unit Tests: Prediction Service (Phase 4)
Verifies PredictionEngine functionality, composite risk scores, and data quality scoring.
"""

import sys
import unittest
from pathlib import Path
import pandas as pd

PROJECT_ROOT = Path(__file__).parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from src.ml.prediction import PredictionEngine
from src.ml.schemas import PredictionResult, PortfolioSummary

class TestPredictionService(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.engine = PredictionEngine()

    def test_predict_snapshot_returns_valid_prediction_result(self):
        snapshot = {
            "project_id": "PRJ-TEST-SVC-01",
            "project_name": "Test Highway Expansion",
            "original_cost_cr": 450.0,
            "planned_duration_months": 36,
            "project_age_months": 18,
            "cumulative_expenditure_cr": 200.0,
            "physical_progress_pct": 30.0,
            "milestone_count": 8,
            "milestones_completed": 2,
            "milestones_delayed": 1,
            "milestones_at_risk": 1,
            "ministry": "Ministry of Road Transport and Highways",
            "sector": "Roads & Highways",
            "state": "Rajasthan",
            "region": "Northern",
            "implementing_agency": "NHAI",
            "project_type": "Brownfield",
            "primary_bottleneck": "LAND_ACQUISITION"
        }
        res = self.engine.predict_snapshot(snapshot)
        self.assertIsInstance(res, PredictionResult)
        self.assertEqual(res.project_id, "PRJ-TEST-SVC-01")
        self.assertGreaterEqual(res.overall_risk_score, 0.0)
        self.assertLessEqual(res.overall_risk_score, 100.0)
        self.assertIn(res.overall_risk_band, ["LOW", "MODERATE", "HIGH", "CRITICAL"])
        self.assertGreaterEqual(res.schedule.probability, 0.0)
        self.assertLessEqual(res.schedule.probability, 1.0)
        self.assertGreaterEqual(res.cost.probability, 0.0)
        self.assertLessEqual(res.cost.probability, 1.0)
        self.assertGreaterEqual(res.implementation.probability, 0.0)
        self.assertLessEqual(res.implementation.probability, 1.0)

    def test_data_quality_scoring_and_warning(self):
        # Perfect snapshot
        clean_snapshot = {
            "original_cost_cr": 300.0,
            "planned_duration_months": 24,
            "project_age_months": 12,
            "cumulative_expenditure_cr": 150.0,
            "physical_progress_pct": 50.0,
            "milestone_count": 6,
            "milestones_completed": 3,
            "milestones_delayed": 0,
            "milestones_at_risk": 0,
            "primary_bottleneck": "NONE"
        }
        dq_clean = self.engine.compute_data_quality(clean_snapshot)
        self.assertGreaterEqual(dq_clean, 90.0)

        # Incomplete / missing values snapshot
        dirty_snapshot = {
            "original_cost_cr": None,
            "planned_duration_months": 0,
            "project_age_months": None,
            "cumulative_expenditure_cr": None,
            "physical_progress_pct": None,
            "milestone_count": 0,
            "primary_bottleneck": None
        }
        dq_dirty = self.engine.compute_data_quality(dirty_snapshot)
        quality_level, warning = self.engine.assign_prediction_quality(dq_dirty)
        self.assertLess(dq_dirty, 70.0)
        self.assertEqual(quality_level, "LOW")
        self.assertTrue(warning)

    def test_predict_portfolio_batch(self):
        sample_portfolio = pd.DataFrame([
            {
                "project_id": f"PRJ-BATCH-{i:03d}",
                "original_cost_cr": 200.0 + i * 50,
                "planned_duration_months": 24 + i * 6,
                "project_age_months": 12,
                "cumulative_expenditure_cr": 100.0 + i * 20,
                "physical_progress_pct": 40.0,
                "milestone_count": 8,
                "milestones_completed": 3,
                "milestones_delayed": i % 3,
                "milestones_at_risk": 1,
                "ministry": "Ministry of Railways",
                "sector": "Railways",
                "state": "Bihar",
                "region": "Eastern",
                "implementing_agency": "RVNL",
                "project_type": "Greenfield",
                "primary_bottleneck": "NONE"
            }
            for i in range(5)
        ])
        df_preds, summary = self.engine.predict_portfolio(sample_portfolio)
        self.assertEqual(len(df_preds), 5)
        self.assertIsInstance(summary, PortfolioSummary)
        self.assertEqual(summary.total_projects, 5)
        self.assertGreaterEqual(summary.average_risk_score, 0.0)

if __name__ == "__main__":
    unittest.main()

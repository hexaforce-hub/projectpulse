"""
ProjectPulse — Unit Tests: Feature Engineering (Phase 4)
Verifies feature extraction, derivation, edge-case resilience, and anti-leakage compliance.
"""

import sys
import unittest
from pathlib import Path
import pandas as pd
import numpy as np

PROJECT_ROOT = Path(__file__).parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from src.ml.feature_engineering import engineer_features, SAFE_FEATURE_COLUMNS, LEAKAGE_COLUMNS

class TestFeatureEngineering(unittest.TestCase):
    def setUp(self):
        self.sample_data = {
            "project_id": ["PRJ-TEST-001", "PRJ-TEST-002"],
            "original_cost_cr": [1000.0, 500.0],
            "planned_duration_months": [36, 24],
            "project_age_months": [18, 0],
            "cumulative_expenditure_cr": [600.0, 0.0],
            "physical_progress_pct": [40.0, 0.0],
            "milestone_count": [10, 5],
            "milestones_completed": [4, 0],
            "milestones_delayed": [2, 0],
            "milestones_at_risk": [1, 0],
            "ministry": ["Ministry of Railways", "Ministry of Road Transport and Highways"],
            "sector": ["Railways", "Roads & Highways"],
            "state": ["Maharashtra", "Gujarat"],
            "region": ["Western", "Western"],
            "implementing_agency": ["RVNL", "NHAI"],
            "project_type": ["Greenfield", "Brownfield"],
            "primary_bottleneck": ["LAND_ACQUISITION", "NONE"]
        }
        self.df_sample = pd.DataFrame(self.sample_data)

    def test_feature_engineering_creates_all_expected_features(self):
        df_feats = engineer_features(self.df_sample)
        self.assertIn("progress_decoupling_gap", df_feats.columns)
        self.assertIn("duration_elapsed_ratio", df_feats.columns)
        self.assertIn("remaining_planned_months", df_feats.columns)
        self.assertIn("expenditure_per_progress_point", df_feats.columns)
        self.assertIn("milestone_completion_rate", df_feats.columns)
        self.assertIn("milestone_delay_rate", df_feats.columns)
        self.assertIn("interim_financial_progress_pct", df_feats.columns)

    def test_progress_decoupling_calculation(self):
        df_feats = engineer_features(self.df_sample)
        row0 = df_feats.iloc[0]
        self.assertAlmostEqual(row0["interim_financial_progress_pct"], 60.0, places=2)
        self.assertAlmostEqual(row0["progress_decoupling_gap"], 20.0, places=2)

    def test_zero_division_resilience(self):
        df_feats = engineer_features(self.df_sample)
        row1 = df_feats.iloc[1]
        self.assertFalse(np.isnan(row1["duration_elapsed_ratio"]))
        self.assertFalse(np.isinf(row1["duration_elapsed_ratio"]))
        self.assertFalse(np.isnan(row1["expenditure_per_progress_point"]))
        self.assertFalse(np.isinf(row1["expenditure_per_progress_point"]))
        self.assertEqual(row1["duration_elapsed_ratio"], 0.0)

    def test_zero_milestones_and_zero_duration_edge_case(self):
        edge_data = pd.DataFrame([{
            "project_id": "PRJ-ZERO-001",
            "original_cost_cr": 0.0,
            "planned_duration_months": 0,
            "project_age_months": 0,
            "cumulative_expenditure_cr": 0.0,
            "physical_progress_pct": 0.0,
            "milestone_count": 0,
            "milestones_completed": 0,
            "milestones_delayed": 0,
            "milestones_at_risk": 0,
            "ministry": "Ministry of Power",
            "sector": "Power",
            "state": "Delhi",
            "region": "Northern",
            "implementing_agency": "NTPC",
            "project_type": "Thermal",
            "primary_bottleneck": "NONE"
        }])
        df_feats = engineer_features(edge_data)
        self.assertEqual(len(df_feats), 1)
        self.assertFalse(df_feats.isna().any().any())

    def test_no_quarantined_leakage_columns_in_output(self):
        df_with_leakage = self.df_sample.copy()
        df_with_leakage["revised_cost_cr"] = [1200.0, 500.0]
        df_with_leakage["cost_overrun_cr"] = [200.0, 0.0]
        df_with_leakage["schedule_slippage_months"] = [12, 0]

        df_feats = engineer_features(df_with_leakage)
        for leak_col in LEAKAGE_COLUMNS:
            self.assertNotIn(leak_col, df_feats.columns)

if __name__ == "__main__":
    unittest.main()

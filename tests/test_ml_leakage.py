"""
ProjectPulse — Unit Tests: Anti-Leakage Quarantine (Phase 4)
Strict validation verifying zero target leakage in feature spaces, datasets, and trained model inputs.
"""

import json
import sys
import unittest
from pathlib import Path
import pandas as pd

PROJECT_ROOT = Path(__file__).parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from src.ml.feature_engineering import LEAKAGE_COLUMNS, engineer_features

class TestLeakageQuarantine(unittest.TestCase):
    def setUp(self):
        self.forbidden_columns = set(LEAKAGE_COLUMNS) | {
            "revised_cost_cr",
            "cost_overrun_cr",
            "cost_growth_pct",
            "schedule_slippage_months",
            "revised_completion_date",
            "schedule_revisions_count",
            "target_schedule_delay_months",
            "target_cost_overrun_pct",
            "target_risk_class",
            "future_schedule_delay_binary",
            "future_delay_months_continuous",
            "future_cost_overrun_binary",
            "future_cost_overrun_pct_continuous",
            "target_risk_class_multiclass"
        }

    def test_feature_engineering_strips_forbidden_leakage_columns(self):
        # Create a raw dataset that deliberately includes contaminated target fields
        df_contaminated = pd.DataFrame([{
            "project_id": "PRJ-LEAK-01",
            "original_cost_cr": 1000.0,
            "planned_duration_months": 36,
            "project_age_months": 24,
            "cumulative_expenditure_cr": 700.0,
            "physical_progress_pct": 50.0,
            "milestone_count": 10,
            "milestones_completed": 5,
            "milestones_delayed": 2,
            "milestones_at_risk": 1,
            "ministry": "Ministry of Railways",
            "sector": "Railways",
            "state": "Maharashtra",
            "region": "Western",
            "implementing_agency": "RVNL",
            "project_type": "Greenfield",
            "primary_bottleneck": "LAND_ACQUISITION",
            # Contaminants:
            "revised_cost_cr": 1500.0,
            "cost_overrun_cr": 500.0,
            "cost_growth_pct": 50.0,
            "schedule_slippage_months": 18,
            "revised_completion_date": "2027-12-31",
            "schedule_revisions_count": 3
        }])

        df_feats = engineer_features(df_contaminated)

        for col in self.forbidden_columns:
            self.assertNotIn(
                col,
                df_feats.columns,
                f"FATAL LEAKAGE: Column '{col}' leaked into feature space!"
            )

    def test_model_artifact_features_do_not_contain_leakage(self):
        models_dir = PROJECT_ROOT / "models"
        for family in ["schedule", "cost", "implementation"]:
            features_file = models_dir / family / "features.json"
            if features_file.exists():
                with open(features_file, "r", encoding="utf-8") as f:
                    features = json.load(f)
                for f_name in features:
                    self.assertNotIn(
                        f_name,
                        self.forbidden_columns,
                        f"FATAL LEAKAGE: Model '{family}' trained on forbidden feature '{f_name}'!"
                    )

    def test_feature_catalog_documentation_conformity(self):
        docs_file = PROJECT_ROOT / "docs" / "LEAKAGE_ANALYSIS.md"
        self.assertTrue(docs_file.exists(), "LEAKAGE_ANALYSIS.md documentation missing.")

if __name__ == "__main__":
    unittest.main()

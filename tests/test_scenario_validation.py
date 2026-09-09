"""
ProjectPulse — Unit Tests: Scenario Validation (Phase 7)
Verifies rejection of forbidden target variables, boundary enforcement,
range validations, and out-of-distribution warnings.
"""

import sys
import unittest
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from src.scenarios.scenario_validator import ScenarioValidator
from src.scenarios.scenario_models import ScenarioModification

class TestScenarioValidation(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.validator = ScenarioValidator()
        cls.sample_baseline = {
            "project_id": "PRJ-VAL-TEST-001",
            "original_cost_cr": 1000.0,
            "planned_duration_months": 36,
            "project_age_months": 24,
            "cumulative_expenditure_cr": 600.0,
            "physical_progress_pct": 50.0,
            "milestone_count": 10,
            "milestones_completed": 5,
            "milestones_delayed": 3,
            "milestones_at_risk": 1,
            "primary_bottleneck": "LAND_ACQUISITION"
        }

    def test_forbidden_target_variables_rejected(self):
        forbidden_fields = [
            "revised_cost_cr",
            "cost_overrun_cr",
            "cost_growth_pct",
            "schedule_slippage_months",
            "revised_completion_date",
            "schedule_revisions_count",
            "actual_completion_date",
            "target_schedule_delay_months",
            "target_cost_overrun_pct",
            "future_schedule_delay_binary"
        ]

        for field in forbidden_fields:
            mods = [ScenarioModification(feature=field, scenario_value=10.0)]
            is_valid, errors, _ = self.validator.validate_scenario(self.sample_baseline, mods)
            self.assertFalse(is_valid, f"Expected validation failure for forbidden target '{field}'")
            self.assertTrue(any("FORBIDDEN TARGET" in err for err in errors))

    def test_unsupported_feature_rejected(self):
        mods = [ScenarioModification(feature="random_made_up_variable", scenario_value=42)]
        is_valid, errors, _ = self.validator.validate_scenario(self.sample_baseline, mods)
        self.assertFalse(is_valid)
        self.assertTrue(any("UNSUPPORTED FEATURE" in err for err in errors))

    def test_invalid_physical_progress_range(self):
        # Progress > 100
        mods = [ScenarioModification(feature="physical_progress_pct", scenario_value=150.0)]
        is_valid, errors, _ = self.validator.validate_scenario(self.sample_baseline, mods)
        self.assertFalse(is_valid)
        self.assertTrue(any("INVALID RANGE" in err for err in errors))

        # Progress < 0
        mods_neg = [ScenarioModification(feature="physical_progress_pct", scenario_value=-5.0)]
        is_valid_neg, errors_neg, _ = self.validator.validate_scenario(self.sample_baseline, mods_neg)
        self.assertFalse(is_valid_neg)

    def test_invalid_milestones_delayed_range(self):
        # Negative milestones delayed
        mods_neg = [ScenarioModification(feature="milestones_delayed", scenario_value=-2)]
        is_valid, errors, _ = self.validator.validate_scenario(self.sample_baseline, mods_neg)
        self.assertFalse(is_valid)

        # Delayed exceeding total milestone count
        mods_excess = [ScenarioModification(feature="milestones_delayed", scenario_value=25)]
        is_valid_ex, errors_ex, _ = self.validator.validate_scenario(self.sample_baseline, mods_excess)
        self.assertFalse(is_valid_ex)
        self.assertTrue(any("exceed total project milestones" in err for err in errors_ex))

    def test_empty_modifications_rejected(self):
        is_valid, errors, _ = self.validator.validate_scenario(self.sample_baseline, [])
        self.assertFalse(is_valid)
        self.assertTrue(any("at least one" in err for err in errors))

    def test_out_of_distribution_warning(self):
        # 35 delayed milestones (within count 40, but exceeding observed training bound of ~40)
        baseline_large = dict(self.sample_baseline)
        baseline_large["milestone_count"] = 50
        mods = [ScenarioModification(feature="milestones_delayed", scenario_value=45)]
        is_valid, errors, warnings = self.validator.validate_scenario(baseline_large, mods)
        self.assertTrue(is_valid)
        self.assertTrue(any("OUT-OF-DISTRIBUTION" in w for w in warnings))

if __name__ == "__main__":
    unittest.main()

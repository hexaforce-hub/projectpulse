"""
ProjectPulse — Unit Tests: Target Builder (Phase 4)
Verifies binary, continuous, and multi-class target construction and thresholds.
"""

import sys
import unittest
from pathlib import Path
import pandas as pd

PROJECT_ROOT = Path(__file__).parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from src.ml.target_builder import build_targets

class TestTargetBuilder(unittest.TestCase):
    def setUp(self):
        self.df = pd.DataFrame({
            "project_id": ["PRJ-01", "PRJ-02", "PRJ-03", "PRJ-04"],
            "schedule_slippage_months": [0.0, 11.9, 12.0, 24.0],
            "cost_growth_pct": [0.0, 14.9, 15.0, 45.0],
            "target_risk_class": ["LOW", "MODERATE", "HIGH", "CRITICAL"]
        })

    def test_schedule_delay_binary_threshold(self):
        targets = build_targets(self.df)
        bin_delay = targets["future_schedule_delay_binary"]
        # Threshold is 12.0 months: 0.0 -> 0, 11.9 -> 0, 12.0 -> 1, 24.0 -> 1
        self.assertEqual(list(bin_delay), [0, 0, 1, 1])

    def test_cost_overrun_binary_threshold(self):
        targets = build_targets(self.df)
        bin_cost = targets["future_cost_overrun_binary"]
        # Threshold is 15.0%: 0.0 -> 0, 14.9 -> 0, 15.0 -> 1, 45.0 -> 1
        self.assertEqual(list(bin_cost), [0, 0, 1, 1])

    def test_continuous_targets_match_inputs(self):
        targets = build_targets(self.df)
        self.assertEqual(list(targets["future_delay_months_continuous"]), [0.0, 11.9, 12.0, 24.0])
        self.assertEqual(list(targets["future_cost_overrun_pct_continuous"]), [0.0, 14.9, 15.0, 45.0])

    def test_multiclass_target_classes(self):
        targets = build_targets(self.df)
        classes = targets["target_risk_class_multiclass"]
        self.assertEqual(list(classes), ["LOW", "MODERATE", "HIGH", "CRITICAL"])

if __name__ == "__main__":
    unittest.main()

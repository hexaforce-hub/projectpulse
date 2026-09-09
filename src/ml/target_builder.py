"""
ProjectPulse — Target Builder Pipeline (Phase 4)
Builds Supervised Prediction Targets for Schedule, Cost, and Multi-Class Risk
"""

from typing import Dict, Any, Tuple
import numpy as np
import pandas as pd

from src.ml.config import ML_CONFIG

def build_targets(df: pd.DataFrame) -> Dict[str, pd.Series]:
    """
    Constructs supervised target series from raw or processed dataset.
    """
    targets_cfg = ML_CONFIG.get("targets", {})
    delay_thresh = targets_cfg.get("schedule_delay", {}).get("binary_threshold_months", 12.0)
    cost_thresh = targets_cfg.get("cost_overrun", {}).get("binary_threshold_pct", 15.0)

    # 1. Schedule Delay Targets
    if "target_schedule_delay_months" in df.columns:
        cont_delay = df["target_schedule_delay_months"].astype(float)
    elif "schedule_slippage_months" in df.columns:
        cont_delay = df["schedule_slippage_months"].astype(float)
    else:
        raise KeyError("Cannot find target_schedule_delay_months or schedule_slippage_months in dataset.")

    bin_delay = (cont_delay >= delay_thresh).astype(int)

    # 2. Cost Overrun Targets
    if "target_cost_overrun_pct" in df.columns:
        cont_cost = df["target_cost_overrun_pct"].astype(float)
    elif "cost_growth_pct" in df.columns:
        cont_cost = df["cost_growth_pct"].astype(float)
    elif "revised_cost_cr" in df.columns and "original_cost_cr" in df.columns:
        cont_cost = ((df["revised_cost_cr"] - df["original_cost_cr"]) / df["original_cost_cr"]) * 100.0
    else:
        raise KeyError("Cannot find target_cost_overrun_pct or cost_growth_pct in dataset.")

    bin_cost = (cont_cost >= cost_thresh).astype(int)

    # 3. Multi-Class Implementation Risk Target
    if "target_risk_class" in df.columns:
        multiclass_risk = df["target_risk_class"].astype(str)
    else:
        # Construct based on index rule from TARGET_DEFINITIONS.md if missing
        multiclass_risk = pd.Series("LOW", index=df.index)
        multiclass_risk[(cont_delay >= 3) | (cont_cost >= 5)] = "MODERATE"
        multiclass_risk[(cont_delay >= 9) | (cont_cost >= 15)] = "HIGH"
        multiclass_risk[(cont_delay >= 20) | (cont_cost >= 30)] = "CRITICAL"

    return {
        "future_schedule_delay_binary": bin_delay,
        "future_delay_months_continuous": cont_delay,
        "future_cost_overrun_binary": bin_cost,
        "future_cost_overrun_pct_continuous": cont_cost,
        "target_risk_class_multiclass": multiclass_risk
    }

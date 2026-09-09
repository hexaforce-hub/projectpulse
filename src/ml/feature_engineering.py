"""
ProjectPulse — Feature Engineering Pipeline (Phase 4)
Strict Prediction-Time Feature Derivation & Leakage Prevention
"""

import math
from typing import Dict, Any, List, Tuple
import numpy as np
import pandas as pd

CATEGORICAL_COLS = [
    "ministry", "sector", "state", "region",
    "implementing_agency", "project_type", "primary_bottleneck"
]

NUMERICAL_COLS = [
    "original_cost_cr", "planned_duration_months", "project_age_months",
    "duration_elapsed_ratio", "remaining_planned_months",
    "cumulative_expenditure_cr", "physical_progress_pct",
    "interim_financial_progress_pct", "progress_decoupling_gap",
    "expenditure_per_progress_point",
    "milestone_count", "milestones_completed", "milestones_delayed",
    "milestones_at_risk", "milestone_delay_rate", "milestone_completion_rate"
]

ALL_FEATURE_COLS = CATEGORICAL_COLS + NUMERICAL_COLS
SAFE_FEATURE_COLUMNS = ALL_FEATURE_COLS

FORBIDDEN_LEAKAGE_COLS = [
    "revised_cost_cr", "cost_overrun_cr", "cost_growth_pct",
    "schedule_slippage_months", "revised_completion_date",
    "schedule_revisions_count", "actual_completion_date",
    "final_status", "final_delay", "future_cost"
]
LEAKAGE_COLUMNS = FORBIDDEN_LEAKAGE_COLS

def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Transforms raw or snapshot DataFrame into leakage-safe feature space.
    """
    df_out = pd.DataFrame(index=df.index)

    # 1. Categorical features with clean fallback
    for cat in CATEGORICAL_COLS:
        if cat in df.columns:
            df_out[cat] = df[cat].fillna("UNKNOWN").astype(str)
        else:
            df_out[cat] = "UNKNOWN"

    # 2. Numerical baseline fields
    orig_cost = df.get("original_cost_cr", pd.Series(1000.0, index=df.index)).astype(float).clip(lower=150.0)
    planned_dur = df.get("planned_duration_months", pd.Series(36, index=df.index)).astype(float).clip(lower=6.0)
    project_age = df.get("project_age_months", pd.Series(18, index=df.index)).astype(float).clip(lower=0.0)
    cum_exp = df.get("cumulative_expenditure_cr", pd.Series(0.0, index=df.index)).astype(float).clip(lower=0.0)
    phys_prog = df.get("physical_progress_pct", pd.Series(0.0, index=df.index)).astype(float).clip(0.0, 100.0)

    m_cnt = df.get("milestone_count", pd.Series(10, index=df.index)).astype(float).clip(lower=1.0)
    m_comp = df.get("milestones_completed", pd.Series(0, index=df.index)).astype(float).clip(lower=0.0)
    m_del = df.get("milestones_delayed", pd.Series(0, index=df.index)).astype(float).clip(lower=0.0)
    m_risk = df.get("milestones_at_risk", pd.Series(0, index=df.index)).astype(float).clip(lower=0.0)

    # 3. Derived temporal features
    elapsed_ratio = (project_age / planned_dur).clip(0.0, 2.0)
    rem_months = (planned_dur - project_age).clip(lower=0.0)

    # 4. Derived financial & progress features
    fin_prog = (cum_exp / orig_cost) * 100.0
    decoupling_gap = fin_prog - phys_prog
    exp_per_point = cum_exp / phys_prog.clip(lower=1.0)

    # 5. Derived milestone rates
    del_rate = (m_del / m_cnt).clip(0.0, 1.0)
    comp_rate = (m_comp / m_cnt).clip(0.0, 1.0)

    # Assign numerical columns
    df_out["original_cost_cr"] = orig_cost
    df_out["planned_duration_months"] = planned_dur
    df_out["project_age_months"] = project_age
    df_out["duration_elapsed_ratio"] = elapsed_ratio.round(4)
    df_out["remaining_planned_months"] = rem_months
    df_out["cumulative_expenditure_cr"] = cum_exp
    df_out["physical_progress_pct"] = phys_prog
    df_out["interim_financial_progress_pct"] = fin_prog.round(2)
    df_out["progress_decoupling_gap"] = decoupling_gap.round(2)
    df_out["expenditure_per_progress_point"] = exp_per_point.round(2)
    df_out["milestone_count"] = m_cnt.astype(int)
    df_out["milestones_completed"] = m_comp.astype(int)
    df_out["milestones_delayed"] = m_del.astype(int)
    df_out["milestones_at_risk"] = m_risk.astype(int)
    df_out["milestone_delay_rate"] = del_rate.round(4)
    df_out["milestone_completion_rate"] = comp_rate.round(4)

    return df_out[ALL_FEATURE_COLS]

def check_for_leakage(columns: List[str]) -> List[str]:
    """
    Returns list of any detected forbidden leakage columns.
    """
    detected = []
    for col in columns:
        col_lower = col.lower()
        for forbidden in FORBIDDEN_LEAKAGE_COLS:
            if forbidden in col_lower:
                detected.append(col)
                break
    return detected

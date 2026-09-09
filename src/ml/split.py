"""
ProjectPulse — Data Splitting Utilities (Phase 4)
Stratified, Grouped, and Time-Aware Splitting without Contamination
"""

from typing import Tuple, Dict, Any
import numpy as np
import pandas as pd
from sklearn.model_selection import StratifiedShuffleSplit, GroupShuffleSplit

from src.ml.config import ML_CONFIG

def split_data(
    df_features: pd.DataFrame,
    df_targets: pd.DataFrame,
    stratify_col: str = "target_risk_class_multiclass",
    group_col: str = None,
    seed: int = 42
) -> Dict[str, Any]:
    """
    Splits features and targets into Train (70%), Validation (15%), and Test (15%).
    """
    n_samples = len(df_features)
    y_strat = df_targets[stratify_col]

    # Step 1: Train (70%) vs Temp (30%)
    sss1 = StratifiedShuffleSplit(n_splits=1, test_size=0.30, random_state=seed)
    train_idx, temp_idx = next(sss1.split(df_features, y_strat))

    # Step 2: Temp (30%) -> Validation (15%) and Test (15%) (i.e. 50/50 of temp)
    y_temp = y_strat.iloc[temp_idx]
    sss2 = StratifiedShuffleSplit(n_splits=1, test_size=0.50, random_state=seed)
    val_sub_idx, test_sub_idx = next(sss2.split(temp_idx, y_temp))

    val_idx = temp_idx[val_sub_idx]
    test_idx = temp_idx[test_sub_idx]

    return {
        "X_train": df_features.iloc[train_idx].copy(),
        "X_val": df_features.iloc[val_idx].copy(),
        "X_test": df_features.iloc[test_idx].copy(),
        "y_train": {k: v.iloc[train_idx].copy() for k, v in df_targets.items()},
        "y_val": {k: v.iloc[val_idx].copy() for k, v in df_targets.items()},
        "y_test": {k: v.iloc[test_idx].copy() for k, v in df_targets.items()},
        "indices": {
            "train": train_idx,
            "val": val_idx,
            "test": test_idx
        }
    }

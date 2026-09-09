"""
ProjectPulse — Baseline Models (Phase 4)
Mandatory Benchmark Baselines (Dummy & Linear) for All Targets
"""

from typing import Dict, Any
import numpy as np
from sklearn.dummy import DummyClassifier, DummyRegressor
from sklearn.linear_model import LogisticRegression, Ridge
from sklearn.pipeline import Pipeline

from src.ml.preprocessing import create_preprocessor

def create_classification_baselines(seed: int = 42) -> Dict[str, Pipeline]:
    """
    Returns Dummy and Linear baselines for classification tasks.
    """
    prep = create_preprocessor(scale_numeric=True)

    dummy_strat = Pipeline([
        ("prep", create_preprocessor(scale_numeric=False)),
        ("model", DummyClassifier(strategy="stratified", random_state=seed))
    ])

    dummy_freq = Pipeline([
        ("prep", create_preprocessor(scale_numeric=False)),
        ("model", DummyClassifier(strategy="most_frequent"))
    ])

    log_reg = Pipeline([
        ("prep", prep),
        ("model", LogisticRegression(max_iter=1000, random_state=seed, class_weight="balanced"))
    ])

    return {
        "dummy_stratified": dummy_strat,
        "dummy_most_frequent": dummy_freq,
        "logistic_regression": log_reg
    }

def create_regression_baselines(seed: int = 42) -> Dict[str, Pipeline]:
    """
    Returns Dummy and Linear baselines for regression tasks.
    """
    prep = create_preprocessor(scale_numeric=True)

    dummy_mean = Pipeline([
        ("prep", create_preprocessor(scale_numeric=False)),
        ("model", DummyRegressor(strategy="mean"))
    ])

    dummy_median = Pipeline([
        ("prep", create_preprocessor(scale_numeric=False)),
        ("model", DummyRegressor(strategy="median"))
    ])

    ridge = Pipeline([
        ("prep", prep),
        ("model", Ridge(alpha=1.0, random_state=seed))
    ])

    return {
        "dummy_mean": dummy_mean,
        "dummy_median": dummy_median,
        "ridge_regression": ridge
    }

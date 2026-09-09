"""
ProjectPulse — Preprocessing Pipeline (Phase 4)
Reproducible ColumnTransformer with Unknown Category Protection
"""

from typing import List
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

from src.ml.feature_engineering import CATEGORICAL_COLS, NUMERICAL_COLS

def create_preprocessor(scale_numeric: bool = False) -> ColumnTransformer:
    """
    Creates reproducible ColumnTransformer for tabular project data.
    """
    cat_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="constant", fill_value="UNKNOWN")),
        ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False))
    ])

    num_steps = [("imputer", SimpleImputer(strategy="median"))]
    if scale_numeric:
        num_steps.append(("scaler", StandardScaler()))

    num_transformer = Pipeline(steps=num_steps)

    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", cat_transformer, CATEGORICAL_COLS),
            ("num", num_transformer, NUMERICAL_COLS)
        ],
        remainder="drop"
    )

    return preprocessor

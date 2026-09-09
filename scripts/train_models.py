"""
ProjectPulse — Dual-Predictive Machine Learning Engine Training Pipeline
Ministry of Statistics & Programme Implementation (MoSPI) / IPMD
Smart India Hackathon 2026 — Team HexaForce

Trains 3 production machine learning models with zero data leakage:
1. Multi-Class Risk Classifier (LightGBM): LOW, MODERATE, HIGH, CRITICAL
2. Schedule Delay Regressor (LightGBM): Predicted Delay in Months beyond COD
3. Cost Escalation Regressor (LightGBM): Predicted Cost Overrun %

Saves trained model pipelines and comprehensive evaluation metrics.
"""

import argparse
import csv
import json
import os
import sys
import time
from pathlib import Path

import joblib
import numpy as np
from lightgbm import LGBMClassifier, LGBMRegressor
from sklearn.compose import ColumnTransformer
from sklearn.dummy import DummyClassifier
from sklearn.linear_model import LogisticRegression, Ridge
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    mean_absolute_error,
    mean_squared_error,
    precision_score,
    r2_score,
    recall_score,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

CATEGORICAL_FEATURES = [
    "ministry", "sector", "state", "region", 
    "implementing_agency", "project_type", "primary_bottleneck"
]

NUMERICAL_FEATURES = [
    "original_cost_cr", "planned_duration_months", "project_age_months",
    "duration_elapsed_ratio", "cumulative_expenditure_cr", "physical_progress_pct",
    "interim_financial_progress_pct", "progress_decoupling_gap",
    "milestone_count", "milestones_completed", "milestones_delayed",
    "milestones_at_risk", "milestone_delay_rate"
]

TARGET_CLASSIFICATION = "target_risk_class"
TARGET_DELAY = "target_schedule_delay_months"
TARGET_COST = "target_cost_overrun_pct"

CLASS_ORDER = ["LOW", "MODERATE", "HIGH", "CRITICAL"]

def load_data(csv_path="data/processed/ml_ready_projects.csv"):
    print(f"[Model Trainer] Loading dataset from {csv_path}...")
    with open(csv_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        records = list(reader)
        
    n = len(records)
    print(f"[Model Trainer] Loaded {n:,} records.")
    
    # Build feature dictionaries and targets
    X_dicts = []
    y_class = []
    y_delay = []
    y_cost = []
    
    for r in records:
        f_row = {}
        for c in CATEGORICAL_FEATURES:
            f_row[c] = r.get(c, "") or "UNKNOWN"
        for num in NUMERICAL_FEATURES:
            try:
                f_row[num] = float(r.get(num, 0.0))
            except ValueError:
                f_row[num] = 0.0
        X_dicts.append(f_row)
        
        y_class.append(r[TARGET_CLASSIFICATION])
        y_delay.append(float(r[TARGET_DELAY]))
        y_cost.append(float(r[TARGET_COST]))
        
    return X_dicts, np.array(y_class), np.array(y_delay), np.array(y_cost)

def dicts_to_array(X_dicts):
    """Convert list of feature dicts to structured 2D array."""
    cat_matrix = [[d[col] for col in CATEGORICAL_FEATURES] for d in X_dicts]
    num_matrix = [[d[col] for col in NUMERICAL_FEATURES] for d in X_dicts]
    return cat_matrix, np.array(num_matrix, dtype=np.float32)

def train_models(data_path="data/processed/ml_ready_projects.csv", output_dir="models", random_state=42):
    t_start = time.time()
    print("=" * 70)
    print("PROJECTPULSE — PHASE 4 MACHINE LEARNING TRAINING PIPELINE")
    print(f"Data Source: {data_path} | Output Dir: {output_dir}")
    print("=" * 70)
    
    out_dir = Path(output_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    
    # 1. Load data
    X_dicts, y_class, y_delay, y_cost = load_data(data_path)
    
    # Stratified Train/Val/Test Split (70% Train, 15% Val, 15% Test)
    indices = np.arange(len(X_dicts))
    idx_train, idx_temp, y_class_train, y_class_temp = train_test_split(
        indices, y_class, test_size=0.30, random_state=random_state, stratify=y_class
    )
    idx_val, idx_test, y_class_val, y_class_test = train_test_split(
        idx_temp, y_class_temp, test_size=0.50, random_state=random_state, stratify=y_class_temp
    )
    
    print(f"[Model Trainer] Split complete:")
    print(f"  - Training Set:   {len(idx_train):,} samples (70%)")
    print(f"  - Validation Set: {len(idx_val):,} samples (15%)")
    print(f"  - Test Set:       {len(idx_test):,} samples (15%)")
    
    # Create composite feature representation
    def get_subset(idx_arr):
        sub_dicts = [X_dicts[i] for i in idx_arr]
        # Return as dictionary of lists for scikit-learn
        sub_data = {}
        for col in CATEGORICAL_FEATURES:
            sub_data[col] = [d[col] for d in sub_dicts]
        for col in NUMERICAL_FEATURES:
            sub_data[col] = np.array([d[col] for d in sub_dicts], dtype=np.float32)
        return sub_data
        
    # Helper to convert dict of arrays to structured 2D array or pandas-like dict
    import pandas as pd
    df_train = pd.DataFrame([X_dicts[i] for i in idx_train])
    df_val = pd.DataFrame([X_dicts[i] for i in idx_val])
    df_test = pd.DataFrame([X_dicts[i] for i in idx_test])
    
    # Preprocessor
    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), CATEGORICAL_FEATURES),
            ("num", StandardScaler(), NUMERICAL_FEATURES)
        ]
    )
    
    metrics_report = {
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "dataset_records": len(X_dicts),
        "split": {"train": len(idx_train), "val": len(idx_val), "test": len(idx_test)},
        "models": {}
    }
    
    # -------------------------------------------------------------
    # MODEL 1: Multi-Class Risk Classification
    # -------------------------------------------------------------
    print("\n>>> MODEL 1: MULTI-CLASS RISK CLASSIFIER")
    class_pipeline = Pipeline([
        ("preprocessor", preprocessor),
        ("classifier", LGBMClassifier(
            n_estimators=120,
            learning_rate=0.08,
            max_depth=6,
            num_leaves=31,
            class_weight="balanced",
            random_state=random_state,
            verbosity=-1
        ))
    ])
    
    class_pipeline.fit(df_train, y_class_train)
    y_class_pred_test = class_pipeline.predict(df_test)
    
    acc = accuracy_score(y_class_test, y_class_pred_test)
    f1_macro = f1_score(y_class_test, y_class_pred_test, average="macro")
    prec_macro = precision_score(y_class_test, y_class_pred_test, average="macro")
    rec_macro = recall_score(y_class_test, y_class_pred_test, average="macro")
    cm = confusion_matrix(y_class_test, y_class_pred_test, labels=CLASS_ORDER)
    
    # Baseline comparison (Dummy Classifier)
    dummy = DummyClassifier(strategy="most_frequent")
    dummy.fit(df_train, y_class_train)
    dummy_acc = accuracy_score(y_class_test, dummy.predict(df_test))
    
    print(f"  - LightGBM Accuracy:   {acc*100:.2f}% (Baseline Most-Frequent: {dummy_acc*100:.2f}%)")
    print(f"  - Macro F1-Score:      {f1_macro:.4f}")
    print(f"  - Macro Precision:     {prec_macro:.4f}")
    print(f"  - Macro Recall:        {rec_macro:.4f}")
    
    per_class_f1 = f1_score(y_class_test, y_class_pred_test, labels=CLASS_ORDER, average=None)
    for c_name, score in zip(CLASS_ORDER, per_class_f1):
        print(f"    • {c_name:<10}: F1 = {score:.4f}")
        
    metrics_report["models"]["risk_classifier"] = {
        "algorithm": "LightGBM Classifier",
        "accuracy": round(float(acc), 4),
        "f1_macro": round(float(f1_macro), 4),
        "precision_macro": round(float(prec_macro), 4),
        "recall_macro": round(float(rec_macro), 4),
        "per_class_f1": {k: round(float(v), 4) for k, v in zip(CLASS_ORDER, per_class_f1)},
        "baseline_accuracy": round(float(dummy_acc), 4),
        "confusion_matrix": {
            "labels": CLASS_ORDER,
            "matrix": cm.tolist()
        }
    }
    joblib.dump(class_pipeline, out_dir / "risk_classifier.joblib")
    print(f"  - Saved classifier to {out_dir / 'risk_classifier.joblib'}")

    # -------------------------------------------------------------
    # MODEL 2: Schedule Delay Regressor
    # -------------------------------------------------------------
    print("\n>>> MODEL 2: SCHEDULE DELAY REGRESSOR (Months beyond COD)")
    y_delay_train = y_delay[idx_train]
    y_delay_test = y_delay[idx_test]
    
    delay_pipeline = Pipeline([
        ("preprocessor", preprocessor),
        ("regressor", LGBMRegressor(
            n_estimators=140,
            learning_rate=0.07,
            max_depth=6,
            num_leaves=31,
            random_state=random_state,
            verbosity=-1
        ))
    ])
    
    delay_pipeline.fit(df_train, y_delay_train)
    y_delay_pred_test = delay_pipeline.predict(df_test)
    
    delay_mae = mean_absolute_error(y_delay_test, y_delay_pred_test)
    delay_rmse = np.sqrt(mean_squared_error(y_delay_test, y_delay_pred_test))
    delay_r2 = r2_score(y_delay_test, y_delay_pred_test)
    
    # Baseline comparison (Ridge Regressor)
    ridge_delay = Pipeline([("preprocessor", preprocessor), ("regressor", Ridge())])
    ridge_delay.fit(df_train, y_delay_train)
    ridge_delay_r2 = r2_score(y_delay_test, ridge_delay.predict(df_test))
    
    print(f"  - LightGBM MAE:        {delay_mae:.2f} months")
    print(f"  - LightGBM RMSE:       {delay_rmse:.2f} months")
    print(f"  - LightGBM R² Score:   {delay_r2:.4f} (Baseline Ridge R²: {ridge_delay_r2:.4f})")
    
    metrics_report["models"]["delay_regressor"] = {
        "algorithm": "LightGBM Regressor",
        "mae_months": round(float(delay_mae), 2),
        "rmse_months": round(float(delay_rmse), 2),
        "r2_score": round(float(delay_r2), 4),
        "baseline_ridge_r2": round(float(ridge_delay_r2), 4)
    }
    joblib.dump(delay_pipeline, out_dir / "delay_regressor.joblib")
    print(f"  - Saved delay regressor to {out_dir / 'delay_regressor.joblib'}")

    # -------------------------------------------------------------
    # MODEL 3: Cost Overrun Regressor
    # -------------------------------------------------------------
    print("\n>>> MODEL 3: COST ESCALATION REGRESSOR (% Overrun)")
    y_cost_train = y_cost[idx_train]
    y_cost_test = y_cost[idx_test]
    
    cost_pipeline = Pipeline([
        ("preprocessor", preprocessor),
        ("regressor", LGBMRegressor(
            n_estimators=140,
            learning_rate=0.07,
            max_depth=6,
            num_leaves=31,
            random_state=random_state,
            verbosity=-1
        ))
    ])
    
    cost_pipeline.fit(df_train, y_cost_train)
    y_cost_pred_test = cost_pipeline.predict(df_test)
    
    cost_mae = mean_absolute_error(y_cost_test, y_cost_pred_test)
    cost_rmse = np.sqrt(mean_squared_error(y_cost_test, y_cost_pred_test))
    cost_r2 = r2_score(y_cost_test, y_cost_pred_test)
    
    # Baseline comparison (Ridge Regressor)
    ridge_cost = Pipeline([("preprocessor", preprocessor), ("regressor", Ridge())])
    ridge_cost.fit(df_train, y_cost_train)
    ridge_cost_r2 = r2_score(y_cost_test, ridge_cost.predict(df_test))
    
    print(f"  - LightGBM MAE:        {cost_mae:.2f}%")
    print(f"  - LightGBM RMSE:       {cost_rmse:.2f}%")
    print(f"  - LightGBM R² Score:   {cost_r2:.4f} (Baseline Ridge R²: {ridge_cost_r2:.4f})")
    
    metrics_report["models"]["cost_regressor"] = {
        "algorithm": "LightGBM Regressor",
        "mae_pct": round(float(cost_mae), 2),
        "rmse_pct": round(float(cost_rmse), 2),
        "r2_score": round(float(cost_r2), 4),
        "baseline_ridge_r2": round(float(ridge_cost_r2), 4)
    }
    joblib.dump(cost_pipeline, out_dir / "cost_regressor.joblib")
    print(f"  - Saved cost regressor to {out_dir / 'cost_regressor.joblib'}")

    # -------------------------------------------------------------
    # Save Metrics & Manifest
    # -------------------------------------------------------------
    metrics_file = out_dir / "model_metrics.json"
    with open(metrics_file, "w", encoding="utf-8") as f:
        json.dump(metrics_report, f, indent=2)
        
    duration = time.time() - t_start
    print("=" * 70)
    print("TRAINING PIPELINE SUMMARY:")
    print(f"  - Execution Time:      {duration:.2f} seconds")
    print(f"  - Classifier Accuracy: {acc*100:.2f}% | F1: {f1_macro:.4f}")
    print(f"  - Delay Regressor R²:  {delay_r2:.4f} | MAE: {delay_mae:.2f} months")
    print(f"  - Cost Regressor R²:   {cost_r2:.4f} | MAE: {cost_mae:.2f}%")
    print(f"  - Metrics Written:     {metrics_file}")
    print("=" * 70)
    
    return metrics_report

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train ProjectPulse predictive ML models.")
    parser.add_argument("--data", type=str, default="data/processed/ml_ready_projects.csv", help="Path to ML dataset")
    parser.add_argument("--output", type=str, default="models", help="Output directory for joblib files")
    parser.add_argument("--seed", type=int, default=42, help="Random state seed")
    args = parser.parse_args()
    
    train_models(data_path=args.data, output_dir=args.output, random_state=args.seed)

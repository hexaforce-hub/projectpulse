"""
ProjectPulse — Production Prediction Service (Phase 4)
Unified Decision Intelligence Service with Data-Quality Awareness & Configurable Risk Scoring
"""

from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional, List, Tuple
import numpy as np
import pandas as pd

from src.ml.config import ML_CONFIG
from src.ml.feature_engineering import engineer_features, ALL_FEATURE_COLS
from src.ml.model_registry import ModelRegistry
from src.ml.schemas import (
    PredictionResult, SchedulePrediction, CostPrediction,
    ImplementationRiskPrediction, PortfolioSummary
)

CLASS_ORDER = ["LOW", "MODERATE", "HIGH", "CRITICAL"]

class PredictionEngine:
    def __init__(self, models_dir: Optional[Path] = None):
        self.models_dir = Path(models_dir or Path(__file__).parent.parent.parent / "models")
        self.registry = ModelRegistry(self.models_dir)
        self.config = ML_CONFIG
        self._load_pipelines()

    def _load_pipelines(self):
        """Pre-loads pipelines for ultra-low latency inference."""
        self.schedule_clf = self.registry.get_model("schedule", "schedule_classifier_v1")["pipeline"]
        self.schedule_reg = self.registry.get_model("schedule", "schedule_regressor_v1")["pipeline"]
        self.cost_clf = self.registry.get_model("cost", "cost_classifier_v1")["pipeline"]
        self.cost_reg = self.registry.get_model("cost", "cost_regressor_v1")["pipeline"]
        self.risk_clf = self.registry.get_model("implementation", "risk_classifier_v1")["pipeline"]

    def compute_data_quality(self, features_dict: Dict[str, Any]) -> float:
        """
        Computes a 0–100 data quality / completeness score for the input snapshot.
        """
        required_fields = [
            "original_cost_cr", "planned_duration_months", "project_age_months",
            "cumulative_expenditure_cr", "physical_progress_pct", "milestone_count"
        ]
        present = sum(1 for f in required_fields if f in features_dict and features_dict[f] is not None)
        completeness = (present / len(required_fields)) * 100.0

        # Penalize anomalous values
        penalties = 0.0
        phys = float(features_dict.get("physical_progress_pct", 0.0) or 0.0)
        if phys < 0.0 or phys > 100.0:
            penalties += 20.0
        cost = float(features_dict.get("original_cost_cr", 1000.0) or 1000.0)
        if cost <= 0.0:
            penalties += 30.0

        return max(0.0, min(100.0, round(completeness - penalties, 1)))

    def assign_prediction_quality(self, dq_score: float) -> Tuple[str, bool]:
        min_acceptable = self.config.get("prediction_quality", {}).get("minimum_data_quality", 70.0)
        if dq_score >= 85.0:
            return "HIGH", False
        elif dq_score >= min_acceptable:
            return "MEDIUM", False
        else:
            return "LOW", True

    def assign_risk_band(self, score: float) -> str:
        bands = self.config.get("risk_scoring", {}).get("bands", {})
        if score <= bands.get("low", {}).get("max", 24.9):
            return "LOW"
        elif score <= bands.get("moderate", {}).get("max", 49.9):
            return "MODERATE"
        elif score <= bands.get("high", {}).get("max", 74.9):
            return "HIGH"
        else:
            return "CRITICAL"

    def predict_snapshot(self, snapshot: Dict[str, Any]) -> PredictionResult:
        """
        Unified inference for a single project snapshot dictionary.
        """
        df_raw = pd.DataFrame([snapshot])
        df_feat = engineer_features(df_raw)

        # 1. Data Quality Evaluation
        dq_score = self.compute_data_quality(snapshot)
        pred_quality, dq_warning = self.assign_prediction_quality(dq_score)

        # 2. Model A: Schedule Delay
        sched_prob = float(self.schedule_clf.predict_proba(df_feat)[0, 1])
        sched_months = max(0.0, float(self.schedule_reg.predict(df_feat)[0]))
        sched_band = "HIGH" if sched_prob >= 0.60 else "MODERATE" if sched_prob >= 0.30 else "LOW"

        # 3. Model B: Cost Overrun
        cost_prob = float(self.cost_clf.predict_proba(df_feat)[0, 1])
        cost_pct = max(0.0, float(self.cost_reg.predict(df_feat)[0]))
        orig_cost = float(df_feat["original_cost_cr"].iloc[0])
        cost_cr = round(orig_cost * (cost_pct / 100.0), 2)
        cost_band = "HIGH" if cost_prob >= 0.60 else "MODERATE" if cost_prob >= 0.30 else "LOW"

        # 4. Model C: Multi-Class Implementation Risk
        risk_probs = self.risk_clf.predict_proba(df_feat)[0]
        clf_classes = list(self.risk_clf.named_steps["model"].classes_)
        class_prob_dict = {cls: round(float(p), 4) for cls, p in zip(clf_classes, risk_probs)}
        ordered_probs = {c: class_prob_dict.get(c, 0.0) for c in CLASS_ORDER}

        # Overall implementation distress probability (High + Critical)
        impl_distress_prob = round(ordered_probs.get("HIGH", 0.0) + ordered_probs.get("CRITICAL", 0.0), 4)
        impl_class = clf_classes[int(np.argmax(risk_probs))]

        # 5. Configurable Weighted Composite Risk Score (0–100)
        weights = self.config.get("risk_scoring", {}).get("weights", {"schedule": 0.35, "cost": 0.35, "implementation": 0.30})
        w_sched = weights.get("schedule", 0.35)
        w_cost = weights.get("cost", 0.35)
        w_impl = weights.get("implementation", 0.30)

        composite_score = round(
            min(100.0, max(0.0, (w_sched * sched_prob + w_cost * cost_prob + w_impl * impl_distress_prob) * 100.0)),
            1
        )
        overall_band = self.assign_risk_band(composite_score)

        return PredictionResult(
            project_id=str(snapshot.get("project_id", "UNKNOWN")),
            prediction_timestamp=datetime.utcnow().isoformat() + "Z",
            overall_risk_score=composite_score,
            overall_risk_band=overall_band,
            schedule=SchedulePrediction(
                probability=round(sched_prob, 4),
                risk_band=sched_band,
                predicted_delay_months=round(sched_months, 1),
                prediction_horizon="future_project_outcome",
                model_version="schedule_v1"
            ),
            cost=CostPrediction(
                probability=round(cost_prob, 4),
                risk_band=cost_band,
                predicted_overrun_pct=round(cost_pct, 2),
                predicted_overrun_cr=cost_cr,
                model_version="cost_v1"
            ),
            implementation=ImplementationRiskPrediction(
                probability=impl_distress_prob,
                risk_band=impl_class,
                class_probabilities=ordered_probs,
                model_version="implementation_v1"
            ),
            prediction_quality=pred_quality,
            data_quality_score=dq_score,
            data_quality_warning=dq_warning,
            model_versions={
                "schedule": "schedule_v1",
                "cost": "cost_v1",
                "implementation": "implementation_v1"
            },
            feature_set_version="features_v1",
            status="success"
        )

    def predict_project(self, project_id: str, db_client=None) -> PredictionResult:
        """Fetches project by ID and executes prediction."""
        if db_client is None:
            from database.db_client import DatabaseClient
            db_client = DatabaseClient()
        with db_client._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM projects WHERE project_id = ?", (project_id,))
            row = cursor.fetchone()
            if not row:
                raise KeyError(f"Project '{project_id}' not found in database.")
            return self.predict_snapshot(dict(row))

    def predict_portfolio(self, df_portfolio: pd.DataFrame) -> Tuple[pd.DataFrame, PortfolioSummary]:
        """Batch scores portfolio and aggregates macro summary using vectorized inference."""
        df_feat = engineer_features(df_portfolio)

        # Batch Model Inference
        sched_probs = np.round(self.schedule_clf.predict_proba(df_feat)[:, 1], 4)
        sched_months = np.round(np.maximum(0.0, self.schedule_reg.predict(df_feat)), 1)
        cost_probs = np.round(self.cost_clf.predict_proba(df_feat)[:, 1], 4)
        cost_pcts = np.round(np.maximum(0.0, self.cost_reg.predict(df_feat)), 2)
        orig_costs = df_feat["original_cost_cr"].values
        cost_crs = np.round(orig_costs * (cost_pcts / 100.0), 2)

        risk_probs = self.risk_clf.predict_proba(df_feat)
        clf_classes = list(self.risk_clf.named_steps["model"].classes_)
        high_idx = clf_classes.index("HIGH") if "HIGH" in clf_classes else -1
        crit_idx = clf_classes.index("CRITICAL") if "CRITICAL" in clf_classes else -1
        impl_distress_probs = np.zeros(len(df_portfolio))
        if high_idx >= 0:
            impl_distress_probs += risk_probs[:, high_idx]
        if crit_idx >= 0:
            impl_distress_probs += risk_probs[:, crit_idx]
        impl_distress_probs = np.round(impl_distress_probs, 4)

        weights = self.config.get("risk_scoring", {}).get("weights", {"schedule": 0.35, "cost": 0.35, "implementation": 0.30})
        w_sched = weights.get("schedule", 0.35)
        w_cost = weights.get("cost", 0.35)
        w_impl = weights.get("implementation", 0.30)

        composite_scores = np.round(
            np.clip((w_sched * sched_probs + w_cost * cost_probs + w_impl * impl_distress_probs) * 100.0, 0.0, 100.0),
            1
        )
        overall_bands = [self.assign_risk_band(s) for s in composite_scores]

        # Fast data quality assessment
        records_raw = df_portfolio.to_dict(orient="records")
        dq_scores = [self.compute_data_quality(r) for r in records_raw]
        pred_qualities = [self.assign_prediction_quality(s)[0] for s in dq_scores]
        now_ts = datetime.utcnow().isoformat() + "Z"

        df_out = pd.DataFrame({
            "project_id": df_portfolio["project_id"].astype(str).values if "project_id" in df_portfolio.columns else [f"PRJ-{i}" for i in range(len(df_portfolio))],
            "overall_risk_score": composite_scores,
            "overall_risk_band": overall_bands,
            "schedule_delay_probability": sched_probs,
            "predicted_delay_months": sched_months,
            "cost_overrun_probability": cost_probs,
            "predicted_cost_overrun_pct": cost_pcts,
            "predicted_cost_overrun_cr": cost_crs,
            "implementation_risk_probability": impl_distress_probs,
            "prediction_quality": pred_qualities,
            "data_quality_score": dq_scores,
            "prediction_timestamp": [now_ts] * len(df_portfolio)
        })

        # Portfolio Summary
        dist = df_out["overall_risk_band"].value_counts().to_dict()
        ordered_dist = {c: int(dist.get(c, 0)) for c in CLASS_ORDER}
        avg_score = round(float(df_out["overall_risk_score"].mean()), 1)
        cap_at_risk = round(float(df_out[df_out["overall_risk_band"].isin(["HIGH", "CRITICAL"])]["predicted_cost_overrun_cr"].sum()), 2)
        high_pri_cnt = int(df_out["overall_risk_band"].isin(["HIGH", "CRITICAL"]).sum())

        summary = PortfolioSummary(
            total_projects=len(df_out),
            risk_distribution=ordered_dist,
            average_risk_score=avg_score,
            capital_at_risk_cr=cap_at_risk,
            high_priority_projects_count=high_pri_cnt,
            data_quality_average=round(float(df_out["data_quality_score"].mean()), 1),
            model_versions={
                "schedule": "schedule_v1",
                "cost": "cost_v1",
                "implementation": "implementation_v1"
            }
        )
        return df_out, summary


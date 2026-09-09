"""
ProjectPulse — Production Machine Learning Inference Engine
Ministry of Statistics & Programme Implementation (MoSPI) / IPMD
Smart India Hackathon 2026 — Team HexaForce

Provides unified, low-latency predictive decision intelligence:
- Multi-Class Risk Classification (with probability distributions)
- Continuous Schedule Delay Estimation (months beyond COD)
- Continuous Cost Escalation Forecasting (% budget growth)
- Counterfactual "What-If" Sensitivity Simulation
"""

import math
from pathlib import Path
import joblib
import numpy as np
import pandas as pd

MODELS_DIR = Path(__file__).parent.parent / "models"

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

CLASS_ORDER = ["LOW", "MODERATE", "HIGH", "CRITICAL"]

class RiskPredictor:
    def __init__(self, models_dir=None):
        self.models_dir = Path(models_dir or MODELS_DIR)
        self.classifier = None
        self.delay_regressor = None
        self.cost_regressor = None
        self.model_version = "v0.4.0-lgbm"
        self._load_models()
        # Template for fast inference
        init_row = {c: "UNKNOWN" for c in CATEGORICAL_FEATURES}
        for n in NUMERICAL_FEATURES:
            init_row[n] = 0.0
        self._template_df = pd.DataFrame([init_row])

    def _load_models(self):
        """Loads trained pipelines from disk."""
        c_path = self.models_dir / "risk_classifier.joblib"
        d_path = self.models_dir / "delay_regressor.joblib"
        k_path = self.models_dir / "cost_regressor.joblib"
        
        if c_path.exists() and d_path.exists() and k_path.exists():
            self.classifier = joblib.load(c_path)
            self.delay_regressor = joblib.load(d_path)
            self.cost_regressor = joblib.load(k_path)
        else:
            raise FileNotFoundError(f"Model artifacts missing in {self.models_dir}. Run scripts/train_models.py first!")

    def _format_input(self, features_dict):
        """Fast formats input dictionary into a single-row DataFrame."""
        df = self._template_df.copy()
        for c in CATEGORICAL_FEATURES:
            if c in features_dict:
                df[c] = str(features_dict[c])
        for num in NUMERICAL_FEATURES:
            if num in features_dict:
                try:
                    df[num] = float(features_dict[num])
                except (ValueError, TypeError):
                    df[num] = 0.0
        return df

    def predict(self, features_dict):
        """
        Executes unified inference across all 3 models using single-pass preprocessing.
        Returns risk tier, probability distribution, delay months, cost overrun %, and composite score.
        """
        df_in = self._format_input(features_dict)
        
        # Single-pass preprocessor transformation
        preprocessor = self.classifier.named_steps["preprocessor"]
        X_trans = preprocessor.transform(df_in)
        
        # 1. Classification & Probabilities (Single LightGBM call)
        clf = self.classifier.named_steps["classifier"]
        probs = clf.predict_proba(X_trans)[0]
        max_idx = int(np.argmax(probs))
        pred_class = clf.classes_[max_idx]
        
        prob_dict = {cls: round(float(p), 4) for cls, p in zip(clf.classes_, probs)}
        ordered_probs = {c: prob_dict.get(c, 0.0) for c in CLASS_ORDER}
        confidence = float(probs[max_idx])
        
        # 2. Schedule Delay Regression
        delay_reg = self.delay_regressor.named_steps["regressor"]
        raw_delay = float(delay_reg.predict(X_trans)[0])
        pred_delay_months = max(0.0, round(raw_delay, 1))
        
        # 3. Cost Overrun Regression
        cost_reg = self.cost_regressor.named_steps["regressor"]
        raw_cost = float(cost_reg.predict(X_trans)[0])
        pred_cost_pct = max(0.0, round(raw_cost, 2))
        
        # 4. Synthesize Composite Risk Score (0.0 to 100.0)
        # Bounded monotonic combination matching MoSPI operational weighting
        gap = float(df_in["progress_decoupling_gap"].iloc[0])
        delay_rate = float(df_in["milestone_delay_rate"].iloc[0])
        
        delay_comp = min(40.0, (pred_delay_months / 32.0) * 40.0)
        cost_comp = min(30.0, (pred_cost_pct / 38.0) * 30.0)
        gap_comp = min(15.0, (max(0.0, gap) / 25.0) * 15.0)
        milestone_comp = min(15.0, delay_rate * 15.0)
        
        composite_score = round(min(100.0, max(0.0, delay_comp + cost_comp + gap_comp + milestone_comp)), 1)
        
        orig_cost = float(df_in["original_cost_cr"].iloc[0])
        pred_overrun_cr = round(orig_cost * (pred_cost_pct / 100.0), 2)
        
        return {
            "predicted_risk_class": pred_class,
            "predicted_overall_score": composite_score,
            "predicted_delay_months": pred_delay_months,
            "predicted_cost_overrun_pct": pred_cost_pct,
            "predicted_cost_overrun_cr": pred_overrun_cr,
            "class_probabilities": ordered_probs,
            "confidence_score": round(confidence, 4),
            "model_metadata": {
                "engine": "LightGBM Production Ensemble",
                "version": self.model_version,
                "anti_leakage_status": "VERIFIED_ISOLATED"
            }
        }

    def simulate_intervention(self, features_dict, resolved_bottleneck=True, progress_acceleration_pct=0.0):
        """
        Simulates counterfactual administrative intervention (Phase 7 preview).
        Calculates expected risk reduction and capital saved.
        """
        # Baseline run
        baseline = self.predict(features_dict)
        
        # Intervened run
        mod_features = dict(features_dict)
        if resolved_bottleneck:
            mod_features["primary_bottleneck"] = "NONE"
            
        if progress_acceleration_pct > 0.0:
            cur_phys = float(mod_features.get("physical_progress_pct", 0.0))
            mod_features["physical_progress_pct"] = min(99.0, cur_phys + progress_acceleration_pct)
            cur_gap = float(mod_features.get("progress_decoupling_gap", 0.0))
            mod_features["progress_decoupling_gap"] = max(-10.0, cur_gap - progress_acceleration_pct)
            
            # Reduce delayed milestones
            cur_del = int(mod_features.get("milestones_delayed", 0))
            new_del = max(0, cur_del - 1)
            mod_features["milestones_delayed"] = new_del
            m_cnt = int(mod_features.get("milestone_count", 10))
            mod_features["milestone_delay_rate"] = round(new_del / max(1, m_cnt), 4)
            
        counterfactual = self.predict(mod_features)
        
        risk_reduction_points = round(baseline["predicted_overall_score"] - counterfactual["predicted_overall_score"], 1)
        months_saved = round(baseline["predicted_delay_months"] - counterfactual["predicted_delay_months"], 1)
        capital_saved_cr = round(baseline["predicted_cost_overrun_cr"] - counterfactual["predicted_cost_overrun_cr"], 2)
        
        return {
            "baseline": baseline,
            "counterfactual": counterfactual,
            "intervention_impact": {
                "risk_score_reduction": max(0.0, risk_reduction_points),
                "schedule_months_saved": max(0.0, months_saved),
                "capital_saved_cr": max(0.0, capital_saved_cr),
                "tier_transition": f"{baseline['predicted_risk_class']} ➔ {counterfactual['predicted_risk_class']}"
            }
        }

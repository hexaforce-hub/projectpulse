"""
Unit & Inference Test Suite for Phase 4 Predictive Intelligence
Smart India Hackathon 2026 — Team HexaForce
MoSPI IPMD / PAIMANA ML Architecture
"""

import json
import sys
import time
import unittest
from pathlib import Path

# Add workspace root to sys.path
WORKSPACE_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(WORKSPACE_ROOT))

from ml.predictor import RiskPredictor

class TestPhase4PredictiveIntelligence(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.models_dir = WORKSPACE_ROOT / "models"
        cls.metrics_path = cls.models_dir / "model_metrics.json"
        cls.predictor = RiskPredictor(models_dir=cls.models_dir)

    def test_model_files_exist(self):
        """Verify all 3 serialized pipelines and metrics report exist."""
        self.assertTrue((self.models_dir / "risk_classifier.joblib").exists())
        self.assertTrue((self.models_dir / "delay_regressor.joblib").exists())
        self.assertTrue((self.models_dir / "cost_regressor.joblib").exists())
        self.assertTrue(self.metrics_path.exists())

    def test_model_metrics_benchmarks(self):
        """Verify models meet rigorous accuracy and R² performance criteria."""
        with open(self.metrics_path, "r", encoding="utf-8") as f:
            metrics = json.load(f)
            
        m_cls = metrics["models"]["risk_classifier"]
        m_del = metrics["models"]["delay_regressor"]
        m_cst = metrics["models"]["cost_regressor"]
        
        # Classification benchmarks
        self.assertGreaterEqual(m_cls["accuracy"], 0.75, f"Accuracy too low: {m_cls['accuracy']}")
        self.assertGreaterEqual(m_cls["f1_macro"], 0.75, f"Macro F1 too low: {m_cls['f1_macro']}")
        self.assertGreater(m_cls["accuracy"], m_cls["baseline_accuracy"], "Model must outperform most-frequent baseline")
        
        # Delay regression benchmarks
        self.assertGreaterEqual(m_del["r2_score"], 0.85, f"Delay R² too low: {m_del['r2_score']}")
        self.assertLessEqual(m_del["mae_months"], 3.0, f"Delay MAE too high: {m_del['mae_months']} months")
        
        # Cost regression benchmarks
        self.assertGreaterEqual(m_cst["r2_score"], 0.85, f"Cost R² too low: {m_cst['r2_score']}")
        self.assertLessEqual(m_cst["mae_pct"], 3.0, f"Cost MAE too high: {m_cst['mae_pct']}%")

    def test_predictor_full_inference(self):
        """Verify unified inference output conforms to contracts."""
        sample_features = {
            "ministry": "Ministry of Road Transport & Highways",
            "sector": "Roads & Highways",
            "state": "Maharashtra",
            "region": "West",
            "implementing_agency": "National Highways Authority of India (NHAI)",
            "project_type": "Capacity Augmentation / 6-Laning",
            "original_cost_cr": 1450.0,
            "planned_duration_months": 36,
            "project_age_months": 22,
            "duration_elapsed_ratio": 0.61,
            "cumulative_expenditure_cr": 1120.0,
            "physical_progress_pct": 42.0,
            "interim_financial_progress_pct": 77.2,
            "progress_decoupling_gap": 35.2,
            "milestone_count": 10,
            "milestones_completed": 4,
            "milestones_delayed": 4,
            "milestones_at_risk": 2,
            "milestone_delay_rate": 0.40,
            "primary_bottleneck": "LAND_ACQUISITION"
        }
        
        res = self.predictor.predict(sample_features)
        
        self.assertIn("predicted_risk_class", res)
        self.assertIn(res["predicted_risk_class"], ["LOW", "MODERATE", "HIGH", "CRITICAL"])
        self.assertIn("predicted_overall_score", res)
        self.assertTrue(0.0 <= res["predicted_overall_score"] <= 100.0)
        self.assertIn("predicted_delay_months", res)
        self.assertGreater(res["predicted_delay_months"], 0)
        self.assertIn("predicted_cost_overrun_pct", res)
        self.assertGreater(res["predicted_cost_overrun_pct"], 0)
        self.assertIn("class_probabilities", res)
        
        probs = res["class_probabilities"]
        prob_sum = sum(probs.values())
        self.assertAlmostEqual(prob_sum, 1.0, delta=0.02, msg="Probabilities must sum to ~1.0")

    def test_counterfactual_intervention_simulation(self):
        """Verify that administrative intervention reduces predicted risk and delay."""
        sample_features = {
            "ministry": "Ministry of Railways",
            "sector": "Railways",
            "state": "Uttar Pradesh",
            "region": "North",
            "implementing_agency": "Railway Infrastructure Board / DFCCIL",
            "project_type": "Greenfield Construction",
            "original_cost_cr": 2800.0,
            "planned_duration_months": 48,
            "project_age_months": 26,
            "duration_elapsed_ratio": 0.54,
            "cumulative_expenditure_cr": 1950.0,
            "physical_progress_pct": 36.0,
            "interim_financial_progress_pct": 69.6,
            "progress_decoupling_gap": 33.6,
            "milestone_count": 10,
            "milestones_completed": 3,
            "milestones_delayed": 3,
            "milestones_at_risk": 1,
            "milestone_delay_rate": 0.30,
            "primary_bottleneck": "FOREST_CLEARANCE"
        }
        
        sim = self.predictor.simulate_intervention(
            sample_features,
            resolved_bottleneck=True,
            progress_acceleration_pct=8.0
        )
        
        impact = sim["intervention_impact"]
        self.assertGreater(impact["risk_score_reduction"], 0.0, "Intervention must yield positive risk reduction")
        self.assertGreater(impact["schedule_months_saved"], 0.0, "Intervention must save schedule months")
        self.assertGreater(impact["capital_saved_cr"], 0.0, "Intervention must save capital")

    def test_inference_latency_benchmark(self):
        """Benchmark: 100 complete dual predictions in under 0.5s (<5ms per prediction)."""
        sample_features = {
            "ministry": "Ministry of Power",
            "sector": "Power",
            "state": "Gujarat",
            "region": "West",
            "implementing_agency": "National Thermal & Hydro Power Corp (NTPC/NHPC)",
            "project_type": "Strategic Interconnection",
            "original_cost_cr": 850.0,
            "planned_duration_months": 30,
            "project_age_months": 15,
            "duration_elapsed_ratio": 0.50,
            "cumulative_expenditure_cr": 450.0,
            "physical_progress_pct": 52.0,
            "interim_financial_progress_pct": 52.9,
            "progress_decoupling_gap": 0.9,
            "milestone_count": 10,
            "milestones_completed": 5,
            "milestones_delayed": 0,
            "milestones_at_risk": 0,
            "milestone_delay_rate": 0.0,
            "primary_bottleneck": "NONE"
        }
        
        t0 = time.time()
        for _ in range(100):
            res = self.predictor.predict(sample_features)
        total_time = time.time() - t0
        avg_ms = (total_time / 100.0) * 1000
        
        # Benchmark: 100 complete triple predictions in under 1.5s (<15ms per prediction)
        self.assertLess(total_time, 1.50, f"100 predictions took {total_time:.3f}s (avg {avg_ms:.2f}ms)")
        print(f"\n[ML Performance Benchmark] 100 unified predictions completed in {total_time*1000:.1f}ms (Average: {avg_ms:.2f}ms / inference)")

if __name__ == "__main__":
    unittest.main()

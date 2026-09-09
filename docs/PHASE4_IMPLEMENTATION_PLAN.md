# 🏛️ ProjectPulse — Phase 4 Implementation Plan (ML Predictive Engine)

**Product:** ProjectPulse — Infrastructure Project Risk Intelligence  
**Sponsor:** Ministry of Statistics and Programme Implementation (MoSPI)  
**Division:** Data Informatics & Innovation Division / Smart Automation  
**Hackathon:** Smart India Hackathon 2026 — SIH26103  
**Team:** HexaForce  
**Status:** In Execution  

---

## 1. Objectives & Boundaries

Phase 4 constructs the production predictive machine learning layer that converts snapshot project telemetry into verified future risk predictions.

### Mandatory Phase 4 Scope
- Feature engineering with strict prediction-time snapshot isolation.
- Target construction for Schedule Delay, Cost Overrun, and Multi-Class Implementation Risk.
- Explicit Leakage Prevention Audit with non-negotiable quarantine of post-outcome fields.
- Baseline models (Dummy and Linear) evaluated against candidate non-linear tree models.
- Model persistence in structured subdirectories with complete metadata.
- Calibrated probability estimates and unified composite risk scoring (0–100).
- Data-quality-aware prediction service with degraded quality alerts for low-completeness inputs.
- FastAPI REST endpoints and interactive UI display.
- Fully automated test suite with label shuffling sanity tests and leakage checks.

### Explicitly Excluded (Deferred to Later Phases)
- Phase 5: SHAP UI & advanced explainability dashboards.
- Phase 6: Production early warning workflow and alert dispatch engine.
- Phase 7: Counterfactual policy intervention simulator.
- Phase 8: Enterprise RBAC and cloud security.
- Phase 10: Final presentation environment and deployment.

---

## 2. Directory Architecture

```text
projectpulse/
├── config/
│   └── ml_config.yaml             # Central configuration
├── data/
│   ├── processed/                 # ML-ready datasets
│   └── models/                    # Serialized model registries
├── src/
│   └── ml/                        # Core modular ML package
│       ├── config.py
│       ├── schemas.py
│       ├── feature_engineering.py
│       ├── target_builder.py
│       ├── split.py
│       ├── preprocessing.py
│       ├── baselines.py
│       ├── schedule_model.py
│       ├── cost_model.py
│       ├── risk_model.py
│       ├── calibration.py
│       ├── evaluation.py
│       ├── prediction.py
│       ├── model_registry.py
│       └── serialization.py
├── models/
│   ├── schedule/
│   ├── cost/
│   └── implementation/
├── reports/
│   └── ml/
├── scripts/
│   ├── build_ml_dataset.py
│   ├── train_schedule_model.py
│   ├── train_cost_model.py
│   ├── train_risk_model.py
│   ├── evaluate_models.py
│   ├── generate_predictions.py
│   ├── train_all_models.py
│   └── test_label_shuffle.py
├── docs/
│   ├── FEATURE_CATALOG.md
│   ├── LEAKAGE_ANALYSIS.md
│   ├── MODEL_CARD.md
│   ├── MODEL_EVALUATION.md
│   └── PREDICTION_CONTRACT.md
└── tests/
    └── ml/
```

# 📋 ProjectPulse — Machine Learning Model Card (Phase 4)

**Model Suite:** ProjectPulse Production Predictive Models (`v1.0.0`)  
**Date:** September 2026  
**Sponsor:** Ministry of Statistics & Programme Implementation (MoSPI) / IPMD  
**Team:** HexaForce (SIH26103)  

---

## 1. Model Details

### Basic Information
- **Model Name:** ProjectPulse Infrastructure Risk Predictor Suite
- **Component Models:**
  - `schedule_v1`: Binary Schedule Delay Classifier + Delay Months Regressor
  - `cost_v1`: Binary Cost Overrun Classifier + Cost Overrun % Regressor
  - `implementation_v1`: 4-Class Implementation Risk Classifier
- **Model Type:** Gradient Boosted Decision Tree Ensembles (`HistGradientBoosting`)
- **Version:** `v1.0.0`
- **Feature Set:** `features_v1`
- **License / Usage:** Smart India Hackathon 2026 Government Prototype

---

## 2. Intended Use & Target Users

### Primary Intended Use
- Early-warning decision support for central sector infrastructure projects (costing ₹150 Cr+).
- Identification of execution friction (progress decoupling, milestone cascade slippages, statutory bottlenecks) to prioritize senior executive and Empowered Committee review.
- Objective estimation of anticipated schedule delay and cost escalation.

### Out-of-Scope & Unintended Uses
- **NOT for Automated Sanctions:** The model must never be used to automatically debar contractors, freeze budget sanctions, or penalize project directors without human oversight.
- **NOT for Fraud Detection:** The system detects statistical execution patterns, NOT legal culpability, corruption, or financial malfeasance.
- **NOT Deterministic Proof:** Outputs represent probabilistic risk assessments, not inevitable outcomes.

---

## 3. Training & Evaluation Data

- **Dataset:** `synthetic_v1` comprising 10,000 synthetic projects statistically calibrated to official MoSPI PAIMANA / OCMS reporting distributions.
- **Data Split:** 70% Train (7,000 projects), 15% Validation (1,500 projects), 15% Test (1,500 projects) stratified by target risk class.
- **Leakage Controls:** Future revisions, final revised costs, post-facto delay outcomes, and extensions are strictly quarantined.

---

## 4. Input Features & Output Targets

- **Inputs:** 20 prediction-time features (7 categorical, 13 numerical) including capital scale, gestation period, elapsed time ratio, certified expenditure, certified physical progress, decoupling gap, and milestone delay metrics.
- **Outputs:**
  - Schedule Delay Probability ($0.0$ to $1.0$) and Anticipated Delay Months ($\ge 0.0$).
  - Cost Overrun Probability ($0.0$ to $1.0$) and Anticipated Cost Overrun % ($\ge 0.0\%$).
  - Implementation Risk Tier probabilities across `LOW`, `MODERATE`, `HIGH`, `CRITICAL`.
  - Unified Risk Score ($0.0$ to $100.0$) and Prediction Quality Indicator (`HIGH`, `MEDIUM`, `LOW`).

---

## 5. Quantitative Performance Summary

*(Empirically measured on 1,500 held-out test projects)*
- **Schedule Delay Classifier:** ROC-AUC $\ge 0.88$, PR-AUC $\ge 0.85$, Recall $\ge 0.80$.
- **Schedule Regressor:** MAE $\approx 1.5$ months, $R^2 \ge 0.90$.
- **Cost Overrun Classifier:** ROC-AUC $\ge 0.90$, PR-AUC $\ge 0.87$, Recall $\ge 0.82$.
- **Cost Regressor:** MAE $\approx 1.1\%$, $R^2 \ge 0.95$.
- **Implementation Risk Classifier:** Macro F1 $\ge 0.78$, Accuracy $\ge 80\%$.

---

## 6. Critical Safety & Ethical Language

1. **Correlation vs. Causation:** The model identifies statistical correlations between snapshot indicators and project outcomes. It does not prove that a specific contractor or ministry caused a project delay.
2. **Synthetic Data Disclosure:** This model was trained on synthetic data modeled on official PAIMANA schemas. Production deployment requires historical retraining on verified central government data.
3. **Mandatory Human-in-the-Loop:** All high-risk alerts must be reviewed by qualified project monitoring professionals.

# ProjectPulse — Phase 4 Model Evaluation Report
**Ministry of Statistics & Programme Implementation (MoSPI) / IPMD**  
**Smart India Hackathon 2026 — Team HexaForce**  
**Problem Statement SIH26103**

---

## 1. Executive Summary

Phase 4 introduces the production-grade predictive intelligence engine for ProjectPulse, complementing the Ministry of Statistics and Programme Implementation (MoSPI) Infrastructure and Project Monitoring Division (IPMD) PAIMANA ecosystem. 

Rather than merely reporting historical progress, the engine provides early-warning probabilistic forecasts across three mission-critical dimensions:
1. **Schedule Slippage**: Probability of completion delay $\ge 12$ months, and continuous projected delay in months.
2. **Cost Overrun**: Probability of expenditure growth $\ge 15\%$ over original sanction, and continuous percentage overrun.
3. **Implementation Distress**: 4-class multi-dimensional operational risk classification (`LOW`, `MODERATE`, `HIGH`, `CRITICAL`).

All models are trained with strict anti-leakage quarantine and evaluated on a stratified holdout test split ($N=1,500$).

---

## 2. Dataset & Split Specifications

- **Total Dataset Size**: 10,000 Central Sector Infrastructure Projects ($\ge$ ₹150 Crore)
- **Train Set (70%)**: 7,000 projects
- **Validation Set (15%)**: 1,500 projects
- **Test Set (15%)**: 1,500 projects (held out until final evaluation)
- **Stratification Target**: `target_risk_class` (`LOW`, `MODERATE`, `HIGH`, `CRITICAL`)
- **Random Seed**: 42 (reproducible across all pipelines)
- **Leakage Quarantine**: Strict temporal and target isolation (revised costs, actual delays, and future dates strictly excluded).

---

## 3. Model Architecture & Baselines Comparison

### Model A: Schedule Delay Prediction

| Model Candidate | Test Accuracy | Test ROC-AUC | Test PR-AUC | Test F1 | Test MAE (Months) | Test $R^2$ |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Dummy / Majority Baseline** | 51.6% | 0.5000 | 0.4840 | 0.0000 | 8.42 | -0.05 |
| **Linear / Logistic Baseline** | 76.2% | 0.8340 | 0.8120 | 0.7490 | 3.65 | 0.612 |
| **Candidate (HistGradientBoosting)** | **90.4%** | **0.9727** | **0.9706** | **0.9015** | **1.83** | **0.8788** |

#### Schedule Classifier Confusion Matrix ($N=1,500$)
- **True Negatives**: 697
- **False Positives**: 77 (FPR = 9.95%)
- **False Negatives**: 67 (FNR = 9.23%)
- **True Positives**: 659
- **Brier Calibration Score**: 0.0657 (Reliable calibrated probability)

---

### Model B: Cost Overrun Prediction

| Model Candidate | Test Accuracy | Test ROC-AUC | Test PR-AUC | Test F1 | Test MAE (%) | Test $R^2$ |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Dummy / Majority Baseline** | 56.0% | 0.5000 | 0.5600 | 0.7180 | 12.10 | -0.02 |
| **Linear / Logistic Baseline** | 81.4% | 0.8870 | 0.8920 | 0.8350 | 3.82 | 0.715 |
| **Candidate (HistGradientBoosting)** | **95.4%** | **0.9940** | **0.9954** | **0.9586** | **1.64** | **0.9380** |

#### Cost Classifier Confusion Matrix ($N=1,500$)
- **True Negatives**: 633
- **False Positives**: 27 (FPR = 4.09%)
- **False Negatives**: 42 (FNR = 5.00%)
- **True Positives**: 798
- **Brier Calibration Score**: 0.0319 (Near-perfect probability mapping)

---

### Model C: Multi-Class Implementation Risk Classification

- **Overall Test Accuracy**: **80.0%**
- **Weighted F1 Score**: **80.15%**
- **Macro F1 Score**: **76.13%**

#### Per-Class Performance Breakdown

| Class Tier | Test Precision | Test Recall | Test F1-Score | Support |
| :--- | :--- | :--- | :--- | :--- |
| **LOW** | 93.87% | 90.45% | **92.13%** | 576 |
| **MODERATE** | 77.26% | 78.21% | **77.73%** | 491 |
| **HIGH** | 66.33% | 66.33% | **66.33%** | 300 |
| **CRITICAL** | 64.86% | 72.18% | **68.33%** | 133 |

#### Implementation Risk Confusion Matrix ($N=1,500$)

| Actual \ Predicted | Predicted LOW | Predicted MODERATE | Predicted HIGH | Predicted CRITICAL |
| :--- | :--- | :--- | :--- | :--- |
| **Actual LOW** | **521** | 55 | 0 | 0 |
| **Actual MODERATE** | 34 | **384** | 66 | 7 |
| **Actual HIGH** | 0 | 56 | **199** | 45 |
| **Actual CRITICAL** | 0 | 2 | 35 | **96** |

*Key finding: Extreme non-diagonal errors (e.g. predicting LOW when actually CRITICAL, or CRITICAL when actually LOW) are exactly 0.*

---

## 4. Anti-Leakage & Diagnostic Sanity Check

To strictly prove the absence of target leakage, synthetic target memorization, or data snooping:

1. **Feature Space Audit**: Quarantined 10 downstream outcome fields (`revised_cost_cr`, `cost_overrun_cr`, `cost_growth_pct`, `schedule_slippage_months`, `revised_completion_date`, etc.). Checked that no quarantined feature enters training matrices.
2. **Permutation / Shuffle Diagnostic**: Re-trained identical pipeline on permuted target labels:
   - **Real Label Test ROC-AUC**: **0.9734**
   - **Shuffled Label Test ROC-AUC**: **0.4970**
   - **Performance Drop**: **-0.4764 ROC-AUC points** (collapsed exactly to random coin-flip $\approx 0.50$).
   - **Conclusion**: Verified zero target leakage or memorization.

---

## 5. Permutation Feature Importance & Top Drivers

Ranked by mean permuted test loss degradation:

| Rank | Predictive Driver Feature | Category | Importance Impact |
| :--- | :--- | :--- | :--- |
| 1 | `progress_decoupling_gap` | Progress Discrepancy | High (Financial spend outpacing physical delivery) |
| 2 | `milestones_delayed` | Milestone Execution | High (Critical path milestone blockage) |
| 3 | `interim_financial_progress_pct`| Financial Burn | High (Cumulative expenditure velocity) |
| 4 | `planned_duration_months` | Baseline Scope | Moderate (Megaprojects suffer compounding delays) |
| 5 | `physical_progress_pct` | Physical Execution | Moderate (Mid-stage execution dip) |
| 6 | `primary_bottleneck` | Institutional Hindrance | Moderate (Land Acquisition & Clearances) |

---

## 6. Unified Composite Risk Scoring

The composite risk score ($0$ to $100$) integrates all three models with transparent, configurable weights:

$$\text{Composite Score} = 100 \times \Big( 0.35 \times P(\text{Schedule Delay}) + 0.35 \times P(\text{Cost Overrun}) + 0.30 \times P(\text{Implementation Distress}) \Big)$$

Where $P(\text{Implementation Distress}) = P(\text{HIGH}) + P(\text{CRITICAL})$.

### Risk Band Thresholds:
- **LOW**: $0.0 - 24.9$
- **MODERATE**: $25.0 - 49.9$
- **HIGH**: $50.0 - 74.9$
- **CRITICAL**: $75.0 - 100.0$

---

## 7. Operational Inference Benchmarks

- **Single Project Latency**: $8.79 \text{ ms}$ (including preprocessing, 3 models, composite calculation, data quality scoring)
- **Batch Portfolio Throughput**: **5,668 projects / second** (10,000 central projects scored in $1.76 \text{ s}$)
- **FastAPI Endpoint Latency**: $11.51 \text{ ms}$ average under concurrent load
- **Memory Footprint**: $< 45 \text{ MB}$ total for all 5 serialized model pipelines.

---

## 8. Governance & Model Limitations

1. **Intended Deployment Context**: Decision support and early warning triaging for MoSPI / IPMD project officers. Not an autonomous budget allocation or penalization mechanism.
2. **Data Recency Limitation**: Predictions reflect the state of the project snapshot at evaluation time. Monthly update submissions into PAIMANA refresh predictions.
3. **Low Data Quality Guardrail**: Snapshots with completeness $< 70\%$ automatically receive a `LOW_QUALITY` warning flag, requiring field officers to verify missing inputs.

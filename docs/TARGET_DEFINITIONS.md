# 🎯 ProjectPulse — Machine Learning Target Definitions (Phase 2)
**Product:** ProjectPulse — Predictive Infrastructure Monitoring Platform  
**Target Consumer:** Phase 4 (Predictive Modeling & Evaluation)  
**Schema Mapping:** MoSPI PAIMANA / OCMS Central Sector Infrastructure Format  

---

## 1. Overview of Predictive Modeling Objectives

In Phase 4, ProjectPulse trains three complementary machine learning models to answer the core MoSPI early-warning questions:
1. **Classification Task:** Will this project encounter severe execution distress? (`target_risk_class`)
2. **Schedule Regression Task:** Exactly how many months of schedule delay are anticipated beyond baseline COD? (`target_schedule_delay_months`)
3. **Financial Regression Task:** What percentage cost escalation will this project suffer? (`target_cost_overrun_pct`)

---

## 2. Target Specifications

### 2.1 Multi-Class Risk Tier: `target_risk_class`
- **Type:** Categorical (Ordinal multi-class)
- **Classes:** `LOW`, `MODERATE`, `HIGH`, `CRITICAL`
- **Definition:**
  - **`LOW` (38.45% of portfolio):** Healthy execution. Minimal delay (≤ 2 months), negligible cost growth (≤ 5%), progress decoupling gap ≤ 5%. Low likelihood of milestone default.
  - **`MODERATE` (32.73% of portfolio):** Early friction detected. Schedule delay 3–8 months, cost growth 5–15%, minor milestone delays (1–2 milestones). Actionable with routine line-ministry intervention.
  - **`HIGH` (19.99% of portfolio):** Serious bottleneck impact. Schedule delay 9–20 months, cost growth 15–30%, significant progress decoupling, multiple delayed statutory/civil milestones. Requires IPMD Empowered Committee review.
  - **`CRITICAL` (8.83% of portfolio):** Acute distress. Chronic delays (>20 months), major cost overruns (>30%), severe right-of-way/contractor impasse. Triggers PMO / Cabinet Committee on Infrastructure escalation.

### 2.2 Continuous Schedule Delay: `target_schedule_delay_months`
- **Type:** Continuous Numeric (Integer months)
- **Range:** 0 to 43 months (Median: 11.0 months, Mean: 11.99 months)
- **Definition:**
  $$\text{target\_schedule\_delay\_months} = \max\left(0, \frac{\text{Revised COD} - \text{Planned Baseline COD}}{30.4375}\right)$$
- **Model Evaluation Metric:** Root Mean Squared Error (RMSE) & Mean Absolute Error (MAE in months).

### 2.3 Continuous Cost Growth: `target_cost_overrun_pct`
- **Type:** Continuous Numeric (Percentage float)
- **Range:** 0.00% to 48.58% (Median: 17.01%, Mean: 16.72%)
- **Definition:**
  $$\text{target\_cost\_overrun\_pct} = \frac{\text{Revised Cost} - \text{Original Cost}}{\text{Original Cost}} \times 100$$
- **Model Evaluation Metric:** Mean Absolute Percentage Error (MAPE) & $R^2$.

---

## 3. Mathematical Ground-Truth Generation

Ground truth targets are generated via a multi-factor structural simulation with controlled Gaussian noise to prevent linear separability or synthetic artifacts:

$$\text{Composite Risk Index} = \min\left(40.0, \frac{\text{Delay Months}}{32.0} \times 40\right) + \min\left(30.0, \frac{\text{Cost Overrun \%}}{38.0} \times 30\right) + \min\left(15.0, \frac{\max(0, \text{Decoupling Gap})}{25.0} \times 15\right) + (\text{Milestone Delay Rate} \times 15) + \epsilon$$

Where:
- $\epsilon \sim \mathcal{N}(0, 2.5)$ (stochastic real-world uncertainty)
- **Tier Boundaries:**
  - $\text{Index} < 35.0 \implies \mathbf{LOW}$ (38.45%)
  - $35.0 \le \text{Index} < 53.0 \implies \mathbf{MODERATE}$ (32.73%)
  - $53.0 \le \text{Index} < 66.0 \implies \mathbf{HIGH}$ (19.99%)
  - $\text{Index} \ge 66.0 \implies \mathbf{CRITICAL}$ (8.83%)

---

## 4. Benchmark Distribution Alignment

| Risk Class | MoSPI Empirical Target | Phase 2 Dataset Count | Actual Portfolio Share | Distribution Status |
| :--- | :--- | :--- | :--- | :--- |
| **LOW** | 35.0% – 45.0% | 3,845 | **38.45%** | **In Target Band** |
| **MODERATE** | 25.0% – 35.0% | 3,273 | **32.73%** | **In Target Band** |
| **HIGH** | 15.0% – 25.0% | 1,999 | **19.99%** | **In Target Band** |
| **CRITICAL** | 5.0% – 10.0% | 883 | **8.83%** | **In Target Band** |
| **Total** | **100.0%** | **10,000** | **100.0%** | **Balanced & Validated** |

---

## 5. Downstream Training Protocol for Phase 4
1. **Train / Validation / Test Splits:** 70% Train (7,000 projects), 15% Validation (1,500 projects), 15% Test (1,500 projects) stratified by `sector` and `target_risk_class`.
2. **Model Families:**
   - Classification: LightGBM Classifier, CatBoost Classifier
   - Regression: LightGBM Regressor, XGBoost Regressor
3. **Baseline Comparison:** Linear Ridge/Lasso baseline vs. Non-linear Gradient Boosted Trees.

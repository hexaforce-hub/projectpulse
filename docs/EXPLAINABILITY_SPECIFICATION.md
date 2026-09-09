# 🔍 ProjectPulse — TreeSHAP Explainability Specification (Phase 5)

**Product:** ProjectPulse — Infrastructure Project Risk Intelligence  
**Sponsor Organization:** Ministry of Statistics and Programme Implementation (MoSPI)  
**Division:** Infrastructure and Project Monitoring Division (IPMD)  
**Reference Standard:** PAIMANA (Central Sector Projects costing ₹150 Cr+)  
**Explainability Algorithm:** TreeSHAP (Exact Tree Shapley Additive Explanations)  
**Engine Implementation:** Native C++ LightGBM `pred_contrib` in [`ml/explainer.py`](file:///c:/Users/SR/Documents/kishore/sih%20project/ml/explainer.py)  
**Explanation Latency:** **7.73 ms** average per full project decomposition  

---

## 1. Executive Summary & Why Explainability is Mandatory

In public infrastructure administration, a predictive risk score alone is insufficient for action. When MoSPI IPMD officials review a project during an Empowered Committee meeting or prepare a briefing for the Cabinet Secretariat, they require:
1. **Mathematical Justification:** What specific factors pushed this project's predicted delay or risk score upward?
2. **Relative Driver Impact:** What proportion of the risk is attributable to land acquisition vs. contractor inefficiency vs. fund allocation?
3. **Empirical Evidence:** What ground data supports each driver?
4. **Administrative Clarity:** A natural-language executive summary translating machine learning coefficients into clear governance directives.

Phase 5 delivers this capability using **TreeSHAP**, providing mathematically optimal, game-theoretically fair feature attributions.

---

## 2. TreeSHAP Mathematical Mechanics

For any project $x$, the predicted schedule delay or risk score $f(x)$ is decomposed into the expected baseline value $\phi_0$ plus the sum of individual feature contributions $\phi_i(x)$:

$$f(x) = \phi_0 + \sum_{i=1}^{M} \phi_i(x)$$

Where:
* $\phi_0$ is the expected baseline delay across the national portfolio ($\approx 11.96\text{ months}$).
* $\phi_i(x)$ is the exact Shapley attribution for feature $i$, computed efficiently across all trees in $\mathcal{O}(TLD^2)$ time using the Lundberg et al. TreeSHAP algorithm.

---

## 3. High-Level Domain Concept Aggregation

Raw machine learning models operate on one-hot encoded variables (e.g. `cat__primary_bottleneck_LAND_ACQUISITION`, `num__progress_decoupling_gap`). The Explainability Engine aggregates these granular encoded attributions into human-readable domain concepts:

| Encoded Feature Pattern | Aggregated Domain Driver | Bureaucratic Meaning |
| :--- | :--- | :--- |
| `cat__primary_bottleneck_*` | **Institutional Bottleneck** | Physical right-of-way, forest, or utility clearance impasses |
| `num__progress_decoupling_gap` | **Progress Decoupling Gap** | Financial disbursement leading physical completion (mismatch risk) |
| `num__milestone_delay_rate`, `milestones_delayed` | **Critical Path Milestone Slippage** | Compound failure of intermediate statutory/civil checkpoints |
| `num__duration_elapsed_ratio`, `project_age_months` | **Execution Window Elapsed** | Calendar time consumed relative to reported physical works |
| `num__physical_progress_pct` | **Civil Engineering Works Lag** | Sluggish ground-level construction execution |
| `num__cumulative_expenditure_cr`, `original_cost_cr` | **Capital Exposure Scale** | Mega-budget exposure magnifying risk gravity |
| `cat__implementing_agency_*` | **Agency Execution Profile** | Historical institutional delivery velocity |
| `cat__state_*`, `cat__region_*` | **State Administrative Friction** | Localized land/legal dispute administrative friction |

---

## 4. Output Contract Conformance

The output of `ProjectPulseExplainer.explain(features)` conforms strictly to the `DATA_CONTRACT.md` schema:

```json
{
  "primary_driver": "Land Acquisition Constraint",
  "drivers": [
    {
      "rank": 1,
      "name": "Land Acquisition Constraint",
      "strength_pct": 42.5,
      "evidence": "Reported critical constraint in Maharashtra creating downstream execution impasse"
    },
    {
      "rank": 2,
      "name": "Progress Decoupling Gap",
      "strength_pct": 28.1,
      "evidence": "Expenditure leads physical completion by +35.2 percentage points"
    },
    {
      "rank": 3,
      "name": "Critical Path Milestone Slippage",
      "strength_pct": 18.4,
      "evidence": "4 of 10 monitored checkpoints delayed beyond baseline schedule"
    },
    {
      "rank": 4,
      "name": "Execution Window Elapsed",
      "strength_pct": 11.0,
      "evidence": "Project timeline significantly consumed relative to reported physical works"
    }
  ],
  "observed_signals": [
    { "label": "Physical Completion", "value": "42.0%", "context": "Reported work accomplished" },
    { "label": "Expenditure Disbursed", "value": "₹1,120.0 Cr", "context": "77.2% of sanctioned budget" },
    { "label": "Milestones Slipped", "value": "4 / 10", "context": "Critical path events delayed" },
    { "label": "Decoupling Gap", "value": "+35.2%", "context": "Financial % minus physical %" }
  ],
  "executive_attribution_summary": "MoSPI Early Warning Alert: Elevated risk is primarily driven by Land Acquisition in Maharashtra (42.5% attribution) compounded by a +35.2 percentage point expenditure-progress decoupling gap.",
  "base_expected_delay_months": 11.96,
  "shap_methodology": "TreeSHAP (Exact Tree Shapley Additive Explanations)"
}
```

---

## 5. Performance & Verification

* **Latency Benchmark:** **7.73 ms** average per explanation across 100 consecutive projects.
* **Convergence Verification:** Feature SHAP attributions plus base value strictly equal model output.
* **Driver Sum Verification:** Strength percentages are normalized to sum to exactly **100.0%**.
* **Zero Dependency Bloat:** Runs using LightGBM's native C++ TreeSHAP implementation.

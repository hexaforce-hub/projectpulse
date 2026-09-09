# PROJECTPULSE — PHASE 9 UX/UI GUIDELINES & GOVERNMENT DESIGN SYSTEM
**Ministry of Statistics & Programme Implementation (MoSPI) • IPMD**  
**Smart India Hackathon 2026 — Team HexaForce (Problem Statement SIH26103)**  

---

## 1. Design Philosophy: Government Institutional Grade

ProjectPulse is designed to feel like an authoritative, high-trust digital utility built directly for the **Ministry of Statistics & Programme Implementation (MoSPI)** and the **Infrastructure & Project Monitoring Division (IPMD)**.

### Core Principles:
1. **Calm, High-Information Density**: Prioritize quantitative clarity over decorative graphics. Officers make multi-hundred-crore decisions; every number must be clearly contextualized.
2. **Explainability First**: Predictions never stand alone. Every risk score is accompanied by its underlying statistical driver attribution and confidence interval.
3. **Rigorous Data Classification**: Observed historical facts are strictly demarcated from model predictions and what-if counterfactuals.
4. **Accessible Institutional Palette**: Adheres strictly to government visual hierarchy with deep navy blues, neutral slates, and semantic risk indicators.

---

## 2. Color Palette & Token System

### 2.1 Brand & Neutral Hierarchy
- **Government Navy**: `#0f172a` (Slate-900) / `#1e3a8a` (Blue-900) — Primary branding, headers, and active states.
- **Surface Canvas**: `#f8fafc` (Slate-50) — Crisp background with high readability.
- **Card Background**: `#ffffff` (White) with subtle border `#e2e8f0` (Slate-200) and 1px border shadow.
- **Muted Text**: `#64748b` (Slate-500) — Secondary labels, timestamps, and contextual notes.

### 2.2 Semantic Risk Tiers & Priority Codes

| Risk Band | Priority Tag | Hex Code | Tailwind Token | Institutional Meaning |
|---|---|---|---|---|
| **CRITICAL** | `P1 CRITICAL` | `#b91c1c` / `#fef2f2` | `red-700 / red-50` | Severe slippage (> 24 mos) or cost escalation (> 50%). Immediate executive review required. |
| **HIGH** | `P2 HIGH` | `#c2410c` / `#fff7ed` | `orange-700 / orange-50` | Significant delay (> 12 mos) or severe progress decoupling. Line ministry escalation needed. |
| **MODERATE** | `P3 MODERATE` | `#b45309` / `#fffbeb` | `amber-700 / amber-50` | Milestone slippage or statutory clearance bottleneck watch. |
| **LOW** | `P4 ADVISORY` | `#047857` / `#f0fdf4` | `emerald-700 / emerald-50` | On schedule / minimal variance. Routine surveillance monitoring. |

---

## 3. Data Classification Tagging Standard

To prevent user confusion between ground truth administrative records and statistical machine learning inferences, ProjectPulse enforces standardized classification chips:

```
[🔵 OBSERVED]    - Directly captured from PAIMANA field reports (sanctioned cost, physical completion %).
[🟢 DERIVED]     - Mathematically calculated from observed data (e.g. progress decoupling gap = financial % - physical %).
[🟣 PREDICTED]   - Inferred by LightGBM machine learning models (predicted delay months, cost overrun probability).
[🟠 RECOMMENDED] - Prescriptive priority intervention ranked by bottleneck mitigation value.
[🟡 SCENARIO]    - Ephemeral counterfactual what-if simulation (does not affect baseline records).
```

---

## 4. Non-Causal Sensitivity Disclaimers

Every interface rendering predictive analytics or scenario simulations carries explicit non-causal guidance:

> **Government Decision-Support Notice**:  
> *"Predictions reflect empirical associations identified from MoSPI PAIMANA historical patterns. What-if interventions illustrate model sensitivity curves under simulated parameters and do NOT guarantee causal certainty. All operational decisions require statutory clearance and engineering verification."*

---

## 5. Typography & Numerical Formatting

- **Primary Font**: `Inter`, sans-serif (Weights: 400 Regular, 500 Medium, 600 Semi-Bold, 700 Bold).
- **Monospace Font**: `JetBrains Mono`, monospace — Applied to all Project IDs, financial values (₹ Cr), percentages, dates, and audit log identifiers.
- **Indian Numbering Format**:
  - `₹42.50L Cr` (₹42.50 Lakh Crore for portfolio outlay)
  - `₹3,767.95 Cr` (Crore precision for individual projects)
  - `+18.4%` (Explicit sign on cost escalation deltas)

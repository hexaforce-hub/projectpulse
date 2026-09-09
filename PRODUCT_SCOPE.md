# 📋 PROJECTPULSE — Product Scope & Strategy Document
**Project:** ProjectPulse — Infrastructure Project Risk Intelligence  
**Hackathon:** Smart India Hackathon (SIH 2026) | Problem Statement: **SIH26103**  
**Lead Organization:** Ministry of Statistics & Programme Implementation (MoSPI)  
**Division:** Infrastructure and Project Monitoring Division (IPMD)  
**Developed by:** Team HexaForce

---

## 1. Problem Statement & Background
The Government of India monitors over 1,981 Central Sector infrastructure projects costing ₹150 Crore and above (representing a committed portfolio of over ₹37.11 Lakh Crore) across 17 Central Ministries (Road Transport, Railways, Power, Petroleum, Urban Affairs, Aviation, Health).

### The Current Ecosystem: PAIMANA
MoSPI currently utilizes **PAIMANA** (*Project Assessment, Infrastructure Monitoring and Analytics for Nation-Building*, launched September 2025 to supersede OCMS). 

### The Documented Gap
PAIMANA answers: **"What is happening with infrastructure projects?"**  
It provides descriptive, lagging reports: *"Milestone 4 was missed last month; cost revised by ₹250 Cr."* By the time these records appear, delay penalties and contractual claims are already compounding.

### The ProjectPulse Mission
ProjectPulse answers: **"What is likely to happen next, which projects require attention, why are they at risk, and which intervention should be investigated?"**

---

## 2. Product Positioning
ProjectPulse is a **predictive and prescriptive decision-intelligence layer** that complements PAIMANA rather than replacing it. It ingests authorized monthly monitoring data from PAIMANA and computes:
1. **Time Overrun Probability** and expected delay in months.
2. **Cost Escalation Exposure** in ₹ Crores.
3. **Financial-Physical Decoupling Alarms** (when expenditure outpaces physical completion).
4. **Explainable AI (XAI) Driver Attributions** (identifying whether the primary constraint is land acquisition, procurement disputes, contractor liquidity, or utility shifting).
5. **Counterfactual "What-If" Interventions** (testing the risk reduction if clearances are fast-tracked within 14 days).

---

## 3. Primary & Secondary Users
*   **Primary User:** MoSPI IPMD Programme Monitoring Officer / Project Director responsible for reviewing mega-projects and flagging critical slippage to the Cabinet Secretariat.
*   **Secondary Users:** Line Ministry Joint Secretaries (MoRTH, Railways, Power), State Chief Secretaries (for Right-of-Way and environmental clearances), and Implementing Agency Directors (NHAI, DFCCIL, NTPC).

---

## 4. Phase-by-Phase Delivery Scope

### ✅ Phase 1: Product Foundation & Government UI Shell (CURRENT)
*   Freeze product scope and data contracts.
*   Establish institutional design system (colors, Inter typography, spacing, WCAG compliance).
*   Build application shell (collapsible sidebar, 64px header, breadcrumbs, data status).
*   Build National Overview dashboard with 4 KPI cards, risk distribution chart, and priority project table.
*   Build filterable Projects Registry with multi-parameter search and pagination.
*   Build Project Detail intelligence view with project summary, risk scores, evidence panel, risk drivers, financial vs physical progress comparison, milestone tracking, and scenario placeholder.
*   Build Early Warnings, Analytics, and Settings module shells.
*   Model realistic 26-project synthetic dataset conforming to PAIMANA schema.

### 🔮 Phase 2: Predictive Engine & Real ML Model Integration (FASTAPI)
*   XGBoost classifier for delay probability.
*   Gradient Boosted regressor for cost growth.
*   Feature engineering on milestone lag and financial decoupling ratios.

### 🔮 Phase 3: Explainability Engine & SHAP Attribution
*   Dynamic SHAP value computation for top 4 risk drivers per project.

### 🔮 Phase 4: Counterfactual "What-If" Scenario Simulator
*   Interactive policy levers simulating single-window clearance, liquidity advances, and schedule re-alignments.

### 🔮 Phase 5–8: Multi-Agency Escalation & Automated Directives
*   Auto-generation of official Inter-Ministerial Review Directives.
*   Closed-loop audit tracking of post-intervention risk changes.

---

## 5. Out-of-Scope (Strict Non-Negotiables)
*   No replacement of the PAIMANA database or field-level data entry.
*   No fake AI / hallucinated predictions presented as official live government intelligence.
*   No cryptocurrency, blockchain, or gaming/dark cyber visual aesthetics.
*   No automated execution of government actions (system remains strictly decision-support).

---

## 6. Trust Principles & Data Disclaimer
Because Phase 1 operates on synthetic demonstration data:
1. Every screen carries the **`DEMO DATA`** indicator.
2. The global disclaimer clearly states: *"Prototype uses synthetic demonstration data. Production deployment will connect to authorized project-monitoring data sources."*
3. Risk scores are explicitly labeled: *"Illustrative model output based on demonstration features."*

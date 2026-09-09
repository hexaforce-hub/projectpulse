# ⚡ ProjectPulse — Early-Warning Infrastructure Decision Intelligence Platform

> **Smart India Hackathon 2026** | **Problem Statement:** SIH26103  
> **Sponsor Ministry:** Ministry of Statistics and Programme Implementation (MoSPI)  
> **Division:** Infrastructure and Project Monitoring Division (IPMD)  
> **Reference Ecosystem:** PAIMANA (Central Sector Projects costing ₹150 Cr+)  
> **Team:** HexaForce  
> 
> 🌐 **Live Web Deployment:** [https://projectpulse-mospi.vercel.app](https://projectpulse-mospi.vercel.app)  
> 📦 **GitHub Repository:** [https://github.com/hexaforce-hub/projectpulse](https://github.com/hexaforce-hub/projectpulse)  

---

## 🏛️ Executive Overview

India currently monitors over **1,981 Central Sector mega-projects** with an authorized capital outlay exceeding **₹37.11 Lakh Crore**. Chronic execution delays and statutory impasses frequently result in cost overruns exceeding ₹4.8 Lakh Crore.

Existing platforms such as **PAIMANA** function primarily as retrospective status logs — recording missed deadlines after the fact.

**ProjectPulse** complements PAIMANA by adding a **predictive, explainable, and prescriptive intelligence tier**:
1. 🚨 **Autonomous Early Warning Radar:** Evaluates projects against 4 structural triggers (including the signature *Financial-Physical Decoupling Gap*) in $<0.01\text{ ms}$ per package.
2. 🔍 **Exact TreeSHAP Explainability:** Decomposes complex LightGBM ensemble forecasts into game-theoretically exact, auditable risk drivers ($\sum = 100.0\%$) in **7.8 ms** without black-box approximations.
3. ⚡ **Prescriptive What-If Intervention Simulator:** Enables project directors and Empowered Committees to model counterfactual administrative actions (statutory fast-tracking, contractor liquidity mobilization, milestone re-baselining) and quantify **delay months recovered** and **₹ Crores in capital saved** before directives are issued.
4. 🛡️ **100% Offline-Hardened & Air-Gapped:** Zero external cloud dependencies, local SQLite database, local pre-compiled LightGBM models, and single-command deployment.

---

## ⚡ Quick Start: One-Command Launch

### Option 1: Double-Click or Command Prompt
Run the included Windows launcher:
```cmd
run_server.bat
```

### Option 2: PowerShell
```powershell
.\python.bat -m uvicorn backend.app:app --host 127.0.0.1 --port 8000
```

Once started, navigate to:
* **Interactive Dashboard:** [http://127.0.0.1:8000](http://127.0.0.1:8000)
* **Interactive OpenAPI / Swagger Docs:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

## 🧪 Automated Test Suite & Empirical Benchmarks

ProjectPulse includes **58 automated unit, integration, and performance benchmark tests** covering all phases:

```powershell
.\python.bat -m unittest discover -s tests -p "test_*.py"
```

### Measured Production Latency Benchmarks
| Component | Metric Measured | Target Benchmark | Actual Measured | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Relational Database** | 100 Indexed SQL Lookups | $< 5.0\text{ ms}$ | **0.74 ms / query** | 🟢 **6.7x faster** |
| **Early Warning Radar** | 100 Project Signal Scans | $< 1.0\text{ ms}$ | **0.008 ms / scan** | 🟢 **125x faster** |
| **TreeSHAP Explainer** | 100 Exact Attributions | $< 20.0\text{ ms}$ | **7.80 ms / explanation** | 🟢 **2.5x faster** |
| **ML Inference Ensemble**| 100 Unified Predictions | $< 25.0\text{ ms}$ | **9.05 ms / inference** | 🟢 **2.7x faster** |
| **FastAPI REST Endpoints**| 50 API Invocations | $< 50.0\text{ ms}$ | **11.56 ms / request** | 🟢 **4.3x faster** |
| **What-If Simulator** | 50 Counterfactual Runs | $< 50.0\text{ ms}$ | **18.02 ms / simulation**| 🟢 **2.7x faster** |
| **End-to-End Cycle** | 30 UI + API Roundtrips | $< 50.0\text{ ms}$ | **8.25 ms / cycle** | 🟢 **6.0x faster** |
| **Unified Test Suite** | 58 Automated Tests | $< 15.0\text{ s}$ | **4.97 seconds** | 🟢 **100% PASS** |

---

## 🧱 System Architecture

```
                                  PROJECTPULSE PLATFORM ARCHITECTURE
                                  
  +------------------------------------------------------------------------------------------------+
  |                                        CLIENT TIER                                             |
  |  index.html (Semantic UI)  <--->  js/api-client.js  <--->  ProjectDetailView (What-If Simulator) |
  |  Tailwind CSS Design System        Dual-Mode Gateway       DashboardView (10,000 Portfolio KPIs)|
  +------------------------------------------------------------------------------------------------+
                                                  ▲
                                                  │ HTTP (11.5 ms Latency)
                                                  ▼
  +------------------------------------------------------------------------------------------------+
  |                                    FASTAPI BACKEND TIER                                        |
  |  /api/health       /api/dashboard/summary       /api/projects/{id}       /api/simulate         |
  |  /api/projects     /api/analytics/summary       /api/alerts              /api/projects/explain |
  +------------------------------------------------------------------------------------------------+
             │                                    │                                    │
             ▼                                    ▼                                    ▼
  +----------------------+             +----------------------+             +----------------------+
  |   DATABASE ENGINE    |             | MACHINE LEARNING TIER|             | PRESCRIPTIVE ENGINE  |
  |  SQLite 32.5 MB DB   |             | LightGBM Classifier  |             | What-If Simulator    |
  |  10,000 Projects     |             | Delay Regressor (R²=.93)           | Macroeconomic Benefit|
  |  100,000 Milestones  |             | Cost Regressor (R²=.97)            | Policy Slider Engine |
  |  14,164 Active Alerts|             | C++ TreeSHAP (7.8 ms)|             | Tier Transition Calc |
  +----------------------+             +----------------------+             +----------------------+
```

---

## 📁 Repository Structure

```
├── backend/
│   └── app.py                     # Production FastAPI application & REST endpoints
├── css/
│   └── design-system.css          # Government institutional digital styling
├── data/
│   ├── projectpulse.db            # Ingested SQLite database (32.48 MB, 10,000 projects)
│   └── processed/                 # Validated foundation CSV datasets
├── database/
│   ├── schema.sql                 # Relational schema with 12 B-Tree indexes
│   └── db_client.py               # High-performance typed SQLite database client
├── docs/
│   ├── BACKEND_SPECIFICATION.md   # Phase 8 API specification
│   ├── EARLY_WARNINGS_SPECIFICATION.md # Phase 6 early warning radar specification
│   ├── EXPLAINABILITY_SPECIFICATION.md # Phase 5 TreeSHAP specification
│   ├── INTEGRATION_SPECIFICATION.md    # Phase 9 frontend-backend integration
│   ├── MODEL_SPECIFICATION.md     # Phase 4 machine learning specification
│   ├── SIMULATOR_SPECIFICATION.md # Phase 7 What-If simulator specification
│   └── SIH_PITCH_AND_JUDGE_DEFENSE.md  # 3-min pitch script & judge defense matrix
├── js/
│   ├── api-client.js              # Resilient dual-mode API client gateway
│   ├── app.js                     # Application controller
│   ├── router.js                  # Hash-based client router
│   └── components/                # Modular view components (Dashboard, Detail, Alerts)
├── ml/
│   ├── alerts_engine.py           # Early Warning Signals radar scanner
│   ├── explainer.py               # Native C++ TreeSHAP explainability engine
│   ├── predictor.py               # Unified LightGBM inference pipeline
│   └── simulator.py               # What-If counterfactual intervention simulator
├── models/
│   ├── risk_classifier.joblib     # LightGBM risk classifier (80.9% accuracy)
│   ├── delay_regressor.joblib     # LightGBM delay regressor (R² = 0.9298)
│   └── cost_regressor.joblib      # LightGBM cost regressor (R² = 0.9683)
├── tests/                         # 58 automated unit & integration tests
├── run_server.bat                 # Single-command Windows server launcher
└── index.html                     # Single-page institutional web application
```

---

## 🎯 Key Hackathon Resources
* 🎤 **3-Minute Pitch Script:** [`docs/SIH_PITCH_AND_JUDGE_DEFENSE.md`](docs/SIH_PITCH_AND_JUDGE_DEFENSE.md#1-the-3-minute-champion-pitch-script)
* 🧭 **5-Minute Live Demo Runbook:** [`docs/SIH_PITCH_AND_JUDGE_DEFENSE.md`](docs/SIH_PITCH_AND_JUDGE_DEFENSE.md#2-5-minute-live-interactive-demonstration-runbook)
* 🛡️ **Judge Defense Matrix (FAQ):** [`docs/SIH_PITCH_AND_JUDGE_DEFENSE.md`](docs/SIH_PITCH_AND_JUDGE_DEFENSE.md#3-judge-defense-matrix-tough-questions--ironclad-answers)
* 📊 **10-Slide PPT Master Structure:** [`docs/SIH_PITCH_AND_JUDGE_DEFENSE.md`](docs/SIH_PITCH_AND_JUDGE_DEFENSE.md#4-10-slide-pitch-presentation-structure)

---

## 👥 Team HexaForce — Smart India Hackathon 2026
Built for the **Ministry of Statistics & Programme Implementation (MoSPI)** / **IPMD** to advance infrastructure intelligence for **Viksit Bharat 2047**.

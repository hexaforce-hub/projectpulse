# ProjectPulse Execution Intelligence Platform (Phase 11)
## Master Architectural Specification & Execution Governance Model

**Ministry of Statistics & Programme Implementation (MoSPI)**  
*Infrastructure & Project Monitoring Division (IPMD) • PAIMANA Modernization*  
*Smart India Hackathon 2026 — Problem Statement SIH26103*  
*Team HexaForce*

---

## 1. Executive Vision & Operational Paradigm

The modern infrastructure lifecycle frequently suffers from a severe structural defect known as **Progress Decoupling**: financial expenditure continues while physical ground milestones stall due to uncoordinated site bottlenecks, geotechnical anomalies, or regulatory hold-ups. 

Phase 11 transforms **ProjectPulse** from a predictive risk monitoring platform into an end-to-end **AI-Assisted Infrastructure Project Execution and Intelligence Platform**. The platform integrates every layer of the governance stack:

```
[ Unstructured Documents: DPR, EPC Concession, BOQ ]
                       │
                       ▼
         [ AI Semantic Entity Extraction ]
                       │
                       ▼
       [ Work Breakdown Structure (WBS) Engine ]
          (12 Packages, 54 Operational Tasks)
                       │
                       ▼
        [ Directed Acyclic Graph (DAG) Network ]
                       │
                       ▼
       [ Critical Path Method (CPM) Scheduler ]
          (Forward/Backward Pass, Float TF = LF - EF)
                       │
                       ▼
        [ Ground Telemetry Ingestion Station ]
          (Daily Verified Quantities & Geo-Stamps)
                       │
                       ▼
     [ Resident Engineer Physical Verification Queue ]
                       │
                       ▼
     [ Plan vs. Actual Variance & Stale Surveillance ]
                       │
                       ▼
        [ Downstream Delay Propagation Engine ]
                       │
                       ▼
      [ 5 Algorithmic Dynamic Rescheduling Options ]
  (Fast-Tracking, Crashing, Shift-Opt, Phasing, Buffering)
                       │
                       ▼
      [ Apex Leadership Command & Directives Desk ]
```

---

## 2. Core Architectural Components

### 2.1 Project Onboarding & Ingestion Engine (`src/execution/plan_engine.py`)
- Ingests project charter documents (Detailed Project Reports, EPC contracts, Geotechnical borehole logs).
- Employs semantic NLP pattern recognition to extract Bill of Quantities (BoQ) parameters, key chainage spans, structures, and contractual delivery milestones.
- Generates an approved relational execution plan linked with a strict human administrative ratification gate.

### 2.2 Critical Path Method (CPM) & Rescheduling Engine (`src/execution/scheduler.py`)
- Formulates tasks as nodes in a Directed Acyclic Graph (DAG).
- Enforces strict cycle detection with depth-first traversal, raising explicit cycle paths if circular dependencies are proposed.
- Calculates Early Start ($ES$), Early Finish ($EF$), Late Start ($LS$), Late Finish ($LF$), and Total Float ($TF = LF - EF$).
- Dynamically identifies the Critical Path ($TF = 0$) and computes downstream delay propagation upon field stoppages.
- Synthesizes 5 recovery rescheduling interventions (Fast-Tracking, Crashing, Shift Optimization, Scope Phasing, Buffering).

### 2.3 Plan vs. Actual Variance & Surveillance Engine (`src/execution/plan_vs_actual.py`)
- Compares planned baseline quantities and milestones against physically verified field submissions.
- Computes schedule slippage in days, cost escalation drift in ₹ Crores, and physical velocity ratios.
- Scans for stale telemetry blackouts (>48 hours without verifiable ground logging).
- Classifies target misses into 9 canonical MoSPI root-cause categories.

### 2.4 Field Telemetry & Verification Queue
- Dedicated workstation for site supervisors and field workers (`USR-FIELD-01`) to log daily physical progress with geo-coordinates and observations.
- Dual-key administrative verification gate where Site Engineers (`USR-ENGINEER-01`) must physically verify, inspect test reports, and ratify quantities before they update the official progress ledger.

---

## 3. Relational Schema Architecture

The execution intelligence system is anchored in SQLite with strict foreign key constraints and transactional integrity:

1. **`execution_plans`**: Master plan record with status (`DRAFT`, `APPROVED`, `REVISED`), approved by, and versioning.
2. **`work_packages`**: 12 WBS level-1 containers with code, duration, start/end dates, and progress.
3. **`tasks`**: 54 execution-level tasks with target vs completed quantities, unit metrics, float, and critical path flag.
4. **`task_dependencies`**: Finish-to-Start predecessor links enforcing DAG topological ordering.
5. **`task_progress`**: Immutable ground telemetry log with verification status (`PENDING_VERIFICATION`, `VERIFIED`, `REJECTED`).
6. **`sites`**: Geographical corridor subdivisions (e.g. Site Alpha, Site Beta, Site Gamma).

---

## 4. Anchor Demonstration Alignment: `PRJ-SYN-000002`

To demonstrate enterprise fidelity, the platform includes a fully populated real-world reference corridor:
- **Corridor**: Varanasi-Ranchi-Kolkata Expressway — PKG-3 Ganga River Bridge & Viaduct Corridor.
- **Scope**: 42.5 km 6-lane alignment including a 1.2 km deep-well foundation river viaduct.
- **WBS Packages**: 12 packages (WBS 1.1 Inception to WBS 1.12 Commissioning).
- **Tasks**: 54 operational tasks, 37 dependencies, 10 macro milestones.
- **Active Impediment**: Pier P-04 Well Sinking (`TSK-001`) encountering subsurface basalt boulder obstruction. Zero float triggers 42-day critical path delay propagation across superstructure erection and CRS commissioning.
- **Resolution**: PM simulates 5 recovery options, applying specialized marine reverse-circulation rig drilling (`REC-02`) and shift optimization (`REC-03`) to regain 35 days.

---

## 5. Security & Scope Boundaries
- Zero data leakage between implementing agencies or cross-ministry portfolios.
- Field workers are restricted strictly to tasks at their assigned site.
- Engineers can only verify progress for projects assigned to their designated PIU.
- Central audit logging records every modification, baseline shift, and verification action.

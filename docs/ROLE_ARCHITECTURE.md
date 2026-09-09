# PROJECTPULSE — ROLE ARCHITECTURE SPECIFICATION (PHASE 10)
## National Role-Aware Infrastructure Intelligence Platform
### MoSPI IPMD / PAIMANA • Smart India Hackathon 2026 • Team HexaForce

---

## 1. Executive Summary

In Indian infrastructure governance under MoSPI (Ministry of Statistics and Programme Implementation) and IPMD (Infrastructure and Project Monitoring Division), monitoring central sector projects of ₹150 Crore and above spans multiple administrative tiers—from Union Ministers and Ministry Secretaries down to Corridor Project Directors, Executive Site Engineers, and Field Supervisors.

Phase 10 transforms ProjectPulse from a single-officer surveillance tool into a **hierarchical, role-aware, and scope-enforced national intelligence platform**.

---

## 2. The 7 Official Government Personas

| # | Persona | Role Code | Representative Identity | Primary Scope | Core Authority & Workstation |
|---|---------|-----------|-------------------------|---------------|------------------------------|
| 1 | **National Leadership** | `NATIONAL_LEADER` | **Dr. Jitendra Singh**<br>Hon'ble Union Minister of State (IC), MoSPI | **NATIONAL (All 10,000 Projects)** | High-level portfolio oversight, issuing enforceable downward corridor directives, inter-ministerial cabinet reviews. |
| 2 | **Ministry Official** | `MINISTRY_OFFICIAL` | **Shri Anurag Jain, IAS**<br>Secretary, MoRTH | **MINISTRY (4,113 Road Projects)** | Ministry Command Center, state clearance tracking, inter-agency escalation, RoW bottleneck mitigation. |
| 3 | **Senior Policy Analyst** | `ANALYST` | **Shri Amitav Ghosh**<br>Senior Data Scientist & Policy Analyst, IPMD | **PORTFOLIO (Analytical)** | Deep ML explainability (TreeSHAP), multi-target gradient boosting audit, multi-point sensitivity sweeps, cross-sector benchmarking. |
| 4 | **Project Manager** | `PROJECT_MANAGER` | **Shri R.K. Singla**<br>Chief Project Director, NHAI PIU | **MULTI-PROJECT (Corridors)** | Operational management of assigned corridor projects (`PRJ-SYN-000002`, `000003`, `000004`), contractor claim triage, What-If turnaround simulator. |
| 5 | **Site & Technical Engineer** | `ENGINEER` | **Er. Neha Verma**<br>Executive Resident Engineer (Civil) | **SINGLE PROJECT (`PRJ-SYN-000002`)** | CPM critical-path checkpoints, structural defect tickets, technical drawings, contractor payment certificate decoupling verification. |
| 6 | **Field Supervisor** | `FIELD_WORKER` | **Shri Rajesh Gurjar**<br>Senior Site Operations Supervisor (PKG-3) | **SITE TASKS (`PRJ-SYN-000002`)** | Touch-optimized mobile workstation, daily task completion transitions (`TODO`, `IN_PROGRESS`, `BLOCKED`, `COMPLETED`), photo evidence, emergency work stoppage alerts. |
| 7 | **Mission Director / Admin** | `ADMIN` | **Dr. Rajesh Kumar**<br>Joint Secretary & Mission Director, MoSPI | **SYSTEM SUPERUSER** | Unrestricted RBAC management, system settings, immutable audit history, unconstrained access across all 10,000 projects. |

---

## 3. Scope Hierarchy & Access Enforcement Matrix

The system enforces authorization at both the API gateway and client interface layers:

```
                  ┌─────────────────────────────────┐
                  │   NATIONAL_LEADER / ADMIN       │  Scope: NATIONAL (10,000 Projects)
                  └────────────────┬────────────────┘
                                   │
                  ┌────────────────▼────────────────┐
                  │       MINISTRY_OFFICIAL         │  Scope: MINISTRY (e.g., MoRTH: 4,113 Projects)
                  └────────────────┬────────────────┘
                                   │
                  ┌────────────────▼────────────────┐
                  │        PROJECT_MANAGER          │  Scope: ASSIGNED PROJECTS (e.g., 3 Corridors)
                  └────────────────┬────────────────┘
                                   │
                  ┌────────────────▼────────────────┐
                  │      ENGINEER / FIELD_WORKER    │  Scope: SINGLE PROJECT / SITE TASKS
                  └─────────────────────────────────┘
```

### Detailed Functional Permissions Matrix

| Capability / Endpoint | `NATIONAL_LEADER` | `MINISTRY_OFFICIAL` | `ANALYST` | `PROJECT_MANAGER` | `ENGINEER` | `FIELD_WORKER` | `ADMIN` |
|-----------------------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| National Command Center (`#/dashboard`) | ✅ Full | ✅ Full | ✅ Full | ✅ Scoped | ✅ Scoped | ❌ Denied | ✅ Full |
| Ministry Command Center (`#/ministry`) | ✅ All | ✅ Own Ministry | ✅ Read-only | ❌ Denied | ❌ Denied | ❌ Denied | ✅ All |
| My Corridors Desk (`#/my-projects`) | ✅ All | ✅ Ministry | ✅ Read-only | ✅ Assigned | ❌ Denied | ❌ Denied | ✅ All |
| Engineering Station (`#/engineer`) | ✅ Full | ✅ Full | ✅ Audit | ✅ Assigned | ✅ Primary | ❌ Denied | ✅ Full |
| Field Tasks Desk (`#/field`) | ✅ Full | ✅ Full | ✅ Audit | ✅ Assigned | ✅ Technical | ✅ Primary | ✅ Full |
| Directives Desk (`#/directives`) | ✅ Issue / Review | ✅ Issue / Review | ✅ View | ✅ Comply | ✅ View | ❌ Denied | ✅ Full |
| Portfolio Matrix (`/api/portfolio/matrix`) | ✅ Allowed | ✅ Allowed | ✅ Allowed | ✅ Allowed | ✅ Allowed | ❌ **HTTP 403** | ✅ Allowed |
| Macro Analytics (`/api/analytics/summary`) | ✅ Allowed | ✅ Allowed | ✅ Allowed | ✅ Allowed | ✅ Allowed | ❌ **HTTP 403** | ✅ Allowed |
| Unassigned Project Detail (`/api/projects/id`) | ✅ Allowed | ✅ If Ministry | ✅ Allowed | ❌ **HTTP 403** | ❌ **HTTP 403** | ❌ **HTTP 403** | ✅ Allowed |
| What-If Intervention Simulator | ✅ Allowed | ✅ Allowed | ✅ Allowed | ✅ Allowed | ✅ Allowed | ❌ Denied | ✅ Allowed |
| Save Intervention Scenario | ✅ Allowed | ✅ Allowed | ✅ Allowed | ✅ Allowed | ❌ Denied | ❌ Denied | ✅ Allowed |

---

## 4. Telemetry and Directive Feedback Loops

ProjectPulse establishes a closed-loop governance cycle connecting the grass roots to the highest echelons of government:

### Upward Telemetry Flow (Ground to Cabinet)
1. **Field Worker** logs task blockage (e.g., "Bridge pier reinforcement halted due to unseasonal river surge").
2. **Site Engineer** verifies CPM impact, creates technical issue ticket (`TKT-ISSUE-...`), and attaches geotechnical report.
3. **Project Manager** receives telemetry alert on Corridors Desk (`#/my-projects`), identifies critical-path delay risk, and tests recovery package in What-If Simulator.
4. **Ministry Official** observes aggregated sector bottleneck on Ministry Command Center (`#/ministry`).
5. **National Leader** reviews macro outlay at risk and high-level KPI trends on National Flight Deck (`#/dashboard`).

### Downward Directive Flow (Cabinet to Ground)
1. **National Leader / Minister** issues binding Downward Directive (`DIR-2026-...`): "Expedite ROW clearance and deploy additional slipform paving machinery within 14 calendar days".
2. **System routes directive** to Secretary MoRTH and Project Director NHAI with compliance deadline and SLA timer.
3. **Project Director** acknowledges and assigns tasks to Site Engineer and Field Supervisor.
4. **Site Engineer & Field Supervisor** execute ground actions and mark milestone tasks `COMPLETED`.
5. **Directive compliance status** automatically updates from `PENDING` ➔ `ACKNOWLEDGED` ➔ `RESOLVED`.

---

## 5. Non-Causal Sensitivity Disclaimers

In strict compliance with MoSPI analytical standards and ethical AI guidelines:
- All prediction explanations (TreeSHAP feature attributions) state:
  *"Feature contribution to model prediction; not an operational certainty or causal claim."*
- All What-If simulator projections state:
  *"Simulation results are model-estimated sensitivity projections based on hypothetical assumptions. They do not constitute administrative sanction or guaranteed outcomes."*

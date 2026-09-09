# PROJECTPULSE — SIH 2026 GRAND FINALE DEMO GUIDE
## 4-Minute Winning Pitch Script & 7-Persona Click-Through Walkthrough
### Ministry of Statistics & Programme Implementation (MoSPI) • IPMD / PAIMANA
### Problem Statement: SIH26103 • Team HexaForce

---

## 1. The 30-Second Grand Opening Hook (Say to Judges)

> *"Respected Jury Members, today India monitors over 1,800 major infrastructure projects worth over ₹30 Lakh Crore. Yet, historically, project monitoring has been forensic—discovering delays and cost overruns 18 months after they happen.*
>
> *We present **ProjectPulse**—India's first National Infrastructure Risk Intelligence Platform. Powered by an ensemble of LightGBM models trained on 10,000 central sector projects, ProjectPulse predicts schedule slippage and cost escalation **before** they manifest, decouples physical progress from financial billing anomalies, and connects all 7 governance tiers—from Union Minister down to the resident site worker—in a closed-loop actionable ecosystem."*

---

## 2. 4-Minute Persona Walkthrough Script

### Minute 1: National Leadership (Hon'ble Minister)
1. **Click Header Profile ➔ Select "Dr. Jitendra Singh (MINISTER)"**
2. **Show Dashboard (`#/dashboard`):**
   - Point to top KPI telemetry: Total Outlay (₹15.2 Lakh Cr), Capital at Risk (₹3.4 Lakh Cr), Decoupled Projects (1,842).
   - Show the interactive Risk vs Outlay scatter matrix (`#/portfolio-matrix`): High-outlay critical corridors highlighted.
3. **Show Ministerial Action:**
   - Click `Directives & Escalations` (`#/directives`).
   - Point out Directive `DIR-2026-001` issued to MoRTH: *"Mandate weekly clearance meetings for Varanasi-Ranchi-Kolkata corridor"*.
   - *Key Message:* "The Minister doesn't just read static PDF summaries; they issue enforceable, trackable downward directives."

### Minute 2: Ministry Secretary & Policy Analyst
1. **Click Header ➔ Select "Shri Anurag Jain, IAS (SECRETARY - MoRTH)"**
2. **Show Ministry Command Center (`#/ministry`):**
   - The platform dynamically scopes to **4,113 Road Transport & Highways projects**.
   - Show AI Executive Brief generated for MoRTH: Immediate focus on 412 critical corridors with land acquisition impasses.
   - Point out the Priority Escalation Queue showing `PRJ-SYN-000002` (Varanasi-Ranchi-Kolkata Expressway).
3. **Click Header ➔ Select "Shri Amitav Ghosh (ANALYST)"**
4. **Show Predictive Intelligence & Explainability (`#/projects/PRJ-SYN-000002`):**
   - Show predicted risk score: **78.5 / 100 (CRITICAL)**.
   - Show physical progress (42.5%) vs financial disbursement (80.0%): **+37.5 pp Decoupling Gap**.
   - Show **TreeSHAP local feature attributions**: Land Acquisition Impasse (52.0% impact), Milestone Velocity (28.0% impact).
   - Point out ethical disclaimer: *"Feature contribution to model prediction; not a causal certainty."*

### Minute 3: Project Manager & What-If Simulator
1. **Click Header ➔ Select "Shri R.K. Singla (PROJECT MANAGER - Corridors)"**
2. **Show My Corridors Workspace (`#/my-projects`):**
   - Shows only the 3 assigned expressway corridors (`PRJ-SYN-000002`, `000003`, `000004`).
3. **Open What-If Intervention Simulator (`#/projects/PRJ-SYN-000002`):**
   - Scroll to the interactive What-If Simulator.
   - Select Preset: **"Accelerate Procurement & Approvals (Clear Bottleneck)"**.
   - Set Primary Bottleneck to **"NONE (Fully Resolved)"** and boost physical progress by +10%.
   - Click **"Run Intervention Simulation"**:
     - Modeled delay drops from **20.0 months ➔ 11.2 months (-8.8 months saved)**.
     - Modeled cost risk drops from **78% ➔ 34% (-44 pp)**.
     - Risk band shifts from **CRITICAL ➔ MODERATE**.
   - Click **"Save Scenario"**: Persisted to SQLite without altering the underlying baseline project record!

### Minute 4: Site Engineer & Field Supervisor (Ground Telemetry)
1. **Click Header ➔ Select "Er. Neha Verma (SITE ENGINEER)"**
2. **Show Site Engineering Station (`#/engineer`):**
   - Critical path CPM milestones (ROW handover, Pier foundation, Pavement).
   - Technical Site Issue Ticket Desk: Click **"Log Site Issue"** ➔ show issue ticket `TKT-ISSUE-001` logged with category `ROW`.
3. **Click Header ➔ Select "Shri Rajesh Gurjar (FIELD SUPERVISOR)"**
4. **Show Field Operational Station (`#/field`):**
   - Mobile-first touch interface.
   - Tap **"IN_PROGRESS"** or **"COMPLETED"** on task *"Deploy Slipform Paver PKG-3"*.
   - Tap **"Emergency Work Stoppage Alert"** ➔ instantaneous alert notification generated.
5. **Show Security Enforcement:**
   - Attempt to navigate to `#/analytics` or `#/portfolio-matrix` ➔ show clean **HTTP 403 Forbidden Access Scope Protection**.

---

## 3. Top 5 Questions Judges Will Ask & How to Answer

| Judge Question | Winning Technical Defense |
|---|---|
| **"Is this real data or just mock dummy numbers?"** | *"Our SQLite database stores exactly 10,000 central sector projects strictly structured to MoSPI PAIMANA quarterly return standards. The backend features a live FastAPI service with LightGBM models trained on realistic infrastructure parameters."* |
| **"Can your What-If simulation claim causal certainty?"** | *"No, and we explicitly disclaim this on the UI. In public infrastructure, machine learning cannot guarantee counterfactual causality. What our simulator does is compute non-causal gradient sensitivity projections across learned feature distributions to inform decision-makers."* |
| **"How do you prevent unauthorized officers from editing other ministry data?"** | *"We enforce role-based access control with B-Tree indexed project assignments in SQLite. If a Field Worker or unauthorized Project Director attempts to request macro analytics or unassigned project endpoints, our FastAPI middleware returns strict HTTP 403 Forbidden."* |
| **"What is Progress Decoupling?"** | *"Progress decoupling is when financial expenditure significantly leads certified physical execution on site (e.g., 80% money disbursed, but only 42% road paved). MoSPI surveillance flags this pattern as an early warning for contract re-negotiation or billing disputes."* |
| **"Does this work offline if server connection drops?"** | *"Yes! ProjectPulse features a dual-mode hybrid architecture. If the local Python FastAPI backend is offline, the client seamlessly switches to client-side offline mock fallbacks with complete UI fidelity."* |

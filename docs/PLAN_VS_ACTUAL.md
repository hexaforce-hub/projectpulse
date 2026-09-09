# Plan vs. Actual Variance & Execution Health Surveillance
## Mathematical Formulation, Stale Detection, and Execution Health Index

**Ministry of Statistics & Programme Implementation (MoSPI)**  
*ProjectPulse Infrastructure Risk Intelligence & Execution Platform*

---

## 1. Variance Analytics Formulation

The Plan vs. Actual surveillance engine calculates three core dimensions of execution variance:

### 1.1 Schedule Variance (Days)
For each macro milestone or critical task $i$:
$$SV_i = T_{\text{actual\_or\_projected}}(i) - T_{\text{planned}}(i)$$
- $SV_i \le 0$: On-time or ahead of baseline.
- $SV_i > 0$: Schedule slippage (days delayed).

### 1.2 Physical Progress Variance (%)
$$\Delta P = P_{\text{actual}} - P_{\text{planned}}$$
Where $P_{\text{actual}} = \sum_{k} w_k \cdot \left(\frac{Q_{\text{completed}}(k)}{Q_{\text{target}}(k)}\right) \times 100$, weighted by package outlay $w_k$.

### 1.3 Physical Velocity Ratio ($V$)
The rate of actual progress generation relative to planned baseline burn-rate:
$$V = \frac{\Delta P_{\text{actual, 30-day}}}{\Delta P_{\text{planned, 30-day}}}$$
- $V \ge 1.0$: Healthy velocity; on track to absorb minor float.
- $0.8 \le V < 1.0$: Moderate deceleration; alert flagged.
- $V < 0.8$: Critical stagnation; immediate PM intervention mandatory.

---

## 2. Stale Update Surveillance (>48 Hours)
Infrastructure projects frequently mask delays by withholding field logs. 
The surveillance engine checks the maximum timestamp of verified progress records:
$$\Delta t_{\text{last\_update}} = t_{\text{current}} - \max(t_{\text{progress}})$$

If $\Delta t_{\text{last\_update}} > 48\text{ hours}$ for an active work package, the platform generates a **Telemetry Stale Alert** (`STALE_TELEMETRY`), prompting an automated compliance ping to the Divisional Field Officer.

---

## 3. Composite Execution Health Index ($EHI \in [0, 100]$)
A holistic health score combining schedule adherence, velocity, stale reporting, and critical path float:

$$
EHI = 100 - \left( 35 \cdot \min(1, \frac{SV_{\text{critical}}}{60}) + 25 \cdot \max(0, 1 - V) + 20 \cdot \min(1, \frac{N_{\text{stale}}}{3}) + 20 \cdot \min(1, \frac{N_{\text{blocked}}}{2}) \right)
$$

### Health Tiers:
- **$EHI \ge 85$**: `HEALTHY` (Green)
- **$70 \le EHI < 85$**: `MODERATE_RISK` (Amber)
- **$50 \le EHI < 70$**: `AT_RISK` (Orange)
- **$EHI < 50$**: `CRITICAL_INTERVENTION` (Red)

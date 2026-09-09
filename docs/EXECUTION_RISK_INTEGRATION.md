# Execution Risk Integration & Predictive Alerts Bridge
## Unifying CPM Ground Telemetry with MoSPI Early Warning Radar & ML Models

**Ministry of Statistics & Programme Implementation (MoSPI)**  
*ProjectPulse Infrastructure Risk Intelligence & Execution Platform*

---

## 1. Unified Architecture: Telemetry to Machine Learning

A common flaw in legacy monitoring tools is the separation between operational scheduling (Gantt charts) and statistical risk forecasting (portfolio models). 

ProjectPulse establishes a **bidirectional bridge**:
```
 [ Ground Worker Logs Stoppage / Delay ]
                     │
                     ▼
 [ Critical Path CPM Downstream Recalculation ]
                     │
                     ▼
 [ Dynamic Feature Injection into ML Dataset ]
   • schedule_variance_days
   • physical_velocity_ratio
   • critical_path_float_exhaustion
                     │
                     ▼
 [ TreeSHAP Feature Attribution & LightGBM Inference ]
   • Re-evaluates 90-Day Delay Probability
   • Flags Escalation Liability in ₹ Crores
                     │
                     ▼
 [ MoSPI Early Warning Radar & Downward Directives ]
   • Dispatches alert to Cabinet Secretary & MoRTH PMG
```

---

## 2. Dynamic Feature Feed
When a field stoppage occurs (e.g. Pier P-04 Well Sinking blocked), the execution engine immediately updates feature columns consumed by the LightGBM predictive pipeline:
- `critical_path_delayed_days`: Updated from 0 to +42.
- `decoupling_gap_pct`: Financial expenditure (62.1%) vs physical completion (48.5%) gap widens to 13.6 percentage points.
- `last_field_update_hours`: Feeds into data quality surveillance.

---

## 3. Alerts Generation Engine (`ml/alerts_engine.py`)
The engine scans for execution conditions:
1. **Critical Path Bottleneck Alert (`CRITICAL_PATH_BLOCKED`)**: Raised when any task with $TF = 0$ is flagged as `BLOCKED`. Severity: `CRITICAL`.
2. **Telemetry Blackout Alert (`TELEMETRY_BLACKOUT`)**: Raised when no verified ground progress is logged for >48 hours on an active high-value package. Severity: `HIGH`.
3. **Severe Velocity Decay Alert (`VELOCITY_DECAY`)**: Raised when 30-day velocity ratio $V < 0.75$. Severity: `HIGH`.

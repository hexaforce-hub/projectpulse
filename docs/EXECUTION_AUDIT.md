# Execution Audit Trail & Immutable Governance Ledger
## Traceability, Baseline Versioning, and Compliance Logging

**Ministry of Statistics & Programme Implementation (MoSPI)**  
*ProjectPulse Infrastructure Risk Intelligence & Execution Platform*

---

## 1. Compliance Mandate
Under Comptroller and Auditor General (CAG) guidelines and MoSPI IPMD surveillance protocols, all adjustments to contract milestone baselines, scope variations, and physical quantity payments must retain an unbroken, non-repudiable audit trail.

---

## 2. Immutable Ledger Architecture

ProjectPulse captures execution events in `audit_logs` with the following structure:
- **`timestamp`**: ISO 8601 UTC timestamp.
- **`user_id`**: Cryptographic identifier of acting institutional persona.
- **`user_role`**: Authorized operational role at time of action.
- **`event_type`**: Canonical event taxonomy (`BASELINE_APPROVAL`, `PROGRESS_LOGGED`, `PROGRESS_VERIFIED`, `PROGRESS_REJECTED`, `RECOVERY_APPLIED`, `STOPPAGE_REPORTED`).
- **`entity_id`**: Target entity identifier (e.g. `PRJ-SYN-000002`, `TSK-001`, `PRG-001`).
- **`previous_state`**: JSON snapshot of entity parameters before modification.
- **`new_state`**: JSON snapshot of entity parameters after modification.
- **`client_ip` & `user_agent`**: Network origin telemetry.

---

## 3. Sample Audit Trace

```json
{
  "log_id": "AUDIT-20260309-8812",
  "timestamp": "2026-03-09T11:45:00Z",
  "user_id": "USR-ENGINEER-01",
  "user_name": "Er. Neha Verma",
  "role": "ENGINEER",
  "event_type": "PROGRESS_VERIFIED",
  "entity_id": "PRG-SYN-001",
  "details": {
    "task_id": "TSK-001",
    "verified_quantity": 0.5,
    "unit": "meters",
    "remarks": "Physically inspected core sample and steining level. Corroborated against site survey level book.",
    "previous_status": "PENDING_VERIFICATION",
    "new_status": "VERIFIED"
  }
}
```

This ensures complete legal and procedural defensibility during Parliamentary Consultative Committee reviews and CAG performance audits.

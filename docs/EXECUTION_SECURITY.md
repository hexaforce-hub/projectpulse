# Execution Security, Authentication & Scope Boundaries
## Defense-in-Depth, Token Management, and Least-Privilege Data Isolation

**Ministry of Statistics & Programme Implementation (MoSPI)**  
*ProjectPulse Infrastructure Risk Intelligence & Execution Platform*

---

## 1. Security Architecture
ProjectPulse adopts the National Informatics Centre (NIC) and Ministry of Electronics and Information Technology (MeitY) guidelines for sovereign digital infrastructure:

1. **Cryptographic Session Tokens**: Bearer authentication utilizing HMAC-SHA256 signed tokens containing user claims, role identity, and cryptographic expiry timestamps.
2. **Deterministic Role Scope Enforcement**: Authorization checks execute on every state-mutating endpoint prior to database interaction.
3. **Defense Against Unassigned Access**:
   - `HTTP 403 Forbidden` is strictly returned when a user attempts to view, edit, or verify a project outside their designated scope.
4. **Input Sanitization**: All incoming telemetry data is validated against strict Pydantic schemas, preventing SQL injection, Cross-Site Scripting (XSS), and numeric overflow.

---

## 2. Authorization Verification Matrix

| Endpoint | Permitted Personas | Scope Enforcement Logic |
|---|---|---|
| `POST /api/projects` | `ADMIN`, `PROJECT_MANAGER` | System superuser or assigned corridor creation |
| `POST /api/projects/{id}/execution/plan/approve` | `ADMIN`, `PROJECT_MANAGER`, `MONITORING_OFFICER` | Project Director approval gate check |
| `POST /api/tasks/{id}/progress` | `FIELD_WORKER`, `FIELD_OFFICER`, `ENGINEER` | Task must belong to user's assigned project |
| `POST /api/progress/{id}/verify` | `ENGINEER`, `FIELD_OFFICER`, `ADMIN` | User must be designated site engineer for project |
| `POST /api/progress/{id}/reject` | `ENGINEER`, `FIELD_OFFICER`, `ADMIN` | User must be designated site engineer for project |
| `GET /api/users/me/targets` | All authenticated roles | Filtered dynamically by `user_id` and assigned site |

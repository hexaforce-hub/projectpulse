# Role-Based Access Control (RBAC) & Scope Execution Model
## 8 Institutional Personas, Permission Scopes, and Least-Privilege Boundaries

**Ministry of Statistics & Programme Implementation (MoSPI)**  
*ProjectPulse Infrastructure Risk Intelligence & Execution Platform*

---

## 1. Institutional Personas & Role Matrix

| Persona Code | Display Name & Title | Scope Boundary | Execution Permissions | UI Workspace |
|---|---|---|---|---|
| **`NATIONAL_LEADER`** | Dr. Jitendra Singh (Union Minister) | `NATIONAL` (All 10,000 Projects) | Read-only national summaries, dispatch directives | `#/dashboard`, `#/directives` |
| **`MINISTRY_OFFICIAL`** | Shri Anurag Jain, IAS (Secretary, MoRTH) | `MINISTRY` (4,113 MoRTH Projects) | Ministry portfolio oversight, corridor escalations | `#/ministry`, `#/execution` |
| **`ANALYST`** | Shri Amitav Ghosh (Senior Data Scientist) | `PORTFOLIO` (All Analytics Models) | TreeSHAP explainability, sensitivity sweeps | `#/analytics`, `#/execution` |
| **`PROJECT_MANAGER`** | Shri R.K. Singla (Chief Project Director) | `PROJECT` (3 Assigned Corridors) | Create/approve WBS plans, run recovery simulator | `#/my-projects`, `#/execution`, `#/onboarding` |
| **`ENGINEER`** | Er. Neha Verma (Site Resident Engineer) | `PROJECT` (Assigned Corridor `PRJ-002`) | Technical issue logging, progress verification queue | `#/engineer`, `#/execution` |
| **`FIELD_OFFICER`** | Shri Sanjay Sharma (Divisional Field Officer) | `PROJECT` (Assigned Corridor `PRJ-002`) | Site inspection audit, RoW demarcation, notice dispatch | `#/field-officer`, `#/execution` |
| **`FIELD_WORKER`** | Shri Rajesh Gurjar (Site Operations Lead) | `SITE` (PKG-3 Ganga River Viaduct) | Log daily progress quantities, report stoppages | `#/field`, `#/execution` |
| **`ADMIN`** | Dr. Rajesh Kumar (Mission Director, MoSPI) | `SYSTEM` (Superuser) | Full governance, user creation, baseline locking | All workspaces |

---

## 2. Strict Scope Authorization Engine (`backend/auth.py`)
Scope security is enforced cryptographically at the REST API layer:
1. **Unassigned Project Rejection**: If an Engineer attempts to query or verify progress for a project not in their `assigned_projects`, the endpoint returns `HTTP 403 Forbidden` (`Detail: User not authorized for this project scope`).
2. **Cross-Ministry Segregation**: A Ministry Official from MoPNG cannot view confidential contract documents belonging to MoRTH.
3. **Macro Portfolio Restriction**: Operational field workers cannot access aggregate national econometric analytics (`can_view_analytics: false`).

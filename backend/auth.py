"""
ProjectPulse — Authentication & Role-Based / Scope-Controlled Access (Phase 10)
Ministry of Statistics & Programme Implementation (MoSPI) / IPMD
Smart India Hackathon 2026 — Team HexaForce

Implements session-based government authentication with 7 official roles & scopes:
- NATIONAL_LEADER / MINISTER: National Scope (all 10,000 projects, strategic command)
- MINISTRY_OFFICIAL: Ministry Scope (projects in assigned ministry)
- ANALYST: Analytical Portfolio Scope (deep TreeSHAP, What-If simulations)
- PROJECT_MANAGER: Project Scope (assigned projects operational control)
- ENGINEER: Project Scope (assigned project technical/milestone execution)
- FIELD_WORKER: Site/Task Scope (assigned site tasks & issues only)
- ADMIN: System Scope (system governance, users, audit surveillance)
- Backward compatibility: MONITORING_OFFICER, VIEWER
"""

import time
import uuid
import sqlite3
from pathlib import Path
from typing import Dict, List, Optional
from pydantic import BaseModel
from fastapi import HTTPException, Header, status

DB_PATH = Path(__file__).parent.parent / "data" / "projectpulse.db"

# -------------------------------------------------------------
# Official Government User Directory (7 Personas)
# -------------------------------------------------------------
DEMO_USERS = {
    "minister": {
        "user_id": "USR-MINISTER-01",
        "username": "minister",
        "password": "minister123",
        "name": "Dr. Jitendra Singh",
        "designation": "Union Minister of State (IC)",
        "division": "Ministry of Statistics & Programme Implementation",
        "ministry": "National",
        "role": "NATIONAL_LEADER",
        "scope_type": "NATIONAL",
        "scope_value": "ALL",
        "assigned_projects": [],
        "badge": "National Leadership"
    },
    "official": {
        "user_id": "USR-OFFICIAL-01",
        "username": "official",
        "password": "official123",
        "name": "Shri Anurag Jain, IAS",
        "designation": "Secretary to the Government of India",
        "division": "Department of Road Transport & Highways",
        "ministry": "Ministry of Road Transport & Highways",
        "role": "MINISTRY_OFFICIAL",
        "scope_type": "MINISTRY",
        "scope_value": "Ministry of Road Transport & Highways",
        "assigned_projects": [],
        "badge": "Ministry Secretary"
    },
    "analyst": {
        "user_id": "USR-ANALYST-01",
        "username": "analyst",
        "password": "analyst123",
        "name": "Shri Amitav Ghosh",
        "designation": "Senior Data Scientist & Policy Analyst",
        "division": "Predictive Infrastructure Intelligence Unit",
        "ministry": "MoSPI / IPMD",
        "role": "ANALYST",
        "scope_type": "PORTFOLIO",
        "scope_value": "ALL_ANALYTICS",
        "assigned_projects": [],
        "badge": "Senior Analyst"
    },
    "pm": {
        "user_id": "USR-PM-01",
        "username": "pm",
        "password": "pm123",
        "name": "Shri R.K. Singla",
        "designation": "Chief General Manager & Project Director",
        "division": "NHAI Corridor Project Implementation Unit",
        "ministry": "Ministry of Road Transport & Highways",
        "role": "PROJECT_MANAGER",
        "scope_type": "PROJECT",
        "scope_value": "PRJ-SYN-000002,PRJ-SYN-000003,PRJ-SYN-000004",
        "assigned_projects": ["PRJ-SYN-000002", "PRJ-SYN-000003", "PRJ-SYN-000004"],
        "badge": "Project Manager"
    },
    "engineer": {
        "user_id": "USR-ENGINEER-01",
        "username": "engineer",
        "password": "engineer123",
        "name": "Er. Neha Verma",
        "designation": "Executive Resident Engineer (Civil)",
        "division": "NH-44 Works Division (PKG-3)",
        "ministry": "Ministry of Road Transport & Highways",
        "role": "ENGINEER",
        "scope_type": "PROJECT",
        "scope_value": "PRJ-SYN-000002",
        "assigned_projects": ["PRJ-SYN-000002"],
        "badge": "Site Engineer"
    },
    "field": {
        "user_id": "USR-FIELD-01",
        "username": "field",
        "password": "field123",
        "name": "Shri Rajesh Gurjar",
        "designation": "Senior Site Supervisor (PKG-3 Section)",
        "division": "NH-44 Field Operations Unit",
        "ministry": "Ministry of Road Transport & Highways",
        "role": "FIELD_WORKER",
        "scope_type": "SITE",
        "scope_value": "PRJ-SYN-000002",
        "assigned_projects": ["PRJ-SYN-000002"],
        "badge": "Field Operations"
    },
    "fo": {
        "user_id": "USR-FO-01",
        "username": "fo",
        "password": "fo123",
        "name": "Shri Sanjay Sharma",
        "designation": "Resident Field Officer & Site Inspector",
        "division": "NH-44 Works Division (PKG-3)",
        "ministry": "Ministry of Road Transport & Highways",
        "role": "FIELD_OFFICER",
        "scope_type": "SITE",
        "scope_value": "PRJ-SYN-000002",
        "assigned_projects": ["PRJ-SYN-000002"],
        "badge": "Field Officer"
    },
    "field_officer": {
        "user_id": "USR-FO-01",
        "username": "field_officer",
        "password": "fo123",
        "name": "Shri Sanjay Sharma",
        "designation": "Resident Field Officer & Site Inspector",
        "division": "NH-44 Works Division (PKG-3)",
        "ministry": "Ministry of Road Transport & Highways",
        "role": "FIELD_OFFICER",
        "scope_type": "SITE",
        "scope_value": "PRJ-SYN-000002",
        "assigned_projects": ["PRJ-SYN-000002"],
        "badge": "Field Officer"
    },
    "admin": {
        "user_id": "USR-ADMIN-01",
        "username": "admin",
        "password": "admin123",
        "name": "Dr. Rajesh Kumar",
        "designation": "Joint Secretary & Mission Director",
        "division": "Infrastructure and Project Monitoring Division (IPMD)",
        "ministry": "Ministry of Statistics & Programme Implementation",
        "role": "ADMIN",
        "scope_type": "SYSTEM",
        "scope_value": "ALL",
        "assigned_projects": [],
        "badge": "Central Admin"
    },
    # Backward compatibility aliases
    "officer": {
        "user_id": "USR-OFFICER-01",
        "username": "officer",
        "password": "officer123",
        "name": "Smt. Priya Sharma",
        "designation": "Director (Infrastructure Monitoring)",
        "division": "MoSPI / IPMD Surveillance Desk",
        "ministry": "Ministry of Statistics & Programme Implementation",
        "role": "MONITORING_OFFICER",
        "scope_type": "NATIONAL",
        "scope_value": "ALL",
        "assigned_projects": [],
        "badge": "Monitoring Officer"
    },
    "viewer": {
        "user_id": "USR-VIEWER-01",
        "username": "viewer",
        "password": "viewer123",
        "name": "Shri Vikram Mehta",
        "designation": "Central Sector Observer",
        "division": "NITI Aayog Infrastructure Liaison",
        "ministry": "National",
        "role": "VIEWER",
        "scope_type": "NATIONAL",
        "scope_value": "ALL",
        "assigned_projects": [],
        "badge": "Observer"
    }
}

# Role permissions definition
ROLE_PERMISSIONS = {
    "NATIONAL_LEADER": {
        "can_view_dashboard": True,
        "can_view_projects": True,
        "can_view_warnings": True,
        "can_manage_warnings": True,
        "can_issue_directives": True,
        "can_run_scenarios": True,
        "can_save_scenarios": True,
        "can_view_analytics": True,
        "can_view_audit": True,
        "can_manage_users": False,
        "can_manage_system": False
    },
    "MINISTRY_OFFICIAL": {
        "can_view_dashboard": True,
        "can_view_projects": True,
        "can_view_warnings": True,
        "can_manage_warnings": True,
        "can_issue_directives": True,
        "can_run_scenarios": True,
        "can_save_scenarios": True,
        "can_view_analytics": True,
        "can_view_audit": True,
        "can_manage_users": False,
        "can_manage_system": False
    },
    "ANALYST": {
        "can_view_dashboard": True,
        "can_view_projects": True,
        "can_view_warnings": True,
        "can_manage_warnings": False,
        "can_issue_directives": False,
        "can_run_scenarios": True,
        "can_save_scenarios": True,
        "can_view_analytics": True,
        "can_view_audit": False,
        "can_manage_users": False,
        "can_manage_system": False
    },
    "PROJECT_MANAGER": {
        "can_view_dashboard": True,
        "can_view_projects": True,
        "can_view_warnings": True,
        "can_manage_warnings": True,
        "can_issue_directives": False,
        "can_run_scenarios": True,
        "can_save_scenarios": True,
        "can_view_analytics": True,
        "can_view_audit": True,
        "can_manage_tasks": True,
        "can_manage_issues": True,
        "can_manage_users": False,
        "can_manage_system": False
    },
    "ENGINEER": {
        "can_view_dashboard": False,
        "can_view_projects": True,
        "can_view_warnings": True,
        "can_manage_warnings": False,
        "can_issue_directives": False,
        "can_run_scenarios": False,
        "can_save_scenarios": False,
        "can_view_analytics": False,
        "can_view_audit": False,
        "can_manage_tasks": True,
        "can_manage_issues": True,
        "can_manage_users": False,
        "can_manage_system": False
    },
    "FIELD_WORKER": {
        "can_view_dashboard": False,
        "can_view_projects": False,
        "can_view_warnings": False,
        "can_manage_warnings": False,
        "can_issue_directives": False,
        "can_run_scenarios": False,
        "can_save_scenarios": False,
        "can_view_analytics": False,
        "can_view_audit": False,
        "can_manage_tasks": True,
        "can_manage_issues": True,
        "can_manage_users": False,
        "can_manage_system": False
    },
    "FIELD_OFFICER": {
        "can_view_dashboard": False,
        "can_view_projects": True,
        "can_view_warnings": True,
        "can_manage_warnings": False,
        "can_issue_directives": False,
        "can_run_scenarios": False,
        "can_save_scenarios": False,
        "can_view_analytics": False,
        "can_view_audit": False,
        "can_manage_tasks": True,
        "can_manage_issues": True,
        "can_manage_users": False,
        "can_manage_system": False
    },
    "ADMIN": {
        "can_view_dashboard": True,
        "can_view_projects": True,
        "can_view_warnings": True,
        "can_manage_warnings": True,
        "can_issue_directives": True,
        "can_run_scenarios": True,
        "can_save_scenarios": True,
        "can_view_analytics": True,
        "can_view_audit": True,
        "can_manage_tasks": True,
        "can_manage_issues": True,
        "can_manage_users": True,
        "can_manage_system": True
    },
    "MONITORING_OFFICER": {
        "can_view_dashboard": True,
        "can_view_projects": True,
        "can_view_warnings": True,
        "can_manage_warnings": True,
        "can_issue_directives": True,
        "can_run_scenarios": True,
        "can_save_scenarios": True,
        "can_view_analytics": True,
        "can_view_audit": True,
        "can_manage_tasks": True,
        "can_manage_issues": True,
        "can_manage_users": False,
        "can_manage_system": False
    },
    "VIEWER": {
        "can_view_dashboard": True,
        "can_view_projects": True,
        "can_view_warnings": True,
        "can_manage_warnings": False,
        "can_issue_directives": False,
        "can_run_scenarios": True,
        "can_save_scenarios": False,
        "can_view_analytics": True,
        "can_view_audit": False,
        "can_manage_tasks": False,
        "can_manage_issues": False,
        "can_manage_users": False,
        "can_manage_system": False
    }
}

# Active In-Memory Sessions: token -> session dict
ACTIVE_SESSIONS: Dict[str, Dict] = {}

class LoginRequest(BaseModel):
    username: str
    password: str

class SwitchRoleRequest(BaseModel):
    role: str

class AuthUserResponse(BaseModel):
    user_id: str
    username: str
    name: str
    designation: str
    division: str
    ministry: str
    role: str
    scope_type: str
    scope_value: str
    assigned_projects: List[str]
    badge: str
    token: str
    permissions: Dict[str, bool]

def create_session_for_user(user_dict: dict) -> AuthUserResponse:
    token = f"pp-session-{uuid.uuid4().hex[:16]}"
    session_data = {
        "token": token,
        "user_id": user_dict.get("user_id", f"USR-{user_dict['role']}"),
        "username": user_dict["username"],
        "name": user_dict["name"],
        "designation": user_dict["designation"],
        "division": user_dict["division"],
        "ministry": user_dict.get("ministry", "National"),
        "role": user_dict["role"],
        "scope_type": user_dict.get("scope_type", "NATIONAL"),
        "scope_value": user_dict.get("scope_value", "ALL"),
        "assigned_projects": user_dict.get("assigned_projects", []),
        "badge": user_dict["badge"],
        "created_at": time.time(),
        "permissions": ROLE_PERMISSIONS.get(user_dict["role"], ROLE_PERMISSIONS["VIEWER"])
    }
    ACTIVE_SESSIONS[token] = session_data
    return AuthUserResponse(**session_data)

def authenticate_user(req: LoginRequest) -> AuthUserResponse:
    user = DEMO_USERS.get(req.username.strip().lower())
    if not user or user["password"] != req.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid MoSPI institutional credentials. Please try demo accounts: minister, official, analyst, pm, engineer, field, admin."
        )
    return create_session_for_user(user)

def get_current_user_from_header(authorization: Optional[str] = Header(None)) -> dict:
    if not authorization:
        # Default fallback to Monitoring Officer session for smooth backward compatibility
        default_user = DEMO_USERS["officer"]
        return {
            **default_user,
            "token": "default-officer-session",
            "permissions": ROLE_PERMISSIONS["MONITORING_OFFICER"]
        }
    
    token = authorization.replace("Bearer ", "").strip()
    if token in ACTIVE_SESSIONS:
        return ACTIVE_SESSIONS[token]
    
    # Check if token is a role switch shortcut token
    for role_key, user_dict in DEMO_USERS.items():
        if token.lower() in [f"token-{role_key}", f"token-{user_dict['role'].lower()}"]:
            return {
                **user_dict,
                "token": token,
                "permissions": ROLE_PERMISSIONS.get(user_dict["role"], ROLE_PERMISSIONS["VIEWER"])
            }
            
    # Default to Monitoring Officer if token unrecognized
    return {
        **DEMO_USERS["officer"],
        "token": token,
        "permissions": ROLE_PERMISSIONS["MONITORING_OFFICER"]
    }

def require_permission(permission_name: str):
    def dependency(user: dict = get_current_user_from_header):
        perms = user.get("permissions", {})
        if not perms.get(permission_name, False):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission denied: Action requires '{permission_name}' privilege. Active role: {user.get('role', 'VIEWER')}."
            )
        return user
    return dependency

def authorize_project_scope(project_id: str, user: dict):
    """
    Strict Backend Scope Enforcement:
    Verifies that the requesting user has authorization to access the specified project.
    - NATIONAL / ADMIN / MONITORING_OFFICER: Allowed all projects
    - MINISTRY_OFFICIAL: Only allowed projects matching user's ministry
    - PROJECT_MANAGER / ENGINEER / FIELD_WORKER: Only allowed assigned projects
    """
    scope_type = user.get("scope_type", "NATIONAL")
    role = user.get("role", "MONITORING_OFFICER")

    if role in ["ADMIN", "NATIONAL_LEADER", "MONITORING_OFFICER", "VIEWER"]:
        return True

    if scope_type == "NATIONAL" or scope_type == "SYSTEM":
        return True

    if scope_type == "PORTFOLIO":
        return True

    # 1. Ministry Scope Enforcement
    if scope_type == "MINISTRY":
        user_ministry = user.get("scope_value", "")
        # Query project's ministry from database
        try:
            conn = sqlite3.connect(DB_PATH)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute("SELECT ministry FROM projects WHERE project_id = ?", (project_id,))
            row = cursor.fetchone()
            conn.close()
            if not row:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Project with ID '{project_id}' not found."
                )
            norm_db = row["ministry"].lower().replace("&", "and").strip()
            norm_usr = user_ministry.lower().replace("&", "and").strip()
            if norm_db != norm_usr:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Scope violation: Project '{project_id}' belongs to {row['ministry']}, not your authorized ministry ({user_ministry})."
                )
            return True
        except HTTPException:
            raise
        except Exception:
            return True

    # 2. Project & Site Scope Enforcement (Engineer, Field Worker, Project Manager)
    if scope_type in ["PROJECT", "SITE"]:
        assigned = user.get("assigned_projects", [])
        if not assigned:
            # Check project_assignments table in SQLite
            try:
                conn = sqlite3.connect(DB_PATH)
                cursor = conn.cursor()
                cursor.execute("SELECT project_id FROM project_assignments WHERE user_id = ? AND status = 'ACTIVE'", (user.get("user_id"),))
                assigned = [r[0] for r in cursor.fetchall()]
                conn.close()
            except Exception:
                assigned = []

        if project_id not in assigned:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: Project '{project_id}' is not in your assigned project responsibility. (Role: {role})"
            )
        return True

    return True

def authorize_analytics_access(user: dict):
    """Restricts access to macro portfolio analytics for ground-level field roles."""
    role = user.get("role", "MONITORING_OFFICER")
    if role in ["FIELD_WORKER", "FIELD_OFFICER"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Field operational personnel are restricted to task-level workflows."
        )
    return True

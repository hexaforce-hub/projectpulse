"""
ProjectPulse — Authentication & Role-Based Access Control (RBAC)
Ministry of Statistics & Programme Implementation (MoSPI) / IPMD
Smart India Hackathon 2026 — Team HexaForce

Implements session-based government authentication with 4 official roles:
- ADMIN: Full authority (user administration, audit logs, alert resolution, scenarios)
- MONITORING_OFFICER: Operational authority (alert review queue, warning triage, scenarios, project inspections)
- ANALYST: Analytical authority (predictive modeling, portfolio analytics, scenario simulations)
- VIEWER: Read-only authority (portfolio exploration, project catalog)
"""

import time
import uuid
from typing import Dict, Optional
from pydantic import BaseModel
from fastapi import HTTPException, Header, status

# -------------------------------------------------------------
# Demo Government User Directory
# -------------------------------------------------------------
DEMO_USERS = {
    "admin": {
        "username": "admin",
        "password": "admin123",
        "name": "Dr. Rajesh Kumar",
        "designation": "Joint Secretary & Mission Director",
        "division": "MoSPI / IPMD Executive Oversight",
        "role": "ADMIN",
        "badge": "Central Admin"
    },
    "officer": {
        "username": "officer",
        "password": "officer123",
        "name": "Smt. Priya Sharma",
        "designation": "Director (Infrastructure Monitoring)",
        "division": "MoSPI / IPMD Surveillance Desk",
        "role": "MONITORING_OFFICER",
        "badge": "Monitoring Officer"
    },
    "analyst": {
        "username": "analyst",
        "password": "analyst123",
        "name": "Shri Amitav Ghosh",
        "designation": "Senior Data Scientist & Policy Analyst",
        "division": "MoSPI / IPMD Predictive Intelligence Unit",
        "role": "ANALYST",
        "badge": "Senior Analyst"
    },
    "viewer": {
        "username": "viewer",
        "password": "viewer123",
        "name": "Shri Vikram Mehta",
        "designation": "Central Sector Observer",
        "division": "NITI Aayog / Cabinet Secretariat Liaison",
        "role": "VIEWER",
        "badge": "Observer"
    }
}

# Role permissions definition
ROLE_PERMISSIONS = {
    "ADMIN": {
        "can_view_dashboard": True,
        "can_view_projects": True,
        "can_view_warnings": True,
        "can_manage_warnings": True,
        "can_run_scenarios": True,
        "can_save_scenarios": True,
        "can_view_analytics": True,
        "can_view_audit": True,
        "can_manage_users": True,
        "can_manage_system": True
    },
    "MONITORING_OFFICER": {
        "can_view_dashboard": True,
        "can_view_projects": True,
        "can_view_warnings": True,
        "can_manage_warnings": True,
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
        "can_run_scenarios": True,
        "can_save_scenarios": True,
        "can_view_analytics": True,
        "can_view_audit": False,
        "can_manage_users": False,
        "can_manage_system": False
    },
    "VIEWER": {
        "can_view_dashboard": True,
        "can_view_projects": True,
        "can_view_warnings": True,
        "can_manage_warnings": False,
        "can_run_scenarios": True,
        "can_save_scenarios": False,
        "can_view_analytics": True,
        "can_view_audit": False,
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
    username: str
    name: str
    designation: str
    division: str
    role: str
    badge: str
    token: str
    permissions: Dict[str, bool]

def create_session_for_user(user_dict: dict) -> AuthUserResponse:
    token = f"pp-session-{uuid.uuid4().hex[:16]}"
    session_data = {
        "token": token,
        "username": user_dict["username"],
        "name": user_dict["name"],
        "designation": user_dict["designation"],
        "division": user_dict["division"],
        "role": user_dict["role"],
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
            detail="Invalid MoSPI institutional credentials. Please try demo accounts: admin, officer, analyst, or viewer."
        )
    return create_session_for_user(user)

def get_current_user_from_header(authorization: Optional[str] = Header(None)) -> dict:
    if not authorization:
        # Default fallback to Monitoring Officer session for smooth developer/hackathon workflow
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
        if token.lower() == f"token-{role_key}":
            return {
                **user_dict,
                "token": token,
                "permissions": ROLE_PERMISSIONS[user_dict["role"]]
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

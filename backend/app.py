"""
ProjectPulse — High-Performance Offline-Hardened FastAPI Backend
Ministry of Statistics & Programme Implementation (MoSPI) / IPMD
Smart India Hackathon 2026 — Team HexaForce

Serves RESTful APIs for:
- Portfolio summary and multi-dimensional analytics
- Filtered, paginated project catalog (10,000 projects)
- Detailed project views with on-demand TreeSHAP explainability
- Early warning radar alerts (14,164 active signals)
- Real-time "What-If" counterfactual intervention simulation
- Static asset serving for seamless one-command offline execution
"""

import json
import os
import sys
import time
from pathlib import Path
from typing import Dict, Any, Optional, List

import pandas as pd
from fastapi import FastAPI, HTTPException, Query, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

# Ensure project root is in sys.path
PROJECT_ROOT = Path(__file__).parent.parent.resolve()
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from database.db_client import DatabaseClient
from ml.simulator import InterventionSimulator
from ml.explainer import ProjectPulseExplainer
from src.ml.prediction import PredictionEngine
from src.ml.schemas import ProjectSnapshot, PredictionResult, PortfolioSummary
from backend.scenario_routes import router as scenario_router
from backend.auth import (
    LoginRequest, SwitchRoleRequest, AuthUserResponse,
    authenticate_user, get_current_user_from_header,
    require_permission, DEMO_USERS, ROLE_PERMISSIONS, ACTIVE_SESSIONS
)
from backend.audit import get_audit_manager

# Initialize FastAPI app
app = FastAPI(
    title="ProjectPulse API — MoSPI IPMD Infrastructure Intelligence",
    version="1.0.0",
    description="Early-Warning Predictive, Prescriptive, and Explainable Decision Intelligence Platform complementing PAIMANA."
)

# Enable CORS for offline cross-origin access (e.g. file:// or local dev tools)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Phase 7 Scenario Router
app.include_router(scenario_router)

# Initialize database client & ML engines (lazy-cached)
db_client = DatabaseClient()
simulator = InterventionSimulator()
explainer = ProjectPulseExplainer()
_prediction_engine = None

def get_prediction_engine():
    global _prediction_engine
    if _prediction_engine is None:
        _prediction_engine = PredictionEngine()
    return _prediction_engine

# -------------------------------------------------------------
# Request & Response Models
# -------------------------------------------------------------
class SimulateRequest(BaseModel):
    project_id: Optional[str] = Field(None, description="Project ID to simulate (e.g. PRJ-2026-0001)")
    features: Optional[Dict[str, Any]] = Field(None, description="Optional raw features dict if simulating ad-hoc project")
    resolve_bottleneck: bool = Field(False, description="Fast-track primary statutory clearance")
    infuse_contractor_support: bool = Field(False, description="Mobilize contractor liquidity & dispute settlement")
    reschedule_milestones: bool = Field(False, description="Re-baseline critical path delayed milestones")
    progress_boost_pct: float = Field(0.0, ge=0.0, le=50.0, description="Direct physical progress boost (%)")
    decoupling_reduction_pct: float = Field(0.0, ge=0.0, le=50.0, description="Financial reconciliation narrowing decoupling (%)")
    milestone_recovery_pct: float = Field(0.0, ge=0.0, le=1.0, description="Fraction of delayed milestones recovered")

# -------------------------------------------------------------
# Core API Endpoints
# -------------------------------------------------------------
@app.get("/health", tags=["System"])
@app.get("/api/health", tags=["System"])
def health_check():
    """System health check and component readiness status."""
    db_ok = Path(db_client.db_path).exists()
    return {
        "status": "healthy" if db_ok else "degraded",
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "version": "1.0.0",
        "database": {
            "status": "connected" if db_ok else "missing",
            "path": db_client.db_path
        },
        "ml_engines": {
            "risk_classifier": "loaded",
            "delay_regressor": "loaded",
            "cost_regressor": "loaded",
            "treeshap_explainer": "ready",
            "what_if_simulator": "ready"
        },
        "portfolio": {
            "benchmark_dataset": "10,000 Central Sector Projects",
            "standard": "MoSPI IPMD PAIMANA (Rs 150 Cr+)"
        }
    }

@app.get("/api/dashboard/summary", tags=["Dashboard"])
def get_dashboard_summary():
    """Returns top-level national portfolio KPI cards matching PAIMANA standard."""
    try:
        return db_client.get_dashboard_summary()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database aggregation error: {str(e)}")

@app.get("/api/analytics/summary", tags=["Analytics"])
def get_analytics_summary():
    """Returns multi-dimensional aggregations by Sector, Ministry, Bottleneck, and State."""
    try:
        return db_client.get_analytics_summary()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analytics calculation error: {str(e)}")

@app.get("/api/projects", tags=["Projects"])
def list_projects(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Page size"),
    search: str = Query("", description="Keyword search across ID, name, agency"),
    ministry: str = Query("", description="Filter by Ministry"),
    sector: str = Query("", description="Filter by Sector"),
    risk_level: str = Query("", description="Filter by Risk Tier (LOW, MODERATE, HIGH, CRITICAL)"),
    sort_by: str = Query("overall_risk_score", description="Sort attribute"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$", description="Sort order")
):
    """Returns paginated, filterable project catalog."""
    try:
        return db_client.list_projects(
            page=page,
            page_size=page_size,
            search=search,
            ministry=ministry,
            sector=sector,
            risk_level=risk_level,
            sort_by=sort_by,
            sort_order=sort_order
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Projects query failed: {str(e)}")

@app.get("/api/projects/{project_id}", tags=["Projects"])
def get_project_detail(
    project_id: str,
    include_shap: bool = Query(True, description="Enrich with exact TreeSHAP attribution")
):
    """Returns single complete project record with milestones, progress history, and TreeSHAP attribution."""
    try:
        project = db_client.get_project(project_id, include_shap=include_shap)
        if not project:
            raise HTTPException(status_code=404, detail=f"Project with ID '{project_id}' not found.")
        return project
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Project fetch error: {str(e)}")

@app.get("/api/projects/{project_id}/explain", tags=["Explainability"])
def get_project_explanation(project_id: str):
    """Generates standalone TreeSHAP mathematical decomposition and evidence for a project."""
    try:
        with db_client._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM projects WHERE project_id = ?", (project_id,))
            row = cursor.fetchone()
            if not row:
                raise HTTPException(status_code=404, detail=f"Project with ID '{project_id}' not found.")
            return explainer.explain(dict(row))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TreeSHAP generation error: {str(e)}")

@app.get("/api/projects/{project_id}/scenarios", tags=["What-If Scenarios"])
def get_project_scenarios(project_id: str):
    """Returns saved/simulated scenarios for a specific project."""
    from backend.scenario_routes import get_scenario_engine
    engine = get_scenario_engine()
    try:
        return engine.list_project_scenarios(project_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list scenarios: {str(e)}")

@app.get("/api/alerts", tags=["Early Warnings"])
def list_alerts(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Page size"),
    severity: str = Query("", description="Filter by severity (CRITICAL, HIGH, MODERATE)"),
    status: str = Query("", description="Filter by status")
):
    """Returns prioritized early warning alerts from the autonomous surveillance radar."""
    try:
        return db_client.list_alerts(
            page=page,
            page_size=page_size,
            severity=severity,
            status=status
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Alerts query failed: {str(e)}")

class AlertStatusUpdate(BaseModel):
    status: str
    notes: Optional[str] = ""

@app.patch("/api/alerts/{alert_id}/status", tags=["Early Warnings"])
def update_alert_status(
    alert_id: str,
    payload: AlertStatusUpdate,
    user: dict = Depends(get_current_user_from_header)
):
    """Updates the operational lifecycle status of an early warning alert."""
    valid_statuses = {"OPEN", "ACKNOWLEDGED", "UNDER REVIEW", "RESOLVED", "DISMISSED"}
    target_status = payload.status.upper()
    if target_status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid alert status '{payload.status}'. Allowed: {list(valid_statuses)}")
    
    if user.get("role") not in ("ADMIN", "MONITORING_OFFICER"):
        raise HTTPException(
            status_code=403,
            detail=f"Only Monitoring Officers or Admins can update alert status. Active role: {user.get('role')}."
        )

    with db_client._get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM alerts WHERE alert_id = ?", (alert_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail=f"Alert '{alert_id}' not found.")
        
        cursor.execute("UPDATE alerts SET status = ? WHERE alert_id = ?", (target_status, alert_id))
        conn.commit()
    
    project_id = row["project_id"]
    audit = get_audit_manager()
    audit.record_event(
        actor=user.get("name", "Officer"),
        role=user.get("role", "MONITORING_OFFICER"),
        action="ALERT_STATUS_UPDATE",
        resource=f"{project_id} / {alert_id}",
        status="SUCCESS",
        details=f"Project {project_id}: Alert {alert_id} transition: {row['status']} -> {target_status}. Notes: {payload.notes or 'None'}"
    )
    return {
        "alert_id": alert_id,
        "previous_status": row["status"],
        "new_status": target_status,
        "updated_by": user.get("name"),
        "role": user.get("role"),
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }

# -------------------------------------------------------------
# Phase 9: Authentication & RBAC Endpoints
# -------------------------------------------------------------
@app.post("/api/auth/login", response_model=AuthUserResponse, tags=["Authentication"])
def login(req: LoginRequest):
    """Authenticates institutional officer credentials and issues session token."""
    user = authenticate_user(req)
    audit = get_audit_manager()
    audit.record_event(
        actor=user.name,
        role=user.role,
        action="USER_LOGIN",
        resource="MoSPI Portal",
        status="SUCCESS",
        details=f"Authenticated as {user.role} ({user.designation})"
    )
    return user

@app.post("/api/auth/logout", tags=["Authentication"])
def logout(user: dict = Depends(get_current_user_from_header)):
    """Terminates active officer session."""
    token = user.get("token")
    if token and token in ACTIVE_SESSIONS:
        del ACTIVE_SESSIONS[token]
    audit = get_audit_manager()
    audit.record_event(
        actor=user.get("name", "Officer"),
        role=user.get("role", "MONITORING_OFFICER"),
        action="USER_LOGOUT",
        resource="MoSPI Portal",
        status="SUCCESS"
    )
    return {"status": "success", "message": "Logged out successfully"}

@app.get("/api/auth/me", tags=["Authentication"])
def get_current_user(user: dict = Depends(get_current_user_from_header)):
    """Returns currently authenticated user profile and active permissions."""
    return user

@app.post("/api/auth/switch-role", response_model=AuthUserResponse, tags=["Authentication"])
def switch_demo_role(req: SwitchRoleRequest):
    """1-Click switch between official demonstration roles for evaluation."""
    role_key = req.role.lower().replace(" ", "_")
    matched_user = None
    for k, u in DEMO_USERS.items():
        if k == role_key or u["role"].lower() == role_key:
            matched_user = u
            break
    if not matched_user:
        matched_user = DEMO_USERS["officer"]
    
    from backend.auth import create_session_for_user
    session_user = create_session_for_user(matched_user)
    audit = get_audit_manager()
    audit.record_event(
        actor=session_user.name,
        role=session_user.role,
        action="ROLE_SWITCH",
        resource="Demo Switcher",
        status="SUCCESS",
        details=f"Switched session role to {session_user.role}"
    )
    return session_user

# -------------------------------------------------------------
# Phase 9: Governance & Audit Trail Endpoints
# -------------------------------------------------------------
@app.get("/api/audit", tags=["Governance & Audit"])
def list_audit_logs(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    action: Optional[str] = Query(None),
    actor: Optional[str] = Query(None),
    resource: Optional[str] = Query(None),
    user: dict = Depends(get_current_user_from_header)
):
    """Returns transparent audit trail of decision events and model evaluations."""
    audit = get_audit_manager()
    return audit.list_logs(page=page, page_size=page_size, action=action, actor=actor, resource=resource)

@app.get("/api/projects/{project_id}/history", tags=["Governance & Audit"])
def get_project_audit_history(project_id: str):
    """Returns chronological administrative audit history for a specific project."""
    audit = get_audit_manager()
    return audit.get_project_history(project_id)


@app.post("/api/simulate", tags=["What-If Simulator"])
def simulate_intervention(payload: SimulateRequest):
    """
    Executes prescriptive 'What-If' counterfactual intervention simulation.
    Quantifies risk reduction, schedule months saved, and public capital saved in ₹ Crores.
    """
    try:
        project_dict = None
        if payload.project_id:
            with db_client._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT * FROM projects WHERE project_id = ?", (payload.project_id,))
                row = cursor.fetchone()
                if row:
                    project_dict = dict(row)
                else:
                    raise HTTPException(status_code=404, detail=f"Project '{payload.project_id}' not found for simulation.")
        elif payload.features:
            project_dict = payload.features
        else:
            raise HTTPException(status_code=400, detail="Must provide either 'project_id' or 'features' dictionary.")

        result = simulator.simulate(
            project_data=project_dict,
            resolve_bottleneck=payload.resolve_bottleneck,
            infuse_contractor_support=payload.infuse_contractor_support,
            reschedule_milestones=payload.reschedule_milestones,
            progress_boost_pct=payload.progress_boost_pct,
            decoupling_reduction_pct=payload.decoupling_reduction_pct,
            milestone_recovery_pct=payload.milestone_recovery_pct
        )
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation error: {str(e)}")

# -------------------------------------------------------------
# Phase 4: Machine Learning Prediction & Registry Endpoints
# -------------------------------------------------------------
@app.get("/api/predictions/health", tags=["Predictions"])
def predictions_health_check():
    """
    Validates readiness and loading state of all Phase 4 predictive models.
    """
    try:
        engine = get_prediction_engine()
        return {
            "status": "healthy",
            "engine": "PredictionEngine",
            "models_loaded": {
                "schedule_classifier": engine.schedule_clf is not None,
                "schedule_regressor": engine.schedule_reg is not None,
                "cost_classifier": engine.cost_clf is not None,
                "cost_regressor": engine.cost_reg is not None,
                "risk_classifier": engine.risk_clf is not None
            },
            "feature_set": "features_v1",
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        }
    except Exception as e:
        return JSONResponse(
            status_code=503,
            content={"status": "unhealthy", "detail": str(e)}
        )

@app.get("/api/predictions/project/{project_id}", response_model=PredictionResult, tags=["Predictions"])
def get_project_prediction(project_id: str):
    """
    Returns unified predictive intelligence (Schedule, Cost, Multi-Class Implementation Risk)
    for a specific project by ID from the IPMD database.
    """
    try:
        engine = get_prediction_engine()
        return engine.predict_project(project_id, db_client=db_client)
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Project with ID '{project_id}' not found.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.post("/api/predictions/project", response_model=PredictionResult, tags=["Predictions"])
def predict_project_snapshot(snapshot: ProjectSnapshot):
    """
    Generates unified multi-target risk predictions for an arbitrary project snapshot or what-if candidate.
    """
    try:
        engine = get_prediction_engine()
        return engine.predict_snapshot(snapshot.model_dump())
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction calculation error: {str(e)}")

@app.get("/api/predictions/portfolio", tags=["Predictions"])
def get_portfolio_predictions(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Page size"),
    risk_level: str = Query("", description="Filter by overall risk band (LOW, MODERATE, HIGH, CRITICAL)")
):
    """
    Returns portfolio-level predictive aggregations and paginated project risk scores.
    """
    try:
        summary_file = PROJECT_ROOT / "reports" / "ml" / "predictions_summary.json"
        preds_file = PROJECT_ROOT / "data" / "processed" / "predictions.csv"
        
        if not summary_file.exists() or not preds_file.exists():
            engine = get_prediction_engine()
            projects_data = db_client.list_projects(page=1, page_size=10000).get("items", [])
            df_portfolio = pd.DataFrame(projects_data)
            df_preds, summary = engine.predict_portfolio(df_portfolio)
            summary_dict = summary.model_dump()
        else:
            with open(summary_file, "r", encoding="utf-8") as f:
                summary_dict = json.load(f)
            df_preds = pd.read_csv(preds_file)

        if risk_level:
            df_filtered = df_preds[df_preds["overall_risk_band"].str.upper() == risk_level.upper()]
        else:
            df_filtered = df_preds

        total_records = len(df_filtered)
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        page_items = df_filtered.iloc[start_idx:end_idx].to_dict(orient="records")

        return {
            "summary": summary_dict,
            "total": total_records,
            "page": page,
            "page_size": page_size,
            "total_pages": (total_records + page_size - 1) // page_size if total_records > 0 else 1,
            "predictions": page_items
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Portfolio prediction query failed: {str(e)}")

@app.get("/api/models", tags=["Model Registry"])
def list_registered_models():
    """
    Returns registry metadata for all production Phase 4 machine learning models.
    """
    try:
        from src.ml.model_registry import ModelRegistry
        registry = ModelRegistry()
        models_meta = {}
        for m_name in ["schedule", "cost", "implementation"]:
            meta = registry.get_metadata(m_name)
            features = registry.get_feature_names(m_name)
            models_meta[m_name] = {
                "metadata": meta,
                "features": features,
                "status": "active"
            }
        
        eval_report_file = PROJECT_ROOT / "reports" / "ml" / "model_evaluation.json"
        eval_data = {}
        if eval_report_file.exists():
            with open(eval_report_file, "r", encoding="utf-8") as f:
                eval_data = json.load(f)

        return {
            "status": "success",
            "active_models": models_meta,
            "evaluation_metrics": eval_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list models: {str(e)}")

# -------------------------------------------------------------
# Static Files & Single-Page Dashboard Serving
# -------------------------------------------------------------
# Mount static directories if they exist
css_dir = PROJECT_ROOT / "css"
if css_dir.exists():
    app.mount("/css", StaticFiles(directory=str(css_dir)), name="css")

js_dir = PROJECT_ROOT / "js"
if js_dir.exists():
    app.mount("/js", StaticFiles(directory=str(js_dir)), name="js")

data_dir = PROJECT_ROOT / "data"
if data_dir.exists():
    app.mount("/data", StaticFiles(directory=str(data_dir)), name="data")

@app.get("/", tags=["Frontend"])
def serve_dashboard():
    """Serves the institutional ProjectPulse Single-Page Dashboard."""
    index_file = PROJECT_ROOT / "index.html"
    if index_file.exists():
        return FileResponse(str(index_file))
    return JSONResponse({"message": "ProjectPulse API is active. index.html not found."})

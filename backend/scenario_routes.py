"""
ProjectPulse — Phase 7: RESTful Scenario & What-If API Routes
Ministry of Statistics & Programme Implementation (MoSPI) / IPMD
Team HexaForce — Smart India Hackathon 2026 (SIH26103)
"""

from typing import Dict, List, Any, Optional
from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel, Field

from src.scenarios.scenario_models import (
    SimulationRequest,
    SensitivityRequest,
    SensitivityResult,
    ScenarioResult,
    ScenarioComparisonResult
)
from src.scenarios.scenario_engine import ScenarioEngine
from src.scenarios.intervention_catalog import InterventionCatalog
from backend.audit import get_audit_manager

router = APIRouter(prefix="/api/scenarios", tags=["What-If Scenarios"])

_engine: Optional[ScenarioEngine] = None
_catalog: Optional[InterventionCatalog] = None

def get_scenario_engine() -> ScenarioEngine:
    global _engine
    if _engine is None:
        _engine = ScenarioEngine()
    return _engine

def get_catalog() -> InterventionCatalog:
    global _catalog
    if _catalog is None:
        _catalog = InterventionCatalog()
    return _catalog

class CompareRequest(BaseModel):
    project_id: str
    scenario_ids: Optional[List[str]] = Field(default=[], description="List of saved scenario IDs to compare")
    scenarios: Optional[List[Dict[str, Any]]] = Field(default=[], description="Optional list of in-memory scenario dicts")

@router.get("/catalog", tags=["What-If Scenarios"])
def get_intervention_catalog():
    """
    Returns configured intervention categories, presets, allowable bounds, and disclaimers.
    """
    catalog = get_catalog()
    return {
        "status": "success",
        "categories": catalog.get_categories(),
        "presets": catalog.get_presets(),
        "limits": catalog.get_limits(),
        "thresholds": catalog.get_thresholds(),
        "observed_bounds": catalog.get_observed_bounds(),
        "supported_features": catalog.get_supported_features(),
        "disclaimers": catalog.get_disclaimers()
    }

@router.post("/simulate", response_model=ScenarioResult, tags=["What-If Scenarios"])
def simulate_scenario(payload: SimulationRequest):
    """
    Executes a counterfactual intervention simulation.
    Reuses Phase 4 predictive models on an immutable clone of the project snapshot.
    """
    engine = get_scenario_engine()
    try:
        res = engine.simulate_scenario(payload)
        try:
            audit = get_audit_manager()
            audit.record_event(
                actor=payload.created_by or "Officer",
                role="MONITORING_OFFICER",
                action="SCENARIO_SIMULATION",
                resource=f"{payload.project_id} / {res.scenario_id}",
                status="SUCCESS",
                details=f"Project {payload.project_id}: Scenario '{payload.scenario_name}' simulated. Risk delta: {res.delta.risk_score_display} ({res.delta.classification})"
            )
        except Exception:
            pass
        return res
    except KeyError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Simulation failure: {str(e)}")

@router.post("/sensitivity", response_model=SensitivityResult, tags=["What-If Scenarios"])
def run_sensitivity_sweep(payload: SensitivityRequest):
    """
    Evaluates model sensitivity across a multi-point parameter sweep (no retraining).
    """
    engine = get_scenario_engine()
    try:
        return engine.run_sensitivity_analysis(payload)
    except KeyError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Sensitivity sweep error: {str(e)}")

@router.get("/{scenario_id}", tags=["What-If Scenarios"])
def get_scenario_by_id(scenario_id: str):
    """
    Retrieves single saved scenario record by ID.
    """
    engine = get_scenario_engine()
    scenario = engine.get_scenario(scenario_id)
    if not scenario:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Scenario '{scenario_id}' not found.")
    return scenario

@router.post("/{scenario_id}/save", tags=["What-If Scenarios"])
def save_scenario_endpoint(scenario_id: str, scenario_data: ScenarioResult):
    """
    Persists a simulated scenario to the database with SAVED status.
    """
    engine = get_scenario_engine()
    try:
        scenario_data.scenario_id = scenario_id
        scenario_data.status = "SAVED"
        ok = engine.save_scenario(scenario_data)
        try:
            audit = get_audit_manager()
            audit.record_event(
                actor=scenario_data.created_by or "Officer",
                role="MONITORING_OFFICER",
                action="SCENARIO_SAVED",
                resource=f"{scenario_data.project_id} / {scenario_id}",
                status="SUCCESS",
                details=f"Project {scenario_data.project_id}: Scenario '{scenario_data.scenario_name}' saved to records"
            )
        except Exception:
            pass
        return {"status": "success", "saved": ok, "scenario_id": scenario_id}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to save scenario: {str(e)}")

@router.delete("/{scenario_id}", tags=["What-If Scenarios"])
def delete_scenario_endpoint(scenario_id: str):
    """
    Deletes a saved scenario record. Does not alter underlying project data.
    """
    engine = get_scenario_engine()
    deleted = engine.delete_scenario(scenario_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Scenario '{scenario_id}' not found.")
    return {"status": "success", "deleted": True, "scenario_id": scenario_id}

@router.post("/compare", response_model=ScenarioComparisonResult, tags=["What-If Scenarios"])
def compare_scenarios_endpoint(payload: CompareRequest):
    """
    Compares up to 5 scenarios side by side and ranks by model-estimated risk reduction.
    """
    engine = get_scenario_engine()
    try:
        # Get baseline risk score
        baseline_raw = engine.get_baseline_snapshot(payload.project_id)
        base_pred = engine.prediction_engine.predict_snapshot(baseline_raw)
        base_score = base_pred.overall_risk_score

        scenarios_to_compare = []

        # From saved scenario IDs
        if payload.scenario_ids:
            for scn_id in payload.scenario_ids[:5]:
                fetched = engine.get_scenario(scn_id)
                if fetched:
                    scenarios_to_compare.append(fetched)

        # From direct in-memory scenario dicts
        if payload.scenarios:
            for scn in payload.scenarios:
                if len(scenarios_to_compare) < 5:
                    scenarios_to_compare.append(scn)

        if not scenarios_to_compare:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No valid scenarios provided for comparison.")

        return engine.comparison.compare_scenarios(
            project_id=payload.project_id,
            baseline_score=base_score,
            scenarios=scenarios_to_compare
        )
    except KeyError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Comparison failed: {str(e)}")

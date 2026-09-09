"""
ProjectPulse — Phase 7: Pydantic Data Models & Schemas
Ministry of Statistics & Programme Implementation (MoSPI) / IPMD
Team HexaForce — Smart India Hackathon 2026 (SIH26103)
"""

from typing import Dict, List, Optional, Any, Union
from pydantic import BaseModel, Field, model_validator

class ScenarioModification(BaseModel):
    feature: str = Field(..., description="Legitimate prediction-time feature to modify")
    baseline_value: Optional[Any] = Field(None, description="Authoritative current baseline value in project record")
    scenario_value: Optional[Any] = Field(None, description="Hypothetical value to evaluate in scenario")
    unit: Optional[str] = Field("", description="Unit of measurement (e.g. %, days, milestones)")
    description: Optional[str] = Field("", description="Human-readable description of intervention")

    @model_validator(mode="before")
    @classmethod
    def populate_scenario_value(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "scenario_value" not in data and "value" in data:
                data["scenario_value"] = data["value"]
        return data

class SimulationRequest(BaseModel):
    project_id: str = Field(..., description="Target project ID (e.g. PRJ-SYN-002078)")
    scenario_name: str = Field("Hypothetical Scenario", description="Short title for scenario")
    scenario_description: Optional[str] = Field("", description="Contextual assumption rationale")
    modifications: List[ScenarioModification] = Field(..., min_length=1, description="List of feature modifications")
    created_by: Optional[str] = Field("IPMD Monitoring Officer", description="Author or officer identity")

class PredictionSummary(BaseModel):
    overall_risk_score: float = Field(..., ge=0.0, le=100.0)
    overall_risk_band: str = Field(..., description="LOW, MODERATE, HIGH, CRITICAL")
    schedule_probability: float = Field(..., ge=0.0, le=1.0)
    predicted_delay_months: float = Field(..., ge=0.0)
    cost_probability: float = Field(..., ge=0.0, le=1.0)
    predicted_cost_overrun_pct: float = Field(..., ge=0.0)
    predicted_cost_overrun_cr: float = Field(..., ge=0.0)
    implementation_probability: float = Field(..., ge=0.0, le=1.0)
    implementation_risk_band: str = Field(..., description="LOW, MODERATE, HIGH, CRITICAL")

class DeltaSummary(BaseModel):
    overall_risk_score: float = Field(..., description="Baseline risk minus scenario risk (positive = potential improvement)")
    risk_score_display: str = Field(..., description="Human readable delta string (e.g. -14.0 points)")
    schedule_probability_pp: float = Field(..., description="Schedule delay probability change in percentage points (pp)")
    cost_probability_pp: float = Field(..., description="Cost overrun probability change in percentage points (pp)")
    implementation_probability_pp: float = Field(..., description="Implementation distress probability change in percentage points (pp)")
    delay_months_delta: float = Field(..., description="Baseline delay months minus scenario delay months")
    cost_overrun_cr_delta: float = Field(..., description="Baseline cost overrun Cr minus scenario cost overrun Cr")
    classification: str = Field(..., description="IMPROVED, STABLE, or DETERIORATED")
    risk_band_transition: str = Field(..., description="Transition representation, e.g. CRITICAL -> HIGH")
    warning_preview: str = Field(..., description="Preview of Phase 6 radar state under scenario assumptions")

class ScenarioResult(BaseModel):
    scenario_id: str
    project_id: str
    scenario_name: str
    scenario_description: Optional[str] = ""
    status: str = Field("SIMULATED", description="DRAFT, SIMULATED, SAVED, DISCARDED")
    created_by: str
    created_at: str
    updated_at: str
    baseline: PredictionSummary
    scenario: PredictionSummary
    delta: DeltaSummary
    modifications: List[ScenarioModification]
    assumptions: List[str]
    warnings: List[str]
    prediction_quality: str = "HIGH"
    data_quality_score: float = 100.0
    model_versions: Dict[str, str]
    feature_set_version: str = "features_v1"
    disclaimer: str

class SensitivityPoint(BaseModel):
    point_index: int
    feature: str
    scenario_value: Any
    label: str
    overall_risk_score: float
    schedule_probability: float
    cost_probability: float
    implementation_probability: float
    risk_band: str
    risk_reduction_points: float

class SensitivityRequest(BaseModel):
    project_id: str
    feature: str
    points_count: int = Field(5, ge=2, le=10)
    min_value: Optional[float] = None
    max_value: Optional[float] = None
    scenario_name: Optional[str] = "Sensitivity Sweep"

class SensitivityResult(BaseModel):
    project_id: str
    feature: str
    baseline_value: Any
    points: List[SensitivityPoint]
    disclaimer: str
    created_at: str

class ScenarioComparisonItem(BaseModel):
    scenario_id: str
    scenario_name: str
    overall_risk_score: float
    risk_delta: float
    schedule_probability: float
    cost_probability: float
    implementation_probability: float
    classification: str
    rank: int

class ScenarioComparisonResult(BaseModel):
    project_id: str
    baseline_risk_score: float
    compared_count: int
    scenarios: List[ScenarioComparisonItem]
    lowest_modeled_risk_scenario: Optional[str]
    disclaimer: str

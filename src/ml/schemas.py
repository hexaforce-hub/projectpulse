"""
ProjectPulse — Data Schemas & Contracts for ML Models (Phase 4)
"""

from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field

class ProjectSnapshot(BaseModel):
    project_id: Optional[str] = "UNKNOWN"
    project_name: Optional[str] = "Unnamed Project"
    ministry: str = "Ministry of Road Transport and Highways"
    sector: str = "Roads & Highways"
    state: str = "National"
    region: str = "Central"
    implementing_agency: str = "NHAI"
    project_type: str = "Greenfield"
    primary_bottleneck: str = "NONE"
    original_cost_cr: float = Field(..., ge=0.0)
    planned_duration_months: int = Field(..., ge=1)
    project_age_months: int = Field(0, ge=0)
    cumulative_expenditure_cr: float = Field(0.0, ge=0.0)
    physical_progress_pct: float = Field(0.0, ge=0.0, le=100.0)
    milestone_count: int = Field(10, ge=1)
    milestones_completed: int = Field(0, ge=0)
    milestones_delayed: int = Field(0, ge=0)
    milestones_at_risk: int = Field(0, ge=0)

class SchedulePrediction(BaseModel):
    probability: float = Field(..., ge=0.0, le=1.0)
    risk_band: str
    predicted_delay_months: float = Field(..., ge=0.0)
    prediction_horizon: str = "future_project_outcome"
    model_version: str

class CostPrediction(BaseModel):
    probability: float = Field(..., ge=0.0, le=1.0)
    risk_band: str
    predicted_overrun_pct: float = Field(..., ge=0.0)
    predicted_overrun_cr: float = Field(..., ge=0.0)
    model_version: str

class ImplementationRiskPrediction(BaseModel):
    probability: float = Field(..., ge=0.0, le=1.0)
    risk_band: str
    class_probabilities: Dict[str, float]
    model_version: str

class PredictionResult(BaseModel):
    project_id: str
    prediction_timestamp: str
    overall_risk_score: float = Field(..., ge=0.0, le=100.0)
    overall_risk_band: str
    schedule: SchedulePrediction
    cost: CostPrediction
    implementation: ImplementationRiskPrediction
    prediction_quality: str
    data_quality_score: float = Field(..., ge=0.0, le=100.0)
    data_quality_warning: bool = False
    model_versions: Dict[str, str]
    feature_set_version: str = "features_v1"
    status: str = "success"

class PortfolioSummary(BaseModel):
    total_projects: int
    risk_distribution: Dict[str, int]
    average_risk_score: float
    capital_at_risk_cr: float
    high_priority_projects_count: int
    data_quality_average: float
    model_versions: Dict[str, str]

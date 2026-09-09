"""
ProjectPulse — Phase 7: Master Scenario Engine Service
Ministry of Statistics & Programme Implementation (MoSPI) / IPMD
Team HexaForce — Smart India Hackathon 2026 (SIH26103)
"""

import json
import sqlite3
import time
import uuid
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple

import pandas as pd
import numpy as np

from database.db_client import DatabaseClient
from src.ml.prediction import PredictionEngine
from src.scenarios.intervention_catalog import InterventionCatalog
from src.scenarios.scenario_validator import ScenarioValidator
from src.scenarios.scenario_comparison import ScenarioComparison
from src.scenarios.scenario_models import (
    ScenarioModification,
    SimulationRequest,
    SensitivityRequest,
    SensitivityPoint,
    SensitivityResult,
    PredictionSummary,
    ScenarioResult,
    ScenarioComparisonResult
)

class ScenarioEngine:
    """
    Executes safe, human-controlled What-If counterfactual scenario simulations.
    Guarantees strict project database immutability and reuses existing Phase 4 models.
    """
    def __init__(
        self,
        db_client: Optional[DatabaseClient] = None,
        prediction_engine: Optional[PredictionEngine] = None,
        catalog: Optional[InterventionCatalog] = None
    ):
        self.db_client = db_client or DatabaseClient()
        self.prediction_engine = prediction_engine or PredictionEngine()
        self.catalog = catalog or InterventionCatalog()
        self.validator = ScenarioValidator(self.catalog)
        self.comparison = ScenarioComparison()
        self._ensure_scenario_tables()

    def _ensure_scenario_tables(self):
        """Initializes database tables for Phase 7 scenario persistence."""
        with self.db_client._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS scenarios (
                    scenario_id TEXT PRIMARY KEY,
                    project_id TEXT NOT NULL,
                    scenario_name TEXT NOT NULL,
                    scenario_description TEXT,
                    status TEXT NOT NULL DEFAULT 'SIMULATED',
                    created_by TEXT NOT NULL DEFAULT 'IPMD Officer',
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    model_version TEXT NOT NULL,
                    feature_set_version TEXT NOT NULL,
                    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE
                );
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS scenario_modifications (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    scenario_id TEXT NOT NULL,
                    feature_name TEXT NOT NULL,
                    baseline_value REAL,
                    scenario_value REAL,
                    baseline_str TEXT,
                    scenario_str TEXT,
                    created_at TEXT NOT NULL,
                    FOREIGN KEY (scenario_id) REFERENCES scenarios(scenario_id) ON DELETE CASCADE
                );
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS scenario_results (
                    scenario_id TEXT PRIMARY KEY,
                    baseline_prediction TEXT NOT NULL,
                    scenario_prediction TEXT NOT NULL,
                    risk_delta REAL NOT NULL,
                    schedule_delta REAL NOT NULL,
                    cost_delta REAL NOT NULL,
                    implementation_delta REAL NOT NULL,
                    prediction_quality TEXT NOT NULL,
                    assumptions TEXT NOT NULL,
                    result_summary TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    FOREIGN KEY (scenario_id) REFERENCES scenarios(scenario_id) ON DELETE CASCADE
                );
            """)
            conn.commit()

    def get_baseline_snapshot(self, project_id: str) -> Dict[str, Any]:
        """
        Loads the authoritative current project record from the database.
        """
        with self.db_client._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM projects WHERE project_id = ?", (project_id,))
            row = cursor.fetchone()
            if not row:
                raise KeyError(f"Project '{project_id}' not found in database.")
            return dict(row)

    def _format_prediction_summary(self, res) -> PredictionSummary:
        """Converts Phase 4 PredictionResult into Scenario PredictionSummary."""
        # res is PredictionResult from src.ml.schemas
        return PredictionSummary(
            overall_risk_score=res.overall_risk_score,
            overall_risk_band=res.overall_risk_band,
            schedule_probability=res.schedule.probability,
            predicted_delay_months=res.schedule.predicted_delay_months,
            cost_probability=res.cost.probability,
            predicted_cost_overrun_pct=res.cost.predicted_overrun_pct,
            predicted_cost_overrun_cr=res.cost.predicted_overrun_cr,
            implementation_probability=res.implementation.probability,
            implementation_risk_band=res.implementation.risk_band
        )

    def simulate_scenario(self, request: SimulationRequest) -> ScenarioResult:
        """
        Executes counterfactual simulation on an immutable copy of the project.
        """
        # 1. Authoritative baseline fetch
        raw_baseline = self.get_baseline_snapshot(request.project_id)

        # 2. Enrich modifications with baseline values if not supplied
        for mod in request.modifications:
            if mod.baseline_value is None and mod.feature in raw_baseline:
                mod.baseline_value = raw_baseline[mod.feature]

        # 3. Validation
        is_valid, errors, warnings = self.validator.validate_scenario(raw_baseline, request.modifications)
        if not is_valid:
            raise ValueError("Validation failed: " + "; ".join(errors))

        # 4. Run Baseline Prediction via Phase 4 engine
        base_res = self.prediction_engine.predict_snapshot(raw_baseline)
        baseline_summary = self._format_prediction_summary(base_res)

        # 5. Clone snapshot strictly in memory (Zero project mutation guarantee)
        scenario_snapshot = dict(raw_baseline)

        # 6. Apply validated modifications and maintain logical dependencies
        assumptions = []
        for mod in request.modifications:
            feat = mod.feature
            val = mod.scenario_value
            old_val = scenario_snapshot.get(feat)

            if feat == "milestones_delayed":
                new_delayed = max(0, int(val))
                old_delayed = int(old_val or 0)
                scenario_snapshot["milestones_delayed"] = new_delayed
                # Dependent milestone float recovery
                if old_delayed > new_delayed:
                    recovered = old_delayed - new_delayed
                    tot_m = int(scenario_snapshot.get("milestone_count", 10) or 10)
                    cur_comp = int(scenario_snapshot.get("milestones_completed", 0) or 0)
                    scenario_snapshot["milestones_completed"] = min(tot_m, cur_comp + recovered)
                    assumptions.append(f"Delayed milestones reduced by {recovered} (recovering completed milestone count).")

            elif feat == "physical_progress_pct":
                new_prog = min(100.0, max(0.0, float(val)))
                scenario_snapshot["physical_progress_pct"] = new_prog
                assumptions.append(f"Physical progress set to {new_prog:.1f}%.")

            elif feat == "primary_bottleneck":
                scenario_snapshot["primary_bottleneck"] = str(val)
                if str(val) == "NONE":
                    assumptions.append(f"Statutory bottleneck cleared (was {old_val}).")
                else:
                    assumptions.append(f"Bottleneck transitioned from {old_val} to {val}.")

            elif feat == "cumulative_expenditure_cr":
                new_exp = max(0.0, float(val))
                scenario_snapshot["cumulative_expenditure_cr"] = new_exp
                assumptions.append(f"Cumulative expenditure adjusted from ₹{float(old_val or 0):,.1f} Cr to ₹{new_exp:,.1f} Cr.")

            else:
                scenario_snapshot[feat] = val
                assumptions.append(f"Feature '{feat}' adjusted from {old_val} to {val}.")

        assumptions.append("Other project baseline conditions held constant.")
        assumptions.append("Same production model version used for both baseline and scenario.")

        # 7. Run Scenario Prediction via same Phase 4 engine
        scenario_res = self.prediction_engine.predict_snapshot(scenario_snapshot)
        scenario_summary = self._format_prediction_summary(scenario_res)

        # 8. Calculate Deltas
        delta = self.comparison.calculate_delta(baseline_summary, scenario_summary)

        # 9. Create unique scenario ID and package result
        now_ts = datetime.utcnow().isoformat() + "Z"
        scn_id = f"SCN-{datetime.utcnow().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"

        disclaimers = self.catalog.get_disclaimers()
        disclaimer_text = f"{disclaimers.get('mandatory_causal')} {disclaimers.get('human_decision')}"

        return ScenarioResult(
            scenario_id=scn_id,
            project_id=request.project_id,
            scenario_name=request.scenario_name,
            scenario_description=request.scenario_description,
            status="SIMULATED",
            created_by=request.created_by or "IPMD Monitoring Officer",
            created_at=now_ts,
            updated_at=now_ts,
            baseline=baseline_summary,
            scenario=scenario_summary,
            delta=delta,
            modifications=request.modifications,
            assumptions=assumptions,
            warnings=warnings,
            prediction_quality=scenario_res.prediction_quality,
            data_quality_score=scenario_res.data_quality_score,
            model_versions=scenario_res.model_versions,
            feature_set_version=scenario_res.feature_set_version,
            disclaimer=disclaimer_text
        )

    def run_sensitivity_analysis(self, request: SensitivityRequest) -> SensitivityResult:
        """
        Runs repeated inference across 5-10 discrete points for a selected feature.
        Zero model retraining.
        """
        raw_baseline = self.get_baseline_snapshot(request.project_id)
        feat = request.feature
        base_val = raw_baseline.get(feat)

        points_count = min(10, max(2, request.points_count))
        test_values = []

        # Determine sensible test points based on feature
        if feat == "milestones_delayed":
            cur_del = int(base_val or 0)
            if cur_del == 0:
                test_values = [0, 1, 2, 3, 4]
            else:
                test_values = sorted([int(x) for x in set(np.linspace(cur_del, 0, points_count, dtype=int))])
        elif feat == "physical_progress_pct":
            cur_p = float(base_val or 0.0)
            target_p = min(100.0, cur_p + 20.0)
            test_values = [round(float(v), 1) for v in np.linspace(cur_p, target_p, points_count)]
        elif feat == "cumulative_expenditure_cr":
            cur_exp = float(base_val or 0.0)
            test_values = [round(float(v), 1) for v in np.linspace(cur_exp, cur_exp * 0.7, points_count)]
        elif feat == "primary_bottleneck":
            # Categorical variation
            categories = ["NONE", "LAND_ACQUISITION", "FOREST_CLEARANCE", "FUNDS_FLOW", "CONTRACTOR_FAILURE"]
            test_values = categories[:points_count]
        else:
            if isinstance(base_val, (int, float)):
                cur_num = float(base_val)
                test_values = [round(float(v), 1) for v in np.linspace(cur_num, cur_num * 0.8, points_count)]
            else:
                test_values = [base_val]

        # Calculate baseline score
        base_res = self.prediction_engine.predict_snapshot(raw_baseline)
        base_score = base_res.overall_risk_score

        points: List[SensitivityPoint] = []
        for idx, val in enumerate(test_values, start=1):
            clean_val = int(val) if isinstance(val, (np.integer, int)) else float(val) if isinstance(val, (np.floating, float)) else str(val)
            cloned = dict(raw_baseline)
            cloned[feat] = clean_val

            # Dependent adjustments
            if feat == "milestones_delayed" and int(base_val or 0) > int(clean_val):
                diff = int(base_val or 0) - int(clean_val)
                tot_m = int(cloned.get("milestone_count", 10) or 10)
                cur_c = int(cloned.get("milestones_completed", 0) or 0)
                cloned["milestones_completed"] = min(tot_m, cur_c + diff)

            pred = self.prediction_engine.predict_snapshot(cloned)
            reduction = round(base_score - pred.overall_risk_score, 1)

            label_str = f"{feat}: {clean_val}"

            points.append(SensitivityPoint(
                point_index=idx,
                feature=feat,
                scenario_value=clean_val,
                label=label_str,
                overall_risk_score=pred.overall_risk_score,
                schedule_probability=pred.schedule.probability,
                cost_probability=pred.cost.probability,
                implementation_probability=pred.implementation.probability,
                risk_band=pred.overall_risk_band,
                risk_reduction_points=reduction
            ))

        now_ts = datetime.utcnow().isoformat() + "Z"
        disclaimers = self.catalog.get_disclaimers()

        return SensitivityResult(
            project_id=request.project_id,
            feature=feat,
            baseline_value=base_val,
            points=points,
            disclaimer=disclaimers.get("mandatory_causal", ""),
            created_at=now_ts
        )

    def save_scenario(self, scenario: ScenarioResult) -> bool:
        """
        Persists scenario to database tables with status SAVED.
        """
        with self.db_client._get_connection() as conn:
            cursor = conn.cursor()
            now_ts = datetime.utcnow().isoformat() + "Z"

            cursor.execute("""
                INSERT OR REPLACE INTO scenarios 
                (scenario_id, project_id, scenario_name, scenario_description, status, created_by, created_at, updated_at, model_version, feature_set_version)
                VALUES (?, ?, ?, ?, 'SAVED', ?, ?, ?, ?, ?)
            """, (
                scenario.scenario_id,
                scenario.project_id,
                scenario.scenario_name,
                scenario.scenario_description,
                scenario.created_by,
                scenario.created_at,
                now_ts,
                json.dumps(scenario.model_versions),
                scenario.feature_set_version
            ))

            # Delete any existing modifications for this scenario
            cursor.execute("DELETE FROM scenario_modifications WHERE scenario_id = ?", (scenario.scenario_id,))

            for mod in scenario.modifications:
                b_num = float(mod.baseline_value) if isinstance(mod.baseline_value, (int, float)) else None
                s_num = float(mod.scenario_value) if isinstance(mod.scenario_value, (int, float)) else None
                b_str = str(mod.baseline_value) if not isinstance(mod.baseline_value, (int, float)) else None
                s_str = str(mod.scenario_value) if not isinstance(mod.scenario_value, (int, float)) else None

                cursor.execute("""
                    INSERT INTO scenario_modifications 
                    (scenario_id, feature_name, baseline_value, scenario_value, baseline_str, scenario_str, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (
                    scenario.scenario_id,
                    mod.feature,
                    b_num,
                    s_num,
                    b_str,
                    s_str,
                    now_ts
                ))

            cursor.execute("""
                INSERT OR REPLACE INTO scenario_results
                (scenario_id, baseline_prediction, scenario_prediction, risk_delta, schedule_delta, cost_delta, implementation_delta, prediction_quality, assumptions, result_summary, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                scenario.scenario_id,
                scenario.baseline.model_dump_json(),
                scenario.scenario.model_dump_json(),
                scenario.delta.overall_risk_score,
                scenario.delta.schedule_probability_pp,
                scenario.delta.cost_probability_pp,
                scenario.delta.implementation_probability_pp,
                scenario.prediction_quality,
                json.dumps(scenario.assumptions),
                scenario.delta.model_dump_json(),
                now_ts
            ))

            conn.commit()
            return True

    def list_project_scenarios(self, project_id: str) -> List[Dict[str, Any]]:
        """Lists saved scenarios for a specific project."""
        with self.db_client._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT s.*, r.risk_delta, r.schedule_delta, r.cost_delta, r.implementation_delta, r.result_summary
                FROM scenarios s
                LEFT JOIN scenario_results r ON s.scenario_id = r.scenario_id
                WHERE s.project_id = ?
                ORDER BY s.created_at DESC
            """, (project_id,))
            rows = cursor.fetchall()
            results = []
            for r in rows:
                results.append({
                    "scenario_id": r["scenario_id"],
                    "project_id": r["project_id"],
                    "scenario_name": r["scenario_name"],
                    "scenario_description": r["scenario_description"],
                    "status": r["status"],
                    "created_at": r["created_at"],
                    "risk_delta": r["risk_delta"],
                    "schedule_delta": r["schedule_delta"],
                    "cost_delta": r["cost_delta"],
                    "implementation_delta": r["implementation_delta"]
                })
            return results

    def get_scenario(self, scenario_id: str) -> Optional[Dict[str, Any]]:
        """Retrieves single scenario with modifications and results."""
        with self.db_client._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM scenarios WHERE scenario_id = ?", (scenario_id,))
            s_row = cursor.fetchone()
            if not s_row:
                return None

            cursor.execute("SELECT * FROM scenario_modifications WHERE scenario_id = ?", (scenario_id,))
            mod_rows = cursor.fetchall()

            cursor.execute("SELECT * FROM scenario_results WHERE scenario_id = ?", (scenario_id,))
            res_row = cursor.fetchone()

            modifications = []
            for m in mod_rows:
                b_val = m["baseline_value"] if m["baseline_value"] is not None else m["baseline_str"]
                s_val = m["scenario_value"] if m["scenario_value"] is not None else m["scenario_str"]
                modifications.append({
                    "feature": m["feature_name"],
                    "baseline_value": b_val,
                    "scenario_value": s_val
                })

            result_dict = {}
            if res_row:
                result_dict = {
                    "baseline": json.loads(res_row["baseline_prediction"]),
                    "scenario": json.loads(res_row["scenario_prediction"]),
                    "delta": json.loads(res_row["result_summary"]),
                    "assumptions": json.loads(res_row["assumptions"]),
                    "prediction_quality": res_row["prediction_quality"]
                }

            return {
                "scenario_id": s_row["scenario_id"],
                "project_id": s_row["project_id"],
                "scenario_name": s_row["scenario_name"],
                "scenario_description": s_row["scenario_description"],
                "status": s_row["status"],
                "created_at": s_row["created_at"],
                "updated_at": s_row["updated_at"],
                "modifications": modifications,
                **result_dict
            }

    def delete_scenario(self, scenario_id: str) -> bool:
        """Deletes a saved scenario record."""
        with self.db_client._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM scenarios WHERE scenario_id = ?", (scenario_id,))
            conn.commit()
            return cursor.rowcount > 0

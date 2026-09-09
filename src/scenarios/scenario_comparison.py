"""
ProjectPulse — Phase 7: Scenario Comparison Service
Ministry of Statistics & Programme Implementation (MoSPI) / IPMD
Team HexaForce — Smart India Hackathon 2026 (SIH26103)
"""

from typing import Dict, List, Any, Optional
from src.scenarios.scenario_models import (
    PredictionSummary,
    DeltaSummary,
    ScenarioComparisonItem,
    ScenarioComparisonResult
)

class ScenarioComparison:
    """
    Computes mathematical deltas, percentage point annotations,
    outcome classifications, and multi-scenario rankings.
    """
    def __init__(self, improved_threshold: float = 5.0, deteriorated_threshold: float = -5.0):
        self.improved_threshold = improved_threshold
        self.deteriorated_threshold = deteriorated_threshold

    def calculate_delta(
        self,
        baseline: PredictionSummary,
        scenario: PredictionSummary
    ) -> DeltaSummary:
        """
        Calculates differences between baseline and scenario predictions.
        Positive delta indicates potential improvement (lower risk).
        """
        risk_score_delta = round(baseline.overall_risk_score - scenario.overall_risk_score, 1)

        if risk_score_delta > 0:
            display_str = f"-{risk_score_delta} points"
        elif risk_score_delta < 0:
            display_str = f"+{abs(risk_score_delta)} points"
        else:
            display_str = "0.0 points (No change)"

        # Percentage points (pp) differences
        sched_pp = round((baseline.schedule_probability - scenario.schedule_probability) * 100.0, 1)
        cost_pp = round((baseline.cost_probability - scenario.cost_probability) * 100.0, 1)
        impl_pp = round((baseline.implementation_probability - scenario.implementation_probability) * 100.0, 1)

        delay_delta = round(baseline.predicted_delay_months - scenario.predicted_delay_months, 1)
        cost_cr_delta = round(baseline.predicted_cost_overrun_cr - scenario.predicted_cost_overrun_cr, 2)

        # Classification
        if risk_score_delta > self.improved_threshold:
            classification = "IMPROVED"
        elif risk_score_delta < self.deteriorated_threshold:
            classification = "DETERIORATED"
        else:
            classification = "STABLE"

        transition = f"{baseline.overall_risk_band} -> {scenario.overall_risk_band}"

        # Safe warning preview
        if baseline.overall_risk_band != scenario.overall_risk_band:
            warning_preview = (
                f"Predicted risk band shifts from {baseline.overall_risk_band} to {scenario.overall_risk_band} "
                "under scenario assumptions. Note: Existing Phase 6 radar warnings remain active until reviewed by monitoring officer."
            )
        else:
            warning_preview = (
                f"Predicted risk band remains {baseline.overall_risk_band} under scenario assumptions. "
                "Active warnings remain unaffected."
            )

        return DeltaSummary(
            overall_risk_score=risk_score_delta,
            risk_score_display=display_str,
            schedule_probability_pp=sched_pp,
            cost_probability_pp=cost_pp,
            implementation_probability_pp=impl_pp,
            delay_months_delta=delay_delta,
            cost_overrun_cr_delta=cost_cr_delta,
            classification=classification,
            risk_band_transition=transition,
            warning_preview=warning_preview
        )

    def compare_scenarios(
        self,
        project_id: str,
        baseline_score: float,
        scenarios: List[Dict[str, Any]]
    ) -> ScenarioComparisonResult:
        """
        Compares up to 5 scenarios side by side and sorts by model-estimated risk reduction.
        """
        items: List[ScenarioComparisonItem] = []

        for scn in scenarios[:5]:
            scenario_id = scn.get("scenario_id", "UNKNOWN")
            name = scn.get("scenario_name", "Scenario")
            score = float(scn.get("scenario", {}).get("overall_risk_score", baseline_score))
            delta = round(baseline_score - score, 1)
            sched_p = float(scn.get("scenario", {}).get("schedule_probability", 0.0))
            cost_p = float(scn.get("scenario", {}).get("cost_probability", 0.0))
            impl_p = float(scn.get("scenario", {}).get("implementation_probability", 0.0))
            cls_name = scn.get("delta", {}).get("classification", "STABLE")

            items.append(ScenarioComparisonItem(
                scenario_id=scenario_id,
                scenario_name=name,
                overall_risk_score=score,
                risk_delta=delta,
                schedule_probability=sched_p,
                cost_probability=cost_p,
                implementation_probability=impl_p,
                classification=cls_name,
                rank=1
            ))

        # Sort by lowest risk score (highest risk delta)
        items.sort(key=lambda x: x.overall_risk_score)
        for idx, it in enumerate(items, start=1):
            it.rank = idx

        lowest_name = items[0].scenario_name if items else None

        return ScenarioComparisonResult(
            project_id=project_id,
            baseline_risk_score=baseline_score,
            compared_count=len(items),
            scenarios=items,
            lowest_modeled_risk_scenario=lowest_name,
            disclaimer=(
                "Rankings represent lowest model-estimated risk under scenario assumptions. "
                "This does not imply a proven causal recommendation or guaranteed operational priority."
            )
        )

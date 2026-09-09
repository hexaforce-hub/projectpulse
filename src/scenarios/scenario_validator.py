"""
ProjectPulse — Phase 7: Scenario Validator Service
Ministry of Statistics & Programme Implementation (MoSPI) / IPMD
Team HexaForce — Smart India Hackathon 2026 (SIH26103)
"""

from typing import Dict, List, Any, Tuple
from src.ml.feature_engineering import ALL_FEATURE_COLS, LEAKAGE_COLUMNS
from src.scenarios.intervention_catalog import InterventionCatalog
from src.scenarios.scenario_models import ScenarioModification

class ScenarioValidator:
    """
    Validates scenario requests, prevents target manipulation,
    and flags out-of-distribution or extreme assumptions.
    """
    def __init__(self, catalog: InterventionCatalog = None):
        self.catalog = catalog or InterventionCatalog()
        self.forbidden_targets = set(self.catalog.get_forbidden_target_variables()) | set(LEAKAGE_COLUMNS)
        self.allowed_features = set(ALL_FEATURE_COLS) | {
            "primary_bottleneck", "secondary_bottleneck",
            "milestones_delayed", "milestones_completed", "milestones_at_risk",
            "physical_progress_pct", "cumulative_expenditure_cr",
            "original_cost_cr", "planned_duration_months", "project_age_months"
        }
        self.limits = self.catalog.get_limits()
        self.observed_bounds = self.catalog.get_observed_bounds()

    def validate_scenario(
        self,
        baseline_snapshot: Dict[str, Any],
        modifications: List[ScenarioModification]
    ) -> Tuple[bool, List[str], List[str]]:
        """
        Validates scenario modifications against the baseline project record.
        Returns: (is_valid: bool, errors: List[str], warnings: List[str])
        """
        errors = []
        warnings = []

        # 1. Check modification count limit
        max_mods = self.limits.get("max_modified_features_per_scenario", 10)
        if len(modifications) > max_mods:
            errors.append(f"Scenario exceeds maximum allowed modifications ({len(modifications)} > {max_mods}).")

        if len(modifications) == 0:
            errors.append("Scenario must contain at least one feature modification.")

        # Track modified features
        modified_feature_names = set()

        for mod in modifications:
            feat = mod.feature.strip()
            val = mod.scenario_value

            # 2. Check for forbidden target manipulation
            if feat.lower() in [f.lower() for f in self.forbidden_targets]:
                errors.append(
                    f"FORBIDDEN TARGET OUTCOME: '{feat}' cannot be modified in a hypothetical scenario. "
                    "Scenarios only modify prediction-time operational conditions, never future target outcomes."
                )
                continue

            # 3. Check for unknown/unsupported features
            if feat not in self.allowed_features:
                errors.append(f"UNSUPPORTED FEATURE: '{feat}' is not an intervention-adjustable prediction feature.")
                continue

            modified_feature_names.add(feat)

            # 4. Range and type validations
            if feat == "physical_progress_pct":
                try:
                    num_val = float(val)
                    if num_val < 0.0 or num_val > 100.0:
                        errors.append(f"INVALID RANGE: 'physical_progress_pct' must be between 0.0 and 100.0 (got {num_val}).")
                    else:
                        base_val = float(baseline_snapshot.get("physical_progress_pct", 0.0) or 0.0)
                        if num_val - base_val > 25.0:
                            warnings.append(f"EXTREME ASSUMPTION: Physical progress boost of +{num_val - base_val:.1f}% exceeds typical single-cycle operational limits.")
                except (ValueError, TypeError):
                    errors.append(f"INVALID TYPE: 'physical_progress_pct' must be a numeric value.")

            elif feat == "milestones_delayed":
                try:
                    int_val = int(val)
                    total_m = int(baseline_snapshot.get("milestone_count", 10) or 10)
                    if int_val < 0:
                        errors.append(f"INVALID RANGE: 'milestones_delayed' cannot be negative (got {int_val}).")
                    elif int_val > total_m:
                        errors.append(f"INVALID VALUE: 'milestones_delayed' ({int_val}) cannot exceed total project milestones ({total_m}).")
                except (ValueError, TypeError):
                    errors.append(f"INVALID TYPE: 'milestones_delayed' must be an integer.")

            elif feat == "milestones_completed":
                try:
                    int_val = int(val)
                    total_m = int(baseline_snapshot.get("milestone_count", 10) or 10)
                    if int_val < 0:
                        errors.append(f"INVALID RANGE: 'milestones_completed' cannot be negative (got {int_val}).")
                    elif int_val > total_m:
                        errors.append(f"INVALID VALUE: 'milestones_completed' ({int_val}) cannot exceed total project milestones ({total_m}).")
                except (ValueError, TypeError):
                    errors.append(f"INVALID TYPE: 'milestones_completed' must be an integer.")

            elif feat == "cumulative_expenditure_cr":
                try:
                    num_val = float(val)
                    if num_val < 0.0:
                        errors.append(f"INVALID RANGE: 'cumulative_expenditure_cr' cannot be negative (got {num_val}).")
                except (ValueError, TypeError):
                    errors.append(f"INVALID TYPE: 'cumulative_expenditure_cr' must be a numeric value.")

            elif feat == "original_cost_cr":
                try:
                    num_val = float(val)
                    if num_val < 0.0:
                        errors.append(f"INVALID RANGE: 'original_cost_cr' cannot be negative.")
                except (ValueError, TypeError):
                    errors.append(f"INVALID TYPE: 'original_cost_cr' must be a numeric value.")

            # 5. Check against observed training bounds for cautionary warnings
            if feat in self.observed_bounds and isinstance(val, (int, float)):
                bound = self.observed_bounds[feat]
                b_min = bound.get("min")
                b_max = bound.get("max")
                if (b_min is not None and val < b_min) or (b_max is not None and val > b_max):
                    warnings.append(
                        f"OUT-OF-DISTRIBUTION: Scenario value for '{feat}' ({val}) is outside commonly observed training range [{b_min}, {b_max}]. Result may be less reliable."
                    )

        # 6. Check multiple simultaneous modifications complexity
        if len(modified_feature_names) >= 4:
            warnings.append("COMPLEX SCENARIO: Multiple conditions modified simultaneously. Individual intervention sensitivity may be obscured.")

        is_valid = len(errors) == 0
        return is_valid, errors, warnings

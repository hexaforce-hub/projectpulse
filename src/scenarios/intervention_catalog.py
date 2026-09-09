"""
ProjectPulse — Phase 7: Intervention Catalog Service
Ministry of Statistics & Programme Implementation (MoSPI) / IPMD
Team HexaForce — Smart India Hackathon 2026 (SIH26103)
"""

from pathlib import Path
from typing import Dict, List, Any, Optional
import yaml

CONFIG_DIR = Path(__file__).parent.parent.parent / "config"

class InterventionCatalog:
    """
    Exposes configurable administrative interventions and preset packages.
    """
    def __init__(self, config_dir: Optional[Path] = None):
        self.config_dir = Path(config_dir or CONFIG_DIR)
        self.interventions_file = self.config_dir / "interventions.yaml"
        self.scenario_config_file = self.config_dir / "scenario_config.yaml"
        self._load_config()

    def _load_config(self):
        if self.interventions_file.exists():
            with open(self.interventions_file, "r", encoding="utf-8") as f:
                self.catalog_data = yaml.safe_load(f) or {}
        else:
            self.catalog_data = {}

        if self.scenario_config_file.exists():
            with open(self.scenario_config_file, "r", encoding="utf-8") as f:
                self.scenario_config = yaml.safe_load(f) or {}
        else:
            self.scenario_config = {}

    def get_categories(self) -> List[Dict[str, Any]]:
        return self.catalog_data.get("categories", [])

    def get_presets(self) -> List[Dict[str, Any]]:
        return self.catalog_data.get("presets", [])

    def get_limits(self) -> Dict[str, Any]:
        return self.scenario_config.get("limits", {
            "max_modified_features_per_scenario": 10,
            "max_sensitivity_points": 10,
            "default_sensitivity_points": 5,
            "max_comparison_scenarios": 5
        })

    def get_thresholds(self) -> Dict[str, Any]:
        return self.scenario_config.get("thresholds", {
            "risk_delta_improved": 5.0,
            "risk_delta_deteriorated": -5.0
        })

    def get_observed_bounds(self) -> Dict[str, Any]:
        return self.scenario_config.get("observed_training_bounds", {})

    def get_forbidden_target_variables(self) -> List[str]:
        return self.scenario_config.get("forbidden_target_variables", [])

    def get_disclaimers(self) -> Dict[str, str]:
        return self.scenario_config.get("disclaimers", {
            "mandatory_causal": "Hypothetical model scenario. Results represent model sensitivity to the specified input assumptions and should not be interpreted as causal or guaranteed real-world outcomes.",
            "synthetic_data": "Scenario analysis currently operates on synthetic PAIMANA-modeled infrastructure data.",
            "human_decision": "All scenario outputs are decision-support estimates for monitoring review."
        })

    def get_supported_features(self) -> List[str]:
        features = set()
        for cat in self.get_categories():
            for itv in cat.get("interventions", []):
                if "feature" in itv:
                    features.add(itv["feature"])
                elif "sub_actions" in itv:
                    for sa in itv["sub_actions"]:
                        if "feature" in sa:
                            features.add(sa["feature"])
        return sorted(list(features))

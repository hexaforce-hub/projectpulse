"""
ProjectPulse — Machine Learning Configuration Loader
"""

import os
from pathlib import Path
from typing import Any, Dict
import yaml

DEFAULT_CONFIG_PATH = Path(__file__).parent.parent.parent / "config" / "ml_config.yaml"

def load_ml_config(config_path=None) -> Dict[str, Any]:
    p = Path(config_path or DEFAULT_CONFIG_PATH)
    if not p.exists():
        raise FileNotFoundError(f"ML configuration file not found at: {p}")
    with open(p, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)

ML_CONFIG = load_ml_config()

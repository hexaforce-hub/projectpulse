"""
ProjectPulse — Local Model Registry (Phase 4)
Lightweight In-Memory Caching & Metadata Management for Trained Artifacts
"""

from pathlib import Path
from typing import Dict, Any, Optional

from src.ml.serialization import load_model_artifact

BASE_MODELS_DIR = Path(__file__).parent.parent.parent / "models"

class ModelRegistry:
    def __init__(self, models_dir: Optional[Path] = None):
        self.models_dir = Path(models_dir or BASE_MODELS_DIR)
        self._cache = {}

    def get_model(self, model_family: str, artifact_name: str):
        key = f"{model_family}/{artifact_name}"
        if key not in self._cache:
            sub_dir = self.models_dir / model_family
            loaded = load_model_artifact(sub_dir, artifact_name)
            self._cache[key] = loaded
        return self._cache[key]

    def get_metadata(self, model_family: str) -> Dict[str, Any]:
        meta_path = self.models_dir / model_family / "metadata.json"
        if meta_path.exists():
            import json
            with open(meta_path, "r", encoding="utf-8") as f:
                return json.load(f)
        return {"model_family": model_family, "status": "not_trained"}

    def get_feature_names(self, model_family: str) -> list:
        feat_path = self.models_dir / model_family / "features.json"
        if feat_path.exists():
            import json
            with open(feat_path, "r", encoding="utf-8") as f:
                return json.load(f)
        return []

    def list_models(self) -> Dict[str, Any]:
        result = []
        for family in ["schedule", "cost", "implementation"]:
            fam_dir = self.models_dir / family
            meta_path = fam_dir / "metadata.json"
            if meta_path.exists():
                import json
                with open(meta_path, "r", encoding="utf-8") as f:
                    result.append(json.load(f))
            else:
                result.append({
                    "model_family": family,
                    "status": "not_trained"
                })
        return {"registered_models": result}


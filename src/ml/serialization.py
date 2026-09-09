"""
ProjectPulse — Model Serialization Utilities (Phase 4)
Saves and Loads Production Model Artifacts with Strict Metadata & Feature Catalog Snapshots
"""

import json
from pathlib import Path
from typing import Dict, Any, List
import joblib

def save_model_artifact(
    model_dir: Path,
    artifact_name: str,
    pipeline: Any,
    metadata: Dict[str, Any],
    feature_names: List[str]
):
    """
    Persists pipeline, metadata.json, and features.json in the target directory.
    """
    model_dir.mkdir(parents=True, exist_ok=True)
    joblib_path = model_dir / f"{artifact_name}.joblib"
    meta_path = model_dir / "metadata.json"
    feat_path = model_dir / "features.json"

    joblib.dump(pipeline, joblib_path)

    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    with open(feat_path, "w", encoding="utf-8") as f:
        json.dump({
            "feature_set_version": metadata.get("feature_set_version", "features_v1"),
            "features_count": len(feature_names),
            "features": feature_names
        }, f, indent=2)

def load_model_artifact(model_dir: Path, artifact_name: str) -> Dict[str, Any]:
    """
    Loads pipeline, metadata, and feature names from the model directory.
    """
    joblib_path = model_dir / f"{artifact_name}.joblib"
    meta_path = model_dir / "metadata.json"
    feat_path = model_dir / "features.json"

    if not joblib_path.exists():
        raise FileNotFoundError(f"Model file missing at: {joblib_path}")

    pipeline = joblib.load(joblib_path)

    metadata = {}
    if meta_path.exists():
        with open(meta_path, "r", encoding="utf-8") as f:
            metadata = json.load(f)

    features = []
    if feat_path.exists():
        with open(feat_path, "r", encoding="utf-8") as f:
            features = json.load(f).get("features", [])

    return {
        "pipeline": pipeline,
        "metadata": metadata,
        "features": features
    }

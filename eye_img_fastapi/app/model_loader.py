from pathlib import Path
import pickle
import tensorflow as tf


BASE_DIR = Path(__file__).resolve().parent.parent
MODELS_DIR = BASE_DIR / "models"
METADATA_PATH = MODELS_DIR / "ensemble_metadata.pkl"

MODEL_STORE = {
    "loaded": False,
    "models": {},
    "model_names": [],
    "class_names": [],
    "weights": [],
}

MODEL_FILENAME_CANDIDATES = {
    "custom_cnn": ["best_custom_cnn.h5"],
    "efficientnet": ["best_efficientnet.h5", "best_efficientnet (1).h5"],
    "resnet50": ["best_resnet50.h5"],
}


def _normalize_weights(weights):
    weights = [float(w) for w in weights]
    total = sum(weights)
    if total == 0:
        raise ValueError("Ensemble weights sum cannot be zero.")
    return [w / total for w in weights]


def _resolve_model_path(model_name: str) -> Path:
    candidates = MODEL_FILENAME_CANDIDATES.get(model_name, [f"best_{model_name}.h5"])

    for filename in candidates:
        path = MODELS_DIR / filename
        if path.exists():
            return path

    raise FileNotFoundError(
        f"Model file not found for '{model_name}'. Checked: {candidates}"
    )


def load_all_models():
    if not METADATA_PATH.exists():
        raise FileNotFoundError(f"Metadata file not found: {METADATA_PATH}")

    with open(METADATA_PATH, "rb") as f:
        metadata = pickle.load(f)

    model_names = metadata.get("model_names", [])
    class_names = metadata.get("class_names", [])
    weights = metadata.get("weights", [])

    if not model_names:
        raise ValueError("No model names found in ensemble_metadata.pkl")
    if not class_names:
        raise ValueError("No class names found in ensemble_metadata.pkl")
    if not weights:
        raise ValueError("No ensemble weights found in ensemble_metadata.pkl")

    weights = _normalize_weights(weights)

    loaded_models = {}
    for model_name in model_names:
        model_path = _resolve_model_path(model_name)
        loaded_models[model_name] = tf.keras.models.load_model(model_path, compile=False)

    MODEL_STORE["loaded"] = True
    MODEL_STORE["models"] = loaded_models
    MODEL_STORE["model_names"] = model_names
    MODEL_STORE["class_names"] = class_names
    MODEL_STORE["weights"] = weights

    return MODEL_STORE


def get_model_store():
    if not MODEL_STORE["loaded"]:
        raise RuntimeError("Models are not loaded yet.")
    return MODEL_STORE
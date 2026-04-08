from pathlib import Path
import joblib

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "models" / "eye_disease_model.joblib"

if not MODEL_PATH.exists():
    raise FileNotFoundError(f"Model file not found: {MODEL_PATH}")

model_package = joblib.load(MODEL_PATH)

model = model_package["model"]
vectorizer = model_package["vectorizer"]
disease_labels = model_package["disease_labels"]
metadata = model_package.get("metadata", {})
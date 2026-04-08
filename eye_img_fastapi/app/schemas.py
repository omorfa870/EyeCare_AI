from typing import Dict, List, Optional
from pydantic import BaseModel


class PredictionResponse(BaseModel):
    success: bool
    filename: Optional[str] = None
    predicted_class: str
    confidence: float
    all_scores: Dict[str, float]


class HealthResponse(BaseModel):
    status: str
    models_loaded: bool
    model_names: List[str]
    class_names: List[str]
    weights: List[float]


class ErrorResponse(BaseModel):
    success: bool = False
    error: str
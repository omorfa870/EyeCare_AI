from pydantic import BaseModel, Field
from typing import List


class SymptomRequest(BaseModel):
    symptom_text: str = Field(..., min_length=3, description="রোগীর symptom text")


class PredictionItem(BaseModel):
    disease: str
    confidence: float


class PredictionResponse(BaseModel):
    success: bool
    input_symptom: str
    cleaned_symptom: str
    predictions: List[PredictionItem]
    disclaimer: str
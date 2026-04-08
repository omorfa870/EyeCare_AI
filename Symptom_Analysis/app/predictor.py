import numpy as np

from app.preprocessing import preprocess_text
from app.model_loader import model, vectorizer, disease_labels


DISCLAIMER_TEXT = "This tool is for screening support only. It is not a final diagnosis."


def predict_disease(symptom_text: str, top_k: int = 3):
    cleaned_text = preprocess_text(symptom_text)

    if not cleaned_text:
        raise ValueError("symptom_text cannot be empty")

    X = vectorizer.transform([cleaned_text])

    if hasattr(model, "predict_proba"):
        probs = model.predict_proba(X)

        if isinstance(probs, list):
            scores = np.array([p[0][1] for p in probs])
        else:
            scores = probs[0]

    elif hasattr(model, "decision_function"):
        decision = model.decision_function(X)

        if isinstance(decision, list):
            decision = np.array([d[0] for d in decision])

        decision = np.array(decision).flatten()
        scores = 1 / (1 + np.exp(-decision))

    else:
        predicted = model.predict(X)

        if isinstance(predicted, list):
            scores = np.array([int(p[0]) for p in predicted])
        else:
            scores = np.array(predicted).flatten()

    results = []

    for disease, score in zip(disease_labels, scores):
        results.append({
            "disease": disease,
            "confidence": round(float(score), 4)
        })

    results = sorted(results, key=lambda x: x["confidence"], reverse=True)
    top_results = results[:top_k]

    return {
        "success": True,
        "input_symptom": symptom_text,
        "cleaned_symptom": cleaned_text,
        "predictions": top_results,
        "disclaimer": DISCLAIMER_TEXT
    }
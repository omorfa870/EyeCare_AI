import numpy as np
from app.model_loader import get_model_store


def predict_ensemble(image_array):
    store = get_model_store()

    models = store["models"]
    model_names = store["model_names"]
    class_names = store["class_names"]
    weights = store["weights"]

    final_pred = np.zeros(len(class_names), dtype=np.float32)

    for model_name, weight in zip(model_names, weights):
        pred = models[model_name].predict(image_array, verbose=0)[0]
        pred = np.asarray(pred, dtype=np.float32)
        final_pred += pred * weight

    # safer normalization
    total = float(np.sum(final_pred))
    if total > 0:
        final_pred = final_pred / total

    predicted_index = int(np.argmax(final_pred))
    predicted_class = class_names[predicted_index]
    confidence = float(final_pred[predicted_index])

    all_scores = {
        class_names[i]: round(float(final_pred[i]), 6)
        for i in range(len(class_names))
    }

    return {
        "success": True,
        "predicted_class": predicted_class,
        "confidence": round(confidence, 6),
        "all_scores": all_scores,
    }
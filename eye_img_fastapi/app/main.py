import os
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"

from fastapi import FastAPI, File, UploadFile, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.model_loader import load_all_models, get_model_store
from app.predictor import predict_ensemble
from app.utils import validate_upload_file, preprocess_image
from app.schemas import PredictionResponse, HealthResponse


app = FastAPI(
    title="Eye Disease Classification API",
    description="FastAPI for eye fundus image classification using weighted ensemble models.",
    version="1.0.0"
)

# Development-এর জন্য সব origin allow করা হলো
# পরে frontend URL দিয়ে restrict করবেন
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(HTTPException)
async def custom_http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": exc.detail
        }
    )


@app.exception_handler(Exception)
async def custom_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": f"Internal server error: {str(exc)}"
        }
    )


@app.on_event("startup")
def startup_event():
    load_all_models()


@app.get("/")
def root():
    return {
        "message": "Eye Disease Classification API is running."
    }


@app.get("/health", response_model=HealthResponse)
def health_check():
    store = get_model_store()
    return {
        "status": "ok",
        "models_loaded": store["loaded"],
        "model_names": store["model_names"],
        "class_names": store["class_names"],
        "weights": store["weights"],
    }


@app.post("/predict", response_model=PredictionResponse)
async def predict(file: UploadFile = File(...)):
    validate_upload_file(file)

    file_bytes = await file.read()
    image_array = preprocess_image(file_bytes)
    result = predict_ensemble(image_array)

    result["filename"] = file.filename
    return result
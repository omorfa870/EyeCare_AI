# Eye Disease Classification FastAPI

A FastAPI backend for eye fundus image classification using an ensemble of deep learning models.

The API accepts image files and returns:

- predicted disease class
- confidence score
- probability scores for all classes

---

## Features

- FastAPI backend
- Ensemble-based prediction
- Accepts `jpg`, `jpeg`, and `png`
- Returns prediction with confidence
- Returns class-wise probabilities
- Health check endpoint
- Interactive API docs with Swagger UI

---

## Project Structure

```bash
Image_Classification/
│
├── app/
│   ├── main.py
│   ├── model_loader.py
│   ├── predictor.py
│   ├── schemas.py
│   └── utils.py
│
├── models/
│   ├── best_custom_cnn.h5
│   ├── best_efficientnet.h5
│   ├── best_resnet50.h5
│   └── ensemble_metadata.pkl
│
├── requirements.txt
├── .gitignore
└── README.md


# Models files drive link  "https://drive.google.com/drive/folders/1ISHb48yyvbt3ez7DP5mF_9SM-1FkeTjP"

# get server: python -m uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload 
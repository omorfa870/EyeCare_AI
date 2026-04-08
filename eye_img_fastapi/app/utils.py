from pathlib import Path
from fastapi import HTTPException, UploadFile
import tensorflow as tf
import numpy as np


ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png"}
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/jpg", "image/png"}

IMG_SIZE = (128, 128)
MAX_FILE_SIZE_MB = 5
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024


def validate_upload_file(file: UploadFile):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided.")

    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Only jpg, jpeg, and png files are allowed."
        )

    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Invalid content type. Only image files are allowed."
        )


def preprocess_image(file_bytes: bytes):
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    if len(file_bytes) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=400,
            detail=f"File size exceeds {MAX_FILE_SIZE_MB} MB limit."
        )

    try:
        image = tf.io.decode_image(
            file_bytes,
            channels=3,
            expand_animations=False
        )
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid or corrupted image file.")

    if len(image.shape) != 3:
        raise HTTPException(status_code=400, detail="Invalid image shape.")

    image = tf.image.resize(image, IMG_SIZE)
    image = tf.cast(image, tf.float32) / 255.0
    image = tf.expand_dims(image, axis=0)

    return image.numpy()
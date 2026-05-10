"""
routers/detect.py
─────────────────
REST endpoint: POST /api/detect/image
"""

import time
import logging

from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse

from app.core.model import preprocess_image, run_inference, evaluate_compliance
from app.core.config import settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/detect", tags=["Detection"])

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_MB        = 10


@router.post("/image")
async def detect_image(file: UploadFile = File(...)):
    """
    Deteksi PPE dari gambar yang di-upload.

    Request : multipart/form-data, field `file` (JPG/PNG/WebP, maks 10MB)

    Response:
    {
        "status":          "complete" | "violation" | "no_detection",
        "total_detected":  2,
        "complete_count":  1,
        "violation_count": 1,
        "violations":      ["no_helmet"],
        "avg_confidence":  0.91,
        "detections": [
            {
                "label":      "no_helmet",
                "confidence": 0.934,
                "bbox_norm":  [0.10, 0.05, 0.42, 0.68],
                "bbox":       [64, 32, 269, 326]
            }
        ],
        "inference_ms":    22.1,
        "threshold":       0.50
    }
    """
    # Validasi tipe
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(415, f"Tipe tidak didukung: {file.content_type}. Gunakan JPG/PNG/WebP.")

    image_bytes = await file.read()
    if len(image_bytes) / 1024 / 1024 > MAX_MB:
        raise HTTPException(413, f"File terlalu besar (maks {MAX_MB}MB).")

    # Preprocessing
    try:
        img_array = preprocess_image(image_bytes)
    except Exception as e:
        raise HTTPException(422, f"Gagal membaca gambar: {e}")

    # Inferensi
    t0 = time.perf_counter()
    try:
        detections = run_inference(img_array)
    except Exception as e:
        logger.error(f"Inferensi gagal: {e}")
        raise HTTPException(500, f"Model gagal: {e}")
    inference_ms = round((time.perf_counter() - t0) * 1000, 1)

    compliance = evaluate_compliance(detections)

    logger.info(
        f"[IMG] {file.filename} | {len(detections)} deteksi | "
        f"{compliance['status']} | {inference_ms}ms"
    )

    return JSONResponse({
        **compliance,
        "detections":   detections,
        "inference_ms": inference_ms,
        "threshold":    settings.CONFIDENCE_THRESHOLD,
    })


@router.get("/health")
async def health():
    from app.core.model import get_model
    ready = get_model() is not None
    return {
        "model_ready": ready,
        "model_path":  settings.MODEL_PATH,
        "threshold":   settings.CONFIDENCE_THRESHOLD,
        "classes":     settings.CLASS_NAMES,
        "message":     "Siap." if ready else "Model belum dimuat.",
    }
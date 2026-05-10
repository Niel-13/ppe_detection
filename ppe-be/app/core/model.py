"""
model.py — PPE Detection via YOLOv8 ONNX
─────────────────────────────────────────
Model: best.onnx (YOLOv8, trained Ultralytics)
Input : [1, 3, 640, 640] float32 normalized
Output: [1, 8, 8400]
  → rows 0-3 : cx, cy, w, h  (dalam ruang 640×640)
  → rows 4-7 : skor kelas [complete_vest_helmet, no_helmet, no_vest, no_vest_no_helmet]

Kelas:
  0 complete_vest_helmet → APD lengkap  ✓
  1 no_helmet            → tanpa helm   ⚠
  2 no_vest              → tanpa vest   ⚠
  3 no_vest_no_helmet    → tanpa APD    ✗
"""

import io
import logging
import numpy as np
from PIL import Image

import onnxruntime as ort

from app.core.config import settings

logger = logging.getLogger(__name__)

# ── Konstanta ─────────────────────────────────────────────
INPUT_SIZE   = 640
VIOLATION_CLASSES = {"no_helmet", "no_vest", "no_vest_no_helmet"}

# ── Global session ────────────────────────────────────────
_session: ort.InferenceSession | None = None


# ═════════════════════════════════════════════════════════
#  LOAD MODEL
# ═════════════════════════════════════════════════════════
def load_model() -> None:
    global _session
    try:
        providers = ["CUDAExecutionProvider", "CPUExecutionProvider"]
        _session = ort.InferenceSession(settings.MODEL_PATH, providers=providers)
        used = _session.get_providers()[0]
        logger.info(f"Model ONNX dimuat: {settings.MODEL_PATH} | Provider: {used}")
        logger.info(f"Kelas: {settings.CLASS_NAMES}")
        logger.info(f"Confidence threshold: {settings.CONFIDENCE_THRESHOLD}")
    except FileNotFoundError:
        logger.error(f"File model tidak ditemukan: {settings.MODEL_PATH}")
        _session = None
    except Exception as e:
        logger.error(f"Gagal memuat model: {e}")
        _session = None


def get_model() -> ort.InferenceSession | None:
    return _session


# ═════════════════════════════════════════════════════════
#  PREPROCESSING — Letterbox resize
# ═════════════════════════════════════════════════════════
def _letterbox(img_array: np.ndarray):
    """
    Resize gambar ke INPUT_SIZE×INPUT_SIZE dengan letterbox (padding abu-abu).
    Mengembalikan tensor, scale, orig_w, orig_h.
    """
    orig_h, orig_w = img_array.shape[:2]
    scale = min(INPUT_SIZE / orig_w, INPUT_SIZE / orig_h)
    new_w = int(orig_w * scale)
    new_h = int(orig_h * scale)

    img_resized = np.array(
        Image.fromarray(img_array).resize((new_w, new_h), Image.BILINEAR)
    )

    # Padding abu-abu (nilai 114 seperti Ultralytics default)
    padded = np.full((INPUT_SIZE, INPUT_SIZE, 3), 114, dtype=np.uint8)
    padded[:new_h, :new_w] = img_resized

    # Normalize dan transpose ke [1, C, H, W]
    tensor = padded.astype(np.float32) / 255.0
    tensor = tensor.transpose(2, 0, 1)[np.newaxis]

    return tensor, scale, orig_w, orig_h


def preprocess_image(image_bytes: bytes) -> np.ndarray:
    """Konversi bytes gambar → numpy array RGB uint8."""
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    return np.array(img)


# ═════════════════════════════════════════════════════════
#  NMS — Non-Maximum Suppression
# ═════════════════════════════════════════════════════════
def _nms(boxes: np.ndarray, scores: np.ndarray, iou_thr: float) -> list[int]:
    """Greedy NMS. Mengembalikan indeks box yang dipertahankan."""
    if len(boxes) == 0:
        return []

    x1, y1, x2, y2 = boxes[:, 0], boxes[:, 1], boxes[:, 2], boxes[:, 3]
    areas = (x2 - x1) * (y2 - y1)
    order = scores.argsort()[::-1]
    keep  = []

    while order.size > 0:
        i = order[0]
        keep.append(int(i))
        if order.size == 1:
            break
        xx1 = np.maximum(x1[i], x1[order[1:]])
        yy1 = np.maximum(y1[i], y1[order[1:]])
        xx2 = np.minimum(x2[i], x2[order[1:]])
        yy2 = np.minimum(y2[i], y2[order[1:]])
        inter = np.maximum(0.0, xx2 - xx1) * np.maximum(0.0, yy2 - yy1)
        iou   = inter / (areas[i] + areas[order[1:]] - inter + 1e-6)
        order = order[np.where(iou <= iou_thr)[0] + 1]

    return keep


# ═════════════════════════════════════════════════════════
#  POSTPROCESSING — Output YOLO → list deteksi
# ═════════════════════════════════════════════════════════
def _postprocess(
    raw_output: np.ndarray,
    scale: float,
    orig_w: int,
    orig_h: int,
) -> list[dict]:
    """
    Konversi output ONNX [1, 8, 8400] → list dict deteksi.

    Setiap dict:
      label      : nama kelas (str)
      confidence : skor kepercayaan (float 0-1)
      bbox_norm  : [x1, y1, x2, y2] ternormalisasi 0-1 relatif ke gambar asli
      bbox       : [x1, y1, x2, y2] piksel dalam gambar asli
    """
    # Transpose: [1, 8, 8400] → [8400, 8]
    pred = raw_output[0].T  # [8400, 8]

    bboxes     = pred[:, :4]   # cx, cy, w, h
    cls_scores = pred[:, 4:]   # 4 kelas

    # Kelas dengan skor tertinggi
    class_ids   = cls_scores.argmax(axis=1)
    confidences = cls_scores.max(axis=1)

    # Filter confidence
    mask = confidences >= settings.CONFIDENCE_THRESHOLD
    bboxes      = bboxes[mask]
    confidences = confidences[mask]
    class_ids   = class_ids[mask]

    if len(bboxes) == 0:
        return []

    # cx,cy,w,h → x1,y1,x2,y2 (dalam ruang 640×640)
    x1 = bboxes[:, 0] - bboxes[:, 2] / 2
    y1 = bboxes[:, 1] - bboxes[:, 3] / 2
    x2 = bboxes[:, 0] + bboxes[:, 2] / 2
    y2 = bboxes[:, 1] + bboxes[:, 3] / 2
    boxes_xyxy = np.stack([x1, y1, x2, y2], axis=1)

    # NMS per kelas
    keep: list[int] = []
    for cid in np.unique(class_ids):
        cls_mask = class_ids == cid
        cls_keep = _nms(
            boxes_xyxy[cls_mask],
            confidences[cls_mask],
            settings.IOU_THRESHOLD,
        )
        original_idx = np.where(cls_mask)[0][cls_keep]
        keep.extend(original_idx.tolist())

    # Susun hasil
    results = []
    for i in keep:
        # Konversi dari ruang 640×640 ke piksel asli
        x1_o = float(boxes_xyxy[i, 0]) / scale
        y1_o = float(boxes_xyxy[i, 1]) / scale
        x2_o = float(boxes_xyxy[i, 2]) / scale
        y2_o = float(boxes_xyxy[i, 3]) / scale

        # Clamp ke batas gambar
        x1_o = max(0.0, min(orig_w, x1_o))
        y1_o = max(0.0, min(orig_h, y1_o))
        x2_o = max(0.0, min(orig_w, x2_o))
        y2_o = max(0.0, min(orig_h, y2_o))

        label = settings.CLASS_NAMES[int(class_ids[i])]

        results.append({
            "label":      label,
            "confidence": round(float(confidences[i]), 4),
            # Koordinat ternormalisasi 0-1 (untuk frontend positioning)
            "bbox_norm": [
                round(x1_o / orig_w, 4),
                round(y1_o / orig_h, 4),
                round(x2_o / orig_w, 4),
                round(y2_o / orig_h, 4),
            ],
            # Koordinat piksel (untuk referensi / logging)
            "bbox": [int(x1_o), int(y1_o), int(x2_o), int(y2_o)],
        })

    return results


# ═════════════════════════════════════════════════════════
#  INFERENSI UTAMA
# ═════════════════════════════════════════════════════════
def run_inference(image_array: np.ndarray) -> list[dict]:
    """
    Jalankan deteksi PPE pada gambar.
    Mengembalikan list deteksi, atau [] jika model belum dimuat.
    """
    session = get_model()
    if session is None:
        logger.warning("Model belum dimuat — kembalikan deteksi kosong.")
        return []

    tensor, scale, orig_w, orig_h = _letterbox(image_array)

    raw = session.run(None, {"images": tensor})

    return _postprocess(raw[0], scale, orig_w, orig_h)


# ═════════════════════════════════════════════════════════
#  EVALUASI KEPATUHAN
# ═════════════════════════════════════════════════════════
def evaluate_compliance(detections: list[dict]) -> dict:
    """
    Mengevaluasi status kepatuhan APD dari hasil deteksi.

    Returns:
        status          : "complete" | "violation" | "no_detection"
        total_detected  : jumlah orang terdeteksi
        complete_count  : jumlah dengan APD lengkap (kelas 0)
        violation_count : jumlah dengan APD tidak lengkap
        violations      : list label pelanggaran
        avg_confidence  : rata-rata confidence semua deteksi
    """
    if not detections:
        return {
            "status":          "no_detection",
            "total_detected":  0,
            "complete_count":  0,
            "violation_count": 0,
            "violations":      [],
            "avg_confidence":  0.0,
        }

    violation_dets = [d for d in detections if d["label"] in VIOLATION_CLASSES]
    complete_dets  = [d for d in detections if d["label"] == "complete_vest_helmet"]
    avg_conf       = round(float(np.mean([d["confidence"] for d in detections])), 4)

    return {
        "status":          "violation" if violation_dets else "complete",
        "total_detected":  len(detections),
        "complete_count":  len(complete_dets),
        "violation_count": len(violation_dets),
        "violations":      [d["label"] for d in violation_dets],
        "avg_confidence":  avg_conf,
    }
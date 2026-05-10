"""
routers/websocket.py
─────────────────────
WebSocket endpoint deteksi real-time.

  Frontend → kirim Base64 JPEG setiap ~200ms
  Backend  → decode → infer → kirim JSON hasil deteksi
"""

import base64
import time
import json
import logging

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.core.model import preprocess_image, run_inference, evaluate_compliance

logger = logging.getLogger(__name__)
router = APIRouter(tags=["WebSocket"])


# ── Connection Manager ────────────────────────────────────
class ConnectionManager:
    def __init__(self):
        self.active: list[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active.append(ws)
        logger.info(f"WS client terhubung. Aktif: {len(self.active)}")

    def disconnect(self, ws: WebSocket):
        if ws in self.active:
            self.active.remove(ws)
        logger.info(f"WS client terputus. Aktif: {len(self.active)}")

    async def send(self, ws: WebSocket, data: dict):
        await ws.send_text(json.dumps(data, ensure_ascii=False))


manager = ConnectionManager()


# ── Endpoint ──────────────────────────────────────────────
@router.websocket("/ws/detect")
async def websocket_detect(ws: WebSocket):
    """
    Real-time PPE detection via WebSocket.

    Pesan masuk (string):
        data:image/jpeg;base64,<base64_data>
        atau langsung <base64_data>

    Respons (JSON):
    {
        "status":          "complete" | "violation" | "no_detection",
        "total_detected":  2,
        "complete_count":  1,
        "violation_count": 1,
        "violations":      ["no_helmet"],
        "avg_confidence":  0.91,
        "detections": [
            {
                "label":      "complete_vest_helmet",
                "confidence": 0.956,
                "bbox_norm":  [0.12, 0.08, 0.45, 0.72],
                "bbox":       [76, 38, 288, 346]
            },
            ...
        ],
        "inference_ms": 18.4
    }
    """
    await manager.connect(ws)

    try:
        while True:
            raw = await ws.receive_text()

            if not raw:
                continue

            # ── Decode Base64 ───────────────────────────
            try:
                b64 = raw.split(",", 1)[1] if "," in raw else raw
                image_bytes = base64.b64decode(b64)
            except Exception as e:
                await manager.send(ws, {"error": f"Gagal decode Base64: {e}"})
                continue

            # ── Preprocessing ───────────────────────────
            try:
                image_array = preprocess_image(image_bytes)
            except Exception as e:
                await manager.send(ws, {"error": f"Gagal baca gambar: {e}"})
                continue

            # ── Inferensi ───────────────────────────────
            t0 = time.perf_counter()
            try:
                detections = run_inference(image_array)
            except Exception as e:
                logger.error(f"Inferensi gagal: {e}")
                await manager.send(ws, {"error": f"Inferensi gagal: {e}"})
                continue
            inference_ms = round((time.perf_counter() - t0) * 1000, 1)

            # ── Evaluasi & Kirim ────────────────────────
            compliance = evaluate_compliance(detections)

            await manager.send(ws, {
                **compliance,
                "detections": detections,
                "inference_ms": inference_ms,
                "server_time": time.time(),
            })

    except WebSocketDisconnect:
        manager.disconnect(ws)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(ws)
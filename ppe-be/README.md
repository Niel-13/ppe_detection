# PPE Detection — Backend (FastAPI)

Backend REST + WebSocket untuk sistem deteksi APD berbasis AI.

---

## Struktur Folder

```
ppe-backend/
├── app/
│   ├── main.py               ← Entry point FastAPI
│   ├── core/
│   │   ├── config.py         ← Baca konfigurasi dari .env
│   │   └── model.py          ← ⭐ ISI INI dengan model Anda
│   └── routers/
│       ├── detect.py         ← POST /api/detect/image
│       └── websocket.py      ← WS  /ws/detect
├── models/
│   └── weights/              ← Letakkan file model di sini
├── .env                      ← Konfigurasi (salin dari .env)
├── requirements.txt
└── README.md
```

---

## Cara Setup

### 1. Buat virtual environment

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Mac / Linux
source venv/bin/activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

Jika menggunakan **YOLOv8**, tambahkan juga:
```bash
pip install ultralytics
```

### 3. Konfigurasi .env

Edit file `.env` dan sesuaikan:

```env
MODEL_PATH=models/weights/best.pt   # path ke model Anda
CONFIDENCE_THRESHOLD=0.60            # ambang batas deteksi
CLASS_NAMES=helmet,vest              # nama kelas sesuai training
```

### 4. Isi kode model

Buka `app/core/model.py` dan isi dua fungsi berikut:

**`load_model()`** — contoh YOLOv8:
```python
from ultralytics import YOLO

def load_model():
    global _model
    _model = YOLO(settings.MODEL_PATH)
    logger.info(f"Model dimuat dari {settings.MODEL_PATH}")
```

**`run_inference()`** — contoh YOLOv8:
```python
def run_inference(image_array):
    model = get_model()
    results = model(image_array, conf=settings.CONFIDENCE_THRESHOLD)[0]
    detections = []
    for box in results.boxes:
        detections.append({
            "label":      results.names[int(box.cls)],
            "confidence": float(box.conf),
            "bbox":       [int(v) for v in box.xyxy[0].tolist()],
        })
    return detections
```

### 5. Letakkan file model

Salin file model (`.pt`, `.h5`, `.onnx`, dsb.) ke:
```
models/weights/best.pt
```

### 6. Jalankan server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Server berjalan di: `http://localhost:8000`
Swagger UI tersedia di: `http://localhost:8000/docs`

---

## API Endpoints

| Method    | URL                   | Deskripsi                              |
|-----------|-----------------------|----------------------------------------|
| `GET`     | `/`                   | Cek status server                      |
| `GET`     | `/api/detect/health`  | Cek status model                       |
| `POST`    | `/api/detect/image`   | Deteksi dari file gambar               |
| `WS`      | `/ws/detect`          | Deteksi real-time dari kamera          |

---

## Format Response

### POST /api/detect/image

```json
{
    "status":           "complete",
    "detections": [
        { "label": "helmet", "confidence": 0.982, "bbox": [120, 45, 200, 160] },
        { "label": "vest",   "confidence": 0.965, "bbox": [80, 160, 260, 380] }
    ],
    "helmet_count":     1,
    "vest_count":       1,
    "missing":          [],
    "inference_ms":     18.5,
    "model_threshold":  0.60
}
```

### WS /ws/detect

**Kirim** (dari frontend, setiap ~200ms):
```
data:image/jpeg;base64,/9j/4AAQSkZJRg...
```

**Terima** (dari backend):
```json
{
    "status":       "complete",
    "detections":   [...],
    "helmet_count": 1,
    "vest_count":   1,
    "missing":      [],
    "inference_ms": 14.2
}
```

---

## Integrasi dengan Frontend React

Setelah backend berjalan, buka `src/pages/DetectionPage.jsx`
dan ganti bagian simulasi dengan koneksi nyata:

```javascript
// Ganti interval simulasi dengan ini:
const ws = new WebSocket("ws://localhost:8000/ws/detect");
ws.onmessage = (e) => {
    const data = JSON.parse(e.data);
    setCamRes({
        h:       data.helmet_count,
        v:       data.vest_count,
        missing: data.missing.length > 0,
        hc:      (data.detections.find(d => d.label === "helmet")?.confidence * 100 || 0).toFixed(1),
        vc:      (data.detections.find(d => d.label === "vest")?.confidence  * 100 || 0).toFixed(1),
    });
};
```

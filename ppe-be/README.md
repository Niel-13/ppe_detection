# PPE Detection — Backend FastAPI

## Cara Menjalankan

### 1. Masuk ke folder backend
```bash
cd ppe-be
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Pastikan model ada di path yang benar
File `models/weights/best.onnx` harus ada. File `.env` sudah dikonfigurasi untuk path ini.

### 4. Jalankan server
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Server berjalan di: http://localhost:8000
Dokumentasi API: http://localhost:8000/docs

---

## Endpoints

| Method | Path | Keterangan |
|--------|------|-----------|
| GET | `/` | Root / health check |
| GET | `/api/detect/health` | Status model |
| POST | `/api/detect/image` | Deteksi dari gambar upload |
| WS | `/ws/detect` | Deteksi real-time via WebSocket |

---

## Konfigurasi (.env)

| Key | Default | Keterangan |
|-----|---------|-----------|
| `HOST` | `0.0.0.0` | Host server |
| `PORT` | `8000` | Port server |
| `CORS_ORIGINS` | `http://localhost:3000` | Origin frontend |
| `MODEL_PATH` | `models/weights/best.onnx` | Path model ONNX |
| `CONFIDENCE_THRESHOLD` | `0.40` | Min confidence deteksi |
| `IOU_THRESHOLD` | `0.45` | IOU threshold NMS |
| `CLASS_NAMES` | `complete_vest_helmet,...` | Nama kelas (urutan sesuai model) |

---

## Kelas Model

| ID | Label | Keterangan |
|----|-------|-----------|
| 0 | `complete_vest_helmet` | APD Lengkap ✓ |
| 1 | `no_helmet` | Tanpa Helm ⚠ |
| 2 | `no_vest` | Tanpa Vest ⚠ |
| 3 | `no_vest_no_helmet` | Tanpa APD ✗ |

---

## Troubleshooting

**Model tidak ditemukan:**
Pastikan `best.onnx` ada di `ppe-be/models/weights/best.onnx`

**CORS Error:**
Tambahkan origin frontend ke `CORS_ORIGINS` di `.env`

**Deteksi selalu kosong:**
Coba turunkan `CONFIDENCE_THRESHOLD` ke `0.30` atau `0.25`

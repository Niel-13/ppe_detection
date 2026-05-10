"""
main.py — PPE Detection FastAPI
"""
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.model  import load_model
from app.routers     import detect, websocket

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("=" * 52)
    logger.info("  PPE Detection Backend — Startup")
    logger.info(f"  Model    : {settings.MODEL_PATH}")
    logger.info(f"  Threshold: {settings.CONFIDENCE_THRESHOLD}")
    logger.info(f"  Classes  : {settings.CLASS_NAMES}")
    logger.info("=" * 52)
    load_model()
    logger.info("  Server siap menerima koneksi!")
    yield
    logger.info("Server dimatikan.")


app = FastAPI(
    title="PPE Detection API",
    description="Deteksi APD real-time via YOLOv8 ONNX + WebSocket",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(detect.router)
app.include_router(websocket.router)


@app.get("/", tags=["Root"])
async def root():
    return {"app": "PPE Detection API", "version": "2.0.0", "docs": "/docs"}
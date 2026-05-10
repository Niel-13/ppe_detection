import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    HOST: str               = os.getenv("HOST", "0.0.0.0")
    PORT: int               = int(os.getenv("PORT", 8000))
    CORS_ORIGINS: list[str] = [o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")]
    MODEL_PATH: str             = os.getenv("MODEL_PATH", "models/weights/best.onnx")
    CONFIDENCE_THRESHOLD: float = float(os.getenv("CONFIDENCE_THRESHOLD", 0.50))
    IOU_THRESHOLD: float        = float(os.getenv("IOU_THRESHOLD", 0.45))
    # Urutan kelas sesuai training model
    CLASS_NAMES: list[str]  = [c.strip() for c in os.getenv(
        "CLASS_NAMES", "complete_vest_helmet,no_helmet,no_vest,no_vest_no_helmet"
    ).split(",")]

settings = Settings()
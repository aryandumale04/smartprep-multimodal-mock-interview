from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any

app = FastAPI(title="SmartPrep ML Service", version="0.1.0")

# Local-only service: allow calls from frontend/backend during development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------
# Health Check
# --------------------
@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "smartprep-ml-service",
        "version": "0.1.0"
    }

# --------------------
# Request Schemas
# --------------------
class TranscribeRequest(BaseModel):
    attemptId: str


class VideoAnalyzeRequest(BaseModel):
    attemptId: str


class EvaluateRequest(BaseModel):
    attemptId: str


# --------------------
# Response Schemas
# --------------------
class TranscribeResponse(BaseModel):
    transcript: str


class VideoAnalyzeResponse(BaseModel):
    metrics: Dict[str, Any]


class EvaluateResponse(BaseModel):
    finalScore: float          # score out of 10
    strengths: List[str]
    weaknesses: List[str]
    summary: str


# --------------------
# Placeholder Endpoints
# --------------------
@app.post("/transcribe", response_model=TranscribeResponse)
def transcribe(_: TranscribeRequest):
    return {
        "transcript": "Dummy transcript. Real Whisper-based transcription will be implemented later."
    }


@app.post("/video-analyze", response_model=VideoAnalyzeResponse)
def video_analyze(_: VideoAnalyzeRequest):
    return {
        "metrics": {
            "note": "Dummy video metrics. MediaPipe/CNN analysis will be added later."
        }
    }


@app.post("/evaluate", response_model=EvaluateResponse)
def evaluate(_: EvaluateRequest):
    return {
        "finalScore": 7.5,
        "strengths": [
            "Clear explanation of key concepts",
            "Confident and steady communication"
        ],
        "weaknesses": [
            "Some answers lacked depth",
            "Occasional pauses while responding"
        ],
        "summary": (
            "Overall performance was good. Communication was clear and confident, "
            "but adding more depth to answers and reducing pauses would improve the score."
        )
    }

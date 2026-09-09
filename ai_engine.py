import io
import math
import os
import re
from typing import Optional, List, Dict, Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import uvicorn

# Optional deep learning libraries with graceful fallback
try:
    from sentence_transformers import SentenceTransformer, util
    HAVE_SENTENCE_TRANSFORMERS = True
except ImportError:
    HAVE_SENTENCE_TRANSFORMERS = False
    SentenceTransformer = None
    util = None

try:
    import imagehash
    from PIL import Image
    HAVE_IMAGEHASH = True
except ImportError:
    HAVE_IMAGEHASH = False
    imagehash = None
    Image = None

app = FastAPI(
    title="Atmos Advanced AI Engine",
    description="Multimodal Big Data verification microservice for MausamNet / Atmos",
    version="1.0.0"
)

# Enable CORS for browser-based citizen reporting & dashboard
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load NLP model for semantic text deduplication
embedder = None
if HAVE_SENTENCE_TRANSFORMERS:
    try:
        print("[AI Engine] Initializing SentenceTransformer model ('all-MiniLM-L6-v2')...")
        embedder = SentenceTransformer("all-MiniLM-L6-v2")
        print("[AI Engine] SentenceTransformer model loaded successfully.")
    except Exception as e:
        print(f"[AI Engine] Warning: Could not initialize SentenceTransformer ({e}). Using n-gram fallback.")
        embedder = None

# In-memory caches for sliding-window deduplication
recent_texts: List[Dict[str, Any]] = []
recent_media_hashes: List[str] = []

class WeatherReport(BaseModel):
    id: str
    text: str
    media_url: Optional[str] = None
    lat: Optional[float] = None
    lon: Optional[float] = None
    category: Optional[str] = None

def compute_fallback_embedding(text: str) -> Dict[str, float]:
    """Lightweight character/word n-gram vector for offline or instant similarity."""
    tokens = re.findall(r"\w+", text.lower())
    freq = {}
    for t in tokens:
        freq[t] = freq.get(t, 0) + 1
    norm = math.sqrt(sum(v * v for v in freq.values())) or 1.0
    return {k: v / norm for k, v in freq.items()}

def cosine_similarity_fallback(v1: Dict[str, float], v2: Dict[str, float]) -> float:
    common = set(v1.keys()) & set(v2.keys())
    return sum(v1[k] * v2[k] for k in common)

async def check_ground_truth(lat: Optional[float], lon: Optional[float], category: str) -> float:
    """Cross-references claim with live Open-Meteo sensor data."""
    if lat is None or lon is None:
        return 0.5  # Neutral score if no GPS

    try:
        url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,precipitation,weather_code,wind_speed_10m"
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(url)
            data = resp.json().get("current", {})

        temp = float(data.get("temperature_2m", 25.0))
        precip = float(data.get("precipitation", 0.0))
        code = int(data.get("weather_code", 0))
        wind = float(data.get("wind_speed_10m", 10.0))

        # Meteorological physical logic checks
        if category == "Heatwave":
            if temp < 35.0:
                return 0.1
            if temp >= 40.0:
                return 0.95
            return 0.75

        if category in ["Rainfall", "Flooding"]:
            if precip > 10.0 or code in [63, 65, 81, 82]:
                return 0.95
            if precip > 0.0 or (code >= 51 and code <= 67):
                return 0.85
            if precip == 0.0 and code not in [80, 81, 82]:
                return 0.2
            return 0.7

        if category == "Thunderstorm":
            if code in [95, 96, 99]:
                return 0.98
            if wind > 35.0:
                return 0.85
            return 0.65

        if category in ["Dust Storm", "Strong Winds"]:
            if wind > 30.0:
                return 0.95
            if wind < 15.0:
                return 0.25
            return 0.70

        return 0.70  # Plausible physical report
    except Exception as e:
        print(f"[AI Engine] Ground truth check exception: {e}")
        return 0.50

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "Atmos Advanced AI Engine",
        "sentence_transformers_loaded": embedder is not None,
        "imagehash_available": HAVE_IMAGEHASH,
        "cached_texts_count": len(recent_texts),
        "cached_hashes_count": len(recent_media_hashes)
    }

@app.post("/verify")
async def verify_report(report: WeatherReport):
    # 1. TEXT DEDUPLICATION
    if embedder is not None and util is not None:
        current_emb = embedder.encode(report.text, convert_to_tensor=True)
        for past in recent_texts:
            if "embedding" in past and past["embedding"] is not None:
                sim = util.cos_sim(current_emb, past["embedding"]).item()
                if sim > 0.85:
                    return {
                        "status": "REJECTED_DUPLICATE",
                        "reason": f"Text already reported ({sim:.2f} semantic match)"
                    }
        stored_emb = current_emb
    else:
        # Fallback sparse embedding
        current_sparse = compute_fallback_embedding(report.text)
        for past in recent_texts:
            if "sparse" in past:
                sim = cosine_similarity_fallback(current_sparse, past["sparse"])
                if sim > 0.85:
                    return {
                        "status": "REJECTED_DUPLICATE",
                        "reason": f"Text already reported ({sim:.2f} similarity)"
                    }
        stored_emb = None

    # 2. MEDIA DEDUPLICATION (Perceptual Hashing for Images/Thumbnails)
    calculated_hash = None
    if report.media_url and report.media_url.startswith("http") and HAVE_IMAGEHASH:
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                img_data = await client.get(report.media_url)
            if img_data.status_code == 200:
                img = Image.open(io.BytesIO(img_data.content))
                phash = str(imagehash.phash(img))
                calculated_hash = phash

                if phash in recent_media_hashes:
                    return {
                        "status": "REJECTED_FAKE_MEDIA",
                        "reason": "Recycled media detected (identical perceptual hash)"
                    }
                recent_media_hashes.append(phash)
        except Exception as err:
            print(f"[AI Engine] Media hash processing notice: {err}")

    # Update Text Cache (sliding window of 500)
    recent_texts.append({
        "id": report.id,
        "embedding": stored_emb,
        "sparse": compute_fallback_embedding(report.text)
    })
    if len(recent_texts) > 500:
        recent_texts.pop(0)
    if len(recent_media_hashes) > 500:
        recent_media_hashes.pop(0)

    # 3. NLP CATEGORIZATION
    text_lower = report.text.lower()
    category = report.category or "Other"

    if any(w in text_lower for w in ["flood", "flooding", "submerged", "waterlogging", "inundated", "deluge", "jal-bharav"]):
        category = "Flooding"
    elif any(w in text_lower for w in ["thunder", "thunderstorm", "lightning", "bijli", "cloudburst"]):
        category = "Thunderstorm"
    elif any(w in text_lower for w in ["rain", "raining", "monsoon", "drizzle", "heavy downpour", "barsaat", "barish"]):
        category = "Rainfall"
    elif any(w in text_lower for w in ["heat", "heatwave", "loo", "blistering", "scorching", "tapish"]):
        category = "Heatwave"
    elif any(w in text_lower for w in ["dust", "dust storm", "sandstorm", "andhi", "aandhi"]):
        category = "Dust Storm"
    elif any(w in text_lower for w in ["wind", "strong winds", "gale", "cyclone", "gust"]):
        category = "Strong Winds"
    elif any(w in text_lower for w in ["fog", "smog", "dense fog", "mist", "kohra"]):
        category = "Fog"

    # 4. SENSOR CROSS-VALIDATION VIA OPEN-METEO
    sensor_score = await check_ground_truth(report.lat, report.lon, category)

    # 5. LINGUISTIC CREDIBILITY
    spam_markers = [
        "shocking video", "omg", "apocalypse", "end of the world",
        "must watch", "fake", "share before deleted", "prank", "miracle", "prophecy"
    ]
    is_suspicious = any(marker in text_lower for marker in spam_markers)

    final_credibility = (sensor_score * 0.7) + (0.1 if is_suspicious else 0.3)
    final_credibility = min(1.0, max(0.0, final_credibility))

    verification_status = "VERIFIED" if final_credibility >= 0.60 else "SUSPICIOUS"

    return {
        "id": report.id,
        "category": category,
        "verification_status": verification_status,
        "credibility_score": round(final_credibility, 2),
        "media_hash": calculated_hash,
        "sensor_score": round(sensor_score, 2),
        "is_suspicious_linguistic": is_suspicious
    }

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    print(f"[AI Engine] Starting Atmos Advanced AI Engine on port {port}...")
    uvicorn.run(app, host="0.0.0.0", port=port)

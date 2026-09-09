import io
import math
import os
import re
from typing import Optional, List, Dict, Any

from fastapi import FastAPI
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
    title="Atmos Weather AI Engine",
    description="Full Multi-Modal AI, NER Indian Geocoding & Verification Microservice for MausamNet / Atmos",
    version="2.0"
)

# Enable CORS for browser-based citizen reporting & local dev dashboard
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. Load NLP embedding model with fallback
embedder = None
if HAVE_SENTENCE_TRANSFORMERS:
    try:
        print("[AI Engine] Loading SentenceTransformer ('all-MiniLM-L6-v2')...")
        embedder = SentenceTransformer("all-MiniLM-L6-v2")
        print("[AI Engine] SentenceTransformer loaded successfully.")
    except Exception as e:
        print(f"[AI Engine] Notice: Could not load SentenceTransformer ({e}). Using n-gram similarity.")
        embedder = None

# 2. In-memory circular buffers for deduplication
recent_text_embeddings: List[Dict[str, Any]] = []  # [{ "id": str, "embedding": Tensor/Dict }]
recent_media_hashes: List[str] = []     # [str]

# 3. Comprehensive Indian City Coordinates for NER Geocoding
INDIAN_CITIES = {
    "mumbai": (19.0760, 72.8777, "Maharashtra"),
    "delhi": (28.7041, 77.1025, "Delhi"),
    "bengaluru": (12.9716, 77.5946, "Karnataka"),
    "bangalore": (12.9716, 77.5946, "Karnataka"),
    "hyderabad": (17.3850, 78.4867, "Telangana"),
    "chennai": (13.0827, 80.2707, "Tamil Nadu"),
    "kolkata": (22.5726, 88.3639, "West Bengal"),
    "pune": (18.5204, 73.8567, "Maharashtra"),
    "ahmedabad": (23.0225, 72.5714, "Gujarat"),
    "jaipur": (26.9124, 75.7873, "Rajasthan"),
    "lucknow": (26.8467, 80.9462, "Uttar Pradesh"),
    "patna": (25.6093, 85.1376, "Bihar"),
    "bhopal": (23.2599, 77.4126, "Madhya Pradesh"),
    "raipur": (21.2514, 81.6296, "Chhattisgarh"),
    "bhubaneswar": (20.2961, 85.8245, "Odisha"),
    "guwahati": (26.1445, 91.7362, "Assam"),
    "chandigarh": (30.7333, 76.7794, "Punjab"),
    "shimla": (31.1048, 77.1734, "Himachal Pradesh"),
    "srinagar": (34.0837, 74.7973, "Jammu and Kashmir")
}

class IngestReport(BaseModel):
    id: str
    text: str
    media_url: Optional[str] = None
    lat: Optional[float] = None
    lon: Optional[float] = None
    city: Optional[str] = None
    state: Optional[str] = None
    category: Optional[str] = None

def compute_sparse_vector(text: str) -> Dict[str, float]:
    tokens = re.findall(r"\w+", text.lower())
    freq = {}
    for t in tokens:
        freq[t] = freq.get(t, 0) + 1
    norm = math.sqrt(sum(v * v for v in freq.values())) or 1.0
    return {k: v / norm for k, v in freq.items()}

def compute_sparse_similarity(v1: Dict[str, float], v2: Dict[str, float]) -> float:
    common = set(v1.keys()) & set(v2.keys())
    return sum(v1[k] * v2[k] for k in common)

async def query_open_meteo_sensor(lat: float, lon: float):
    """Queries Open-Meteo's free public endpoint for ground-truth conditions."""
    url = (
        f"https://api.open-meteo.com/v1/forecast?"
        f"latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,"
        f"precipitation,weather_code,wind_speed_10m"
    )
    try:
        async with httpx.AsyncClient(timeout=6.0) as client:
            resp = await client.get(url)
            if resp.status_code == 200:
                return resp.json().get("current", {})
    except Exception as err:
        print(f"[AI Engine] Sensor query notice ({lat}, {lon}): {err}")
    return None

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "Atmos Weather AI Engine v2.0",
        "sentence_transformers_loaded": embedder is not None,
        "imagehash_available": HAVE_IMAGEHASH,
        "cached_embeddings_count": len(recent_text_embeddings),
        "cached_hashes_count": len(recent_media_hashes)
    }

@app.post("/verify")
async def verify_report(report: IngestReport):
    text_lower = report.text.lower()

    # ----------------------------------------------------
    # A. SEMANTIC TEXT DEDUPLICATION
    # ----------------------------------------------------
    if embedder is not None and util is not None:
        current_emb = embedder.encode(report.text, convert_to_tensor=True)
        for past in recent_text_embeddings:
            if "embedding" in past and past["embedding"] is not None:
                sim = util.cos_sim(current_emb, past["embedding"]).item()
                if sim > 0.82:  # Semantic similarity threshold
                    return {
                        "status": "REJECTED_DUPLICATE",
                        "reason": f"Semantic duplicate of prior report {past['id']} (sim: {sim:.2f})"
                    }
        stored_emb = current_emb
        sparse_vec = None
    else:
        current_sparse = compute_sparse_vector(report.text)
        for past in recent_text_embeddings:
            if "sparse" in past and past["sparse"] is not None:
                sim = compute_sparse_similarity(current_sparse, past["sparse"])
                if sim > 0.82:
                    return {
                        "status": "REJECTED_DUPLICATE",
                        "reason": f"Semantic duplicate of prior report {past['id']} (sim: {sim:.2f})"
                    }
        stored_emb = None
        sparse_vec = current_sparse

    # ----------------------------------------------------
    # B. PERCEPTUAL MEDIA HASH DEDUPLICATION
    # ----------------------------------------------------
    media_phash = None
    if report.media_url and report.media_url.startswith("http") and HAVE_IMAGEHASH:
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                res = await client.get(report.media_url)
            if res.status_code == 200:
                img = Image.open(io.BytesIO(res.content))
                media_phash = str(imagehash.phash(img))
                if media_phash in recent_media_hashes:
                    return {
                        "status": "REJECTED_DUPLICATE_MEDIA",
                        "reason": "Recycled or previously verified image/video hash detected"
                    }
                recent_media_hashes.append(media_phash)
        except Exception:
            pass  # Non-fatal if media download fails

    # Save to sliding window cache
    recent_text_embeddings.append({
        "id": report.id,
        "embedding": stored_emb,
        "sparse": sparse_vec
    })
    if len(recent_text_embeddings) > 500:
        recent_text_embeddings.pop(0)
    if len(recent_media_hashes) > 500:
        recent_media_hashes.pop(0)

    # ----------------------------------------------------
    # C. LOCATION NER & GEOCODING
    # ----------------------------------------------------
    resolved_lat = report.lat
    resolved_lon = report.lon
    resolved_city = report.city
    resolved_state = report.state

    if not resolved_lat or not resolved_lon:
        for city_name, (c_lat, c_lon, c_state) in INDIAN_CITIES.items():
            if re.search(r'\b' + re.escape(city_name) + r'\b', text_lower):
                resolved_lat, resolved_lon = c_lat, c_lon
                resolved_city = city_name.capitalize()
                resolved_state = c_state
                break

    # Fallback to India central centroid if location remains unidentifiable
    if not resolved_lat or not resolved_lon:
        resolved_lat, resolved_lon = 20.5937, 78.9629
        resolved_city = "India (General)"
        resolved_state = "National"

    # ----------------------------------------------------
    # D. 7 MANDATORY HACKATHON WEATHER CATEGORIES
    # ----------------------------------------------------
    category = report.category or "Other"
    if any(k in text_lower for k in ["flood", "submerged", "waterlog", "drowning", "overflowing"]):
        category = "Flooding"
    elif any(k in text_lower for k in ["rain", "monsoon", "downpour", "drizzle", "heavy shower", "cloudburst"]):
        category = "Rainfall"
    elif any(k in text_lower for k in ["thunder", "lightning", "bijli", "storm alert"]):
        category = "Thunderstorm"
    elif any(k in text_lower for k in ["heatwave", "loo", "scorching", "extreme heat", "45°", "46°", "47°", "48°"]):
        category = "Heatwave"
    elif any(k in text_lower for k in ["fog", "smog", "visibility", "dense fog", "mist"]):
        category = "Fog"
    elif any(k in text_lower for k in ["dust storm", "andhi", "sandstorm", "haze"]):
        category = "Dust Storm"
    elif any(k in text_lower for k in ["wind", "cyclone", "gust", "stormy wind", "gale"]):
        category = "Strong Winds"

    # ----------------------------------------------------
    # E. CROSS-VALIDATION WITH OPEN-METEO SENSORS
    # ----------------------------------------------------
    sensor_consistency_score = 0.5  # Neutral default
    weather_sensor_data = None

    if resolved_lat and resolved_lon and resolved_lat != 20.5937:
        try:
            weather_sensor_data = await query_open_meteo_sensor(resolved_lat, resolved_lon)
            if weather_sensor_data:
                temp = weather_sensor_data.get("temperature_2m", 25.0)
                precip = weather_sensor_data.get("precipitation", 0.0)
                wind = weather_sensor_data.get("wind_speed_10m", 0.0)

                if category == "Heatwave":
                    sensor_consistency_score = 0.95 if temp >= 38.0 else (0.2 if temp < 30.0 else 0.5)
                elif category in ["Rainfall", "Flooding"]:
                    sensor_consistency_score = 0.95 if precip > 0.5 else (0.25 if precip == 0.0 else 0.6)
                elif category == "Strong Winds":
                    sensor_consistency_score = 0.95 if wind > 35.0 else (0.3 if wind < 15.0 else 0.6)
                else:
                    sensor_consistency_score = 0.8
        except Exception:
            sensor_consistency_score = 0.5

    # ----------------------------------------------------
    # F. SENSATIONALISM & TRUST SCORING
    # ----------------------------------------------------
    clickbait_cues = ["apocalypse", "run for your life", "shocking video", "omg", "breaking!", "destroy everything"]
    has_clickbait = any(cue in text_lower for cue in clickbait_cues)

    credibility = (sensor_consistency_score * 0.7) + (0.05 if has_clickbait else 0.3)
    credibility = min(max(round(credibility, 2), 0.0), 1.0)

    if credibility >= 0.65:
        verification_status = "VERIFIED"
    elif credibility >= 0.40:
        verification_status = "SUSPICIOUS"
    else:
        verification_status = "REJECTED"

    return {
        "id": report.id,
        "category": category,
        "city": resolved_city,
        "state": resolved_state,
        "latitude": resolved_lat,
        "longitude": resolved_lon,
        "verification_status": verification_status,
        "credibility_score": credibility,
        "media_hash": media_phash,
        "sensor_telemetry": weather_sensor_data
    }

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    print(f"[AI Engine] Starting Atmos Weather AI Engine v2.0 on port {port}...")
    uvicorn.run(app, host="0.0.0.0", port=port)

"""
ai_worker.py (Redis Streams Big Data Consumer Worker)

Continuous stream consumer worker for MausamNet / Atmos.
Pulls unverified weather reports asynchronously from the Redis Stream
('weather_stream') using XREAD, executes NLP categorization & credibility scoring,
resolves Indian city geolocations, and persists verified data directly to Supabase.
"""

import os
import json
import re
import sys
import time
from typing import Optional, Dict, Any

# Ensure unbuffered UTF-8 output on Windows consoles
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Force unbuffered prints
import functools
print = functools.partial(print, flush=True)

from dotenv import load_dotenv
load_dotenv()

import redis
from supabase import create_client, Client

# Supabase configuration with project defaults (Admin Service Role Key)
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://rblcrsboalpuhofaeqol.supabase.co")
SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJibGNyc2JvYWxwdWhvZmFlcW9sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODY4Mzc1NCwiZXhwIjoyMTA0MjU5NzU0fQ.iQno5XcIMnwCCpU6kOGt6zM3cN4PdalU_Y5fhKifSxM"
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY") or SUPABASE_SERVICE_ROLE_KEY

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Dynamically detect table schema columns to prevent PGRST204 schema mismatch errors
TABLE_COLUMNS = set()
try:
    _schema_check = supabase.table("weather_reports").select("*").limit(1).execute()
    if _schema_check.data and len(_schema_check.data) > 0:
        TABLE_COLUMNS = set(_schema_check.data[0].keys())
        print(f"[Supabase] Connected successfully. Active columns: {sorted(list(TABLE_COLUMNS))}")
    else:
        print("[Supabase] Connected successfully to 'weather_reports'.")
except Exception as _e:
    print(f"[Supabase] Notice on schema check: {_e}")

# Redis client configuration
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))
STREAM_NAME = "weather_stream"

r = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True)

# Optional SentenceTransformer NLP model
embedder = None
try:
    print("[AI Worker] Loading SentenceTransformer ('all-MiniLM-L6-v2')...")
    from sentence_transformers import SentenceTransformer
    embedder = SentenceTransformer("all-MiniLM-L6-v2")
    print("[AI Worker] SentenceTransformer loaded successfully.")
except Exception as e:
    print(f"[AI Worker] Notice: SentenceTransformer offline ({e}). Using rule-based NER & NLP parser.")
    embedder = None

# Comprehensive Indian City Coordinates for NER Geocoding
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

def resolve_location(text: str, lat: Optional[float], lon: Optional[float]):
    """Resolves coordinates and city/state from text if coordinates missing."""
    if lat is not None and lon is not None:
        return lat, lon, "Geo-Tagged", "India"

    lower = text.lower()
    for city_name, (c_lat, c_lon, c_state) in INDIAN_CITIES.items():
        if re.search(r'\b' + re.escape(city_name) + r'\b', lower):
            return c_lat, c_lon, city_name.capitalize(), c_state

    # Default centroid
    return 20.5937, 78.9629, "National", "India"

def process_single_report(report: Dict[str, Any]):
    text = report.get("text", "")
    text_lower = text.lower()
    report_id = report.get("id", f"msg_{int(time.time()*1000)}")

    # 1. AI Categorization
    category = "Other"
    if any(k in text_lower for k in ["flood", "submerged", "waterlog", "inundated", "deluge"]):
        category = "Flooding"
    elif any(k in text_lower for k in ["rain", "monsoon", "downpour", "drizzle", "shower"]):
        category = "Rainfall"
    elif any(k in text_lower for k in ["thunder", "lightning", "bijli"]):
        category = "Thunderstorm"
    elif any(k in text_lower for k in ["heat", "heatwave", "loo", "scorching"]):
        category = "Heatwave"
    elif any(k in text_lower for k in ["dust", "andhi", "sandstorm"]):
        category = "Dust Storm"
    elif any(k in text_lower for k in ["wind", "cyclone", "gale", "gust"]):
        category = "Strong Winds"
    elif any(k in text_lower for k in ["fog", "smog", "mist"]):
        category = "Fog"

    # 2. Credibility Check
    clickbait_cues = ["apocalypse", "run for your life", "shocking video", "omg", "breaking!", "destroy everything"]
    is_suspicious = any(cue in text_lower for cue in clickbait_cues)
    status = "SUSPICIOUS" if is_suspicious else "VERIFIED"
    score = 0.35 if is_suspicious else 0.85

    # 3. Location NER
    lat, lon, city, state = resolve_location(text, report.get("lat"), report.get("lon"))

    # 4. Save to Supabase
    all_possible_fields = {
        "city": city,
        "state": state,
        "event_type": category,
        "description": text[:1000],
        "latitude": lat,
        "longitude": lon,
        "status": status,
        "trust_score": int(score * 100),
        "media_url": report.get("media_url") or "",
        "area": city,
        # Extended schema fields
        "source_type": report.get("source", "social_media"),
        "original_text": text,
        "clean_text": text,
        "category": category,
        "verification_status": status,
        "credibility_score": score
    }

    # Dynamically match active columns in Supabase
    if TABLE_COLUMNS:
        insert_payload = {k: v for k, v in all_possible_fields.items() if k in TABLE_COLUMNS}
    else:
        insert_payload = {
            "city": city,
            "state": state,
            "event_type": category,
            "description": text[:1000],
            "latitude": lat,
            "longitude": lon,
            "status": status,
            "trust_score": int(score * 100),
            "media_url": report.get("media_url") or "",
            "area": city
        }

    try:
        supabase.table("weather_reports").insert(insert_payload).execute()
        print(f"[Supabase] [OK] Saved {report_id} as {status} [{category} in {city}, {state}] (Trust: {int(score*100)}%)")
    except Exception as e:
        err_msg = str(e)
        if "PGRST204" in err_msg or "column" in err_msg.lower():
            # Fallback for base columns
            fallback_payload = {
                "city": city,
                "state": state,
                "event_type": category,
                "description": text[:1000],
                "latitude": lat,
                "longitude": lon,
                "status": status,
                "trust_score": int(score * 100),
                "media_url": report.get("media_url") or ""
            }
            try:
                supabase.table("weather_reports").insert(fallback_payload).execute()
                print(f"[Supabase Fallback] [OK] Saved {report_id} as {status} [{category} in {city}]")
            except Exception as e2:
                print(f"[DB Error Fallback] {e2}")
        else:
            print(f"[DB Error] {e}")

def process_stream(run_once: bool = False):
    last_id = "0"  # Start reading from the beginning of the stream
    print(f"[AI Worker] Listening to Redis Stream '{STREAM_NAME}'...")

    processed_any = False
    consecutive_empty = 0

    while True:
        try:
            # XREAD: Pull from the message broker in blocks
            messages = r.xread({STREAM_NAME: last_id}, count=5, block=2000)

            if not messages:
                if run_once:
                    consecutive_empty += 1
                    if consecutive_empty >= 2:
                        print("[AI Worker] Stream queue drained in run-once mode.")
                        break
                continue

            consecutive_empty = 0
            for stream, msg_list in messages:
                for msg_id, msg_data in msg_list:
                    last_id = msg_id
                    processed_any = True
                    try:
                        raw = msg_data.get("report") or "{}"
                        report = json.loads(raw)
                        print(f"\n[AI Worker] Dequeued stream message {msg_id} -> report: {report.get('id')}")
                        process_single_report(report)
                    except Exception as parse_err:
                        print(f"[AI Worker] JSON parse error on {msg_id}: {parse_err}")

            if run_once and processed_any:
                print("[AI Worker] Completed batch from stream.")
                break

        except redis.exceptions.ConnectionError:
            print("[AI Worker] Waiting for Redis server on port 6379...")
            time.sleep(3)
        except KeyboardInterrupt:
            print("\n[AI Worker] Terminated by user.")
            break

if __name__ == "__main__":
    is_once = "--once" in sys.argv
    process_stream(run_once=is_once)

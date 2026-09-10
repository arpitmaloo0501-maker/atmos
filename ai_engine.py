import os
import sys
import json
import httpx
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import redis
from dotenv import load_dotenv

# Ensure safe UTF-8 output on Windows consoles
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

r = redis.Redis(host=os.getenv("REDIS_HOST", "localhost"), port=int(os.getenv("REDIS_PORT", 6379)), decode_responses=True)

async def fetch_real_weather(lat, lon):
    """Fetches live ground-truth sensor data from Open-Meteo."""
    if not lat or not lon:
        return "NO_GPS"
        
    try:
        async with httpx.AsyncClient() as client:
            url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=precipitation,temperature_2m"
            resp = await client.get(url, timeout=3.0)
            if resp.status_code == 200:
                return resp.json().get("current", {})
    except Exception as e:
        print(f"[Sensor API Error] {e}")
        
    return "API_ERROR"

@app.post("/verify")
async def verify_report(request: Request):
    payload = await request.json()
    
    raw_text = payload.get("text", "").lower()
    category = payload.get("category", "General")
    lat = payload.get("lat")
    lon = payload.get("lon")
    
    # ---------------------------------------------------------
    # IRONCLAD TRUST SCORE ALGORITHM
    # ---------------------------------------------------------
    trust_score = 100
    
    # 1. LIVE SENSOR CROSS-VALIDATION
    weather_data = await fetch_real_weather(lat, lon)
    
    if weather_data == "NO_GPS":
        trust_score -= 50
        print("[PENALTY] No GPS coordinates provided (-50 pts).")
    elif weather_data == "API_ERROR":
        trust_score -= 30
        print("[PENALTY] Sensor API unreachable (-30 pts).")
    else:
        # We have real weather data! Let's check it.
        precip = weather_data.get("precipitation", 0.0)
        temp = weather_data.get("temperature_2m", 25.0)

        if category in ["Flooding", "Rainfall"] and precip < 1.0:
            trust_score -= 75  
            print(f"[FAKE DETECTED] Claimed Flood/Rain, but sensor shows {precip}mm rain (-75 pts).")
        elif category == "Heatwave" and temp < 35.0:
            trust_score -= 75  
            print(f"[FAKE DETECTED] Claimed Heatwave, but sensor shows {temp}C (-75 pts).")

    # 2. LINGUISTIC HEURISTICS (Penalize clickbait)
    clickbait_words = ["omg", "shocking", "apocalypse", "deadly", "crazy"]
    if any(word in raw_text for word in clickbait_words):
        trust_score -= 20
        
    # 3. MEDIA EVIDENCE BONUS
    if payload.get("media_url"):
        trust_score += 10
        
    # Apply strict boundaries (0 to 100)
    payload["trust_score"] = max(0, min(100, trust_score))
    
    # Determine Status
    if payload["trust_score"] >= 80:
        payload["verification_status"] = "VERIFIED"
    elif payload["trust_score"] >= 40:
        payload["verification_status"] = "SUSPICIOUS"
    else:
        payload["verification_status"] = "REJECTED"

    # Push to Redis Stream
    try:
        r.xadd("weather_stream", {"report": json.dumps(payload)})
    except Exception as e:
        print(f"Redis Error: {e}")

    return {
        "status": "success", 
        "trust_score": payload["trust_score"], 
        "verification_status": payload["verification_status"]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

import os
import sys
import json
import httpx
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import redis
from dotenv import load_dotenv

# Ensure safe UTF-8 console output on Windows to support emojis without crashes
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
            # Added wind_speed to detect fake cyclone reports
            url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=precipitation,temperature_2m,wind_speed_10m"
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
    # SCIENTIFIC TRUST SCORE ALGORITHM
    # ---------------------------------------------------------
    # Base score: Social media is inherently untrusted
    trust_score = 80
    
    weather_data = await fetch_real_weather(lat, lon)
    
    if weather_data == "NO_GPS":
        trust_score -= 50
        print("⚠️ PENALTY: No GPS coordinates provided (-50 pts).")
    elif weather_data == "API_ERROR":
        trust_score -= 20
        print("⚠️ PENALTY: Sensor API unreachable (-20 pts).")
    else:
        precip = weather_data.get("precipitation", 0.0)
        temp = weather_data.get("temperature_2m", 25.0)
        wind = weather_data.get("wind_speed_10m", 0.0)

        # STRICT SCIENTIFIC THRESHOLDS
        if category == "Flooding" and precip < 15.0:
            trust_score -= 65  
            print(f"🛑 FAKE DETECTED: Flood claimed, but sensor shows only {precip}mm rain. Need >15mm (-65 pts).")
        elif category == "Rainfall" and precip < 2.0:
            trust_score -= 50  
            print(f"🛑 FAKE DETECTED: Heavy Rain claimed, but sensor shows only {precip}mm (-50 pts).")
        elif category == "Heatwave" and temp < 35.0:
            trust_score -= 65  
            print(f"🛑 FAKE DETECTED: Heatwave claimed, but temp is {temp}°C (-65 pts).")
        elif category == "Cyclone" and wind < 50.0:
            trust_score -= 65
            print(f"🛑 FAKE DETECTED: Cyclone claimed, but wind is only {wind}km/h (-65 pts).")

    # 2. LINGUISTIC HEURISTICS (Penalize clickbait)
    clickbait_words = ["omg", "shocking", "apocalypse", "deadly", "crazy", "unbelievable"]
    if any(word in raw_text for word in clickbait_words):
        trust_score -= 20
        print("⚠️ PENALTY: Sensationalist clickbait vocabulary detected (-20 pts).")
        
    # 3. MEDIA EVIDENCE BONUS
    if payload.get("media_url"):
        trust_score += 15
        print("✅ BONUS: Media evidence provided (+15 pts).")
        
    # Apply strict boundaries (0 to 100)
    payload["trust_score"] = max(0, min(100, trust_score))
    
    # Determine Status
    if payload["trust_score"] >= 75:
        payload["verification_status"] = "VERIFIED"
    elif payload["trust_score"] >= 40:
        payload["verification_status"] = "SUSPICIOUS"
    else:
        payload["verification_status"] = "REJECTED"

    print(f"🧠 FINAL AI VERIFICATION: {payload['trust_score']}% -> {payload['verification_status']}")

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

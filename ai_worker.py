import os
import json
import time
import sys
import redis
import requests
from dotenv import load_dotenv
from supabase import create_client, Client
from twilio.rest import Client as TwilioClient

load_dotenv()

# Supabase & Redis Init
supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")
)
r = redis.Redis(host=os.getenv("REDIS_HOST", "localhost"), port=int(os.getenv("REDIS_PORT", 6379)), decode_responses=True)
STREAM_NAME = os.getenv("REDIS_STREAM_NAME") or os.getenv("STREAM_NAME", "weather_stream")

# Alert Endpoints
WEBHOOK_URL = os.getenv("DISCORD_WEBHOOK_URL")
TWILIO_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_FROM = os.getenv("TWILIO_PHONE_NUMBER")
AUTHORITY_PHONE = os.getenv("AUTHORITY_PHONE_NUMBER")

twilio_client = None
if TWILIO_SID and TWILIO_TOKEN and not TWILIO_SID.startswith("your_"):
    try:
        twilio_client = TwilioClient(TWILIO_SID, TWILIO_TOKEN)
        print("[Twilio] Initialized SMS Alerting client successfully.")
    except Exception as e:
        print(f"[Twilio Init Warning] {e}")

BATCH_SIZE = 50
FLUSH_INTERVAL_SECONDS = 5.0

# Dynamically discover active Supabase table columns for zero-configuration schema resilience
TABLE_COLUMNS = set()
try:
    _schema_check = supabase.table("weather_reports").select("*").limit(1).execute()
    if _schema_check.data and len(_schema_check.data) > 0:
        TABLE_COLUMNS = set(_schema_check.data[0].keys())
        print(f"[Supabase] Connected to table 'weather_reports'. Columns: {sorted(list(TABLE_COLUMNS))}")
    else:
        print("[Supabase] Connected to table 'weather_reports'.")
except Exception as _e:
    print(f"[Supabase Schema Check] {_e}")

def format_row_for_supabase(row: dict) -> dict:
    """Adapts row fields to the database columns (supports both legacy and new schemas)."""
    if not TABLE_COLUMNS:
        return row

    field_mappings = {
        "source_type": "source_type",
        "original_text": "original_text" if "original_text" in TABLE_COLUMNS else "description",
        "category": "category" if "category" in TABLE_COLUMNS else "event_type",
        "verification_status": "verification_status" if "verification_status" in TABLE_COLUMNS else "status",
        "credibility_score": "credibility_score" if "credibility_score" in TABLE_COLUMNS else "trust_score",
        "city": "city",
        "state": "state",
        "latitude": "latitude",
        "longitude": "longitude",
        "media_url": "media_url",
        "created_at": "created_at",
        "area": "area"
    }

    adapted = {}
    for key, val in row.items():
        col = field_mappings.get(key, key)
        if col in TABLE_COLUMNS:
            if col == "trust_score" and isinstance(val, float) and val <= 1.0:
                adapted[col] = int(val * 100)
            else:
                adapted[col] = val

    if "area" in TABLE_COLUMNS and "area" not in adapted:
        adapted["area"] = row.get("city", "General Station")

    return adapted

def dispatch_emergency_alerts(report):
    """Sends Webhook and SMS alerts for critical weather threats."""
    city = report.get("city", "India Region")
    category = report.get("category", "Severe Weather")
    severity = report.get("severity", "CRITICAL")
    
    alert_msg = f"🚨 [ATMOS DISASTER ALERT] {severity}: Verified {category} detected in {city}! Immediate civil attention advised."

    # 1. Webhook Notification
    if WEBHOOK_URL and not WEBHOOK_URL.startswith("https://discord.com/api/webhooks/your"):
        try:
            requests.post(WEBHOOK_URL, json={"content": alert_msg}, timeout=4.0)
        except Exception as e:
            print(f"[Alert Webhook Failed]: {e}")

    # 2. Twilio SMS Notification
    if twilio_client and AUTHORITY_PHONE and TWILIO_FROM and not TWILIO_FROM.startswith("+123456"):
        try:
            twilio_client.messages.create(
                body=alert_msg,
                from_=TWILIO_FROM,
                to=AUTHORITY_PHONE
            )
            print(f"[SMS Dispatched] Sent critical alert to {AUTHORITY_PHONE}")
        except Exception as e:
            print(f"[Twilio SMS Failed]: {e}")
    elif AUTHORITY_PHONE:
        print(f"[Alert System] SMS alert triggered for {city} (Twilio credentials pending in .env)")

def determine_severity(category, text):
    """Calculates danger rating based on verified physical metrics."""
    danger_cues = ["submerged", "cloudburst", "evacuate", "collapsed", "fatal", "47°", "48°", "cyclone"]
    if any(k in text.lower() for k in danger_cues) or category in ["Flooding", "Thunderstorm", "Dust Storm"]:
        return "CRITICAL"
    return "MODERATE"

def process_stream():
    last_id = os.getenv("REDIS_STREAM_LAST_ID", "$")  # Default: Read only new incoming messages
    buffer = []
    last_flush_time = time.time()
    
    print(f"[AI Stream Worker] Listening to stream: {STREAM_NAME} (Batch size: {BATCH_SIZE})")

    while True:
        try:
            entries = r.xread({STREAM_NAME: last_id}, count=BATCH_SIZE, block=1000)
            
            if entries:
                for stream_name, messages in entries:
                    for msg_id, data in messages:
                        last_id = msg_id
                        payload = json.loads(data['report'])
                        
                        raw_text = payload.get("text", "")
                        category = payload.get("category", "Rainfall")
                        status = payload.get("verification_status", "VERIFIED")
                        severity = determine_severity(category, raw_text)
                        
                        processed_row = {
                            "source_type": payload.get("source", "stream_feed"),
                            "original_text": raw_text,
                            "media_url": payload.get("media_url"),
                            "category": category,
                            "city": payload.get("city", "General Station"),
                            "state": payload.get("state", "National"),
                            "latitude": payload.get("lat", 20.5937),
                            "longitude": payload.get("lon", 78.9629),
                            "verification_status": status,
                            "credibility_score": payload.get("credibility_score", 0.85),
                            "created_at": payload.get("created_at") or time.strftime('%Y-%m-%dT%H:%M:%SZ')
                        }
                        
                        buffer.append(processed_row)

                        if status == "VERIFIED" and severity == "CRITICAL":
                            processed_row["severity"] = severity
                            dispatch_emergency_alerts(processed_row)

            # Flush buffer when threshold reached or time interval elapsed
            time_since_flush = time.time() - last_flush_time
            if (len(buffer) >= BATCH_SIZE) or (buffer and time_since_flush >= FLUSH_INTERVAL_SECONDS):
                print(f"[DB Batch] Inserting {len(buffer)} records into Supabase...")
                insert_batch = [format_row_for_supabase(item) for item in buffer]
                supabase.table("weather_reports").insert(insert_batch).execute()
                buffer.clear()
                last_flush_time = time.time()

        except Exception as err:
            print(f"[Stream Worker Error] {err}")
            time.sleep(2)

if __name__ == "__main__":
    process_stream()

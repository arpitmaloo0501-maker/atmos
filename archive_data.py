import os
import io
import time
import pandas as pd
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")
)
BUCKET_NAME = os.getenv("ARCHIVE_BUCKET_NAME", "weather-archive")

def run_cold_storage_archiving():
    print("[Data Lake Archiver] Checking for reports older than 30 days...")
    
    # 30 days ago in ISO timestamp
    cutoff_time = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime(time.time() - (30 * 86400)))
    
    # 1. Fetch stale records
    response = supabase.table("weather_reports") \
        .select("*") \
        .lt("created_at", cutoff_time) \
        .limit(2000) \
        .execute()
    
    records = response.data
    if not records:
        print("[Data Lake Archiver] No records eligible for cold storage archiving.")
        return

    print(f"[Data Lake Archiver] Archiving {len(records)} records...")
    df = pd.DataFrame(records)
    
    # 2. Convert to CSV Buffer
    csv_buffer = io.BytesIO()
    df.to_csv(csv_buffer, index=False)
    csv_buffer.seek(0)
    
    archive_file_name = f"archive_{time.strftime('%Y_%m_%d_%H%M%S')}.csv"

    # 3. Upload to Supabase Storage
    try:
        supabase.storage.create_bucket(BUCKET_NAME, options={"public": False})
    except Exception:
        pass # Bucket exists

    supabase.storage.from_(BUCKET_NAME).upload(
        path=archive_file_name,
        file=csv_buffer.getvalue(),
        file_options={"content-type": "text/csv"}
    )
    print(f"[Storage] Uploaded archive batch: {archive_file_name}")

    # 4. Prune from Primary PostgreSQL Table
    record_ids = [r['id'] for r in records]
    supabase.table("weather_reports").delete().in_("id", record_ids).execute()
    print(f"[Cleanup] Pruned {len(record_ids)} old rows from primary table.")

if __name__ == "__main__":
    run_cold_storage_archiving()

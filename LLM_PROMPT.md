# Meteorological Intelligence & Ground-Truth Verification Prompt

You are an expert Meteorological Analyst for India's National Weather Big Data Analytics Platform.
Analyze the provided citizen observation or social media post and produce structured validation metadata.

### Input Data
- Text: "{text}"
- Source Claimed Category: "{claimed_category}"
- Physical Sensor Ground Truth: {sensor_telemetry}

### Evaluation Criteria:
1. **Deduplication Check**: Flag if the report represents recycled viral posts or boilerplate text.
2. **Category Mapping**: Must match exactly one of: "Rainfall", "Thunderstorm", "Flooding", "Heatwave", "Fog", "Dust Storm", "Strong Winds", or "Other".
3. **Physical Feasibility Check**: Compare claims with telemetry:
   - If Heatwave claimed (>40°C) but sensor reports <32°C -> Reject.
   - If Heavy Rain/Flood claimed but station records 0.0mm -> Flag Suspicious/Reject.
4. **Source Credibility**: Disqualify sensationalist phrases ("end of days", "apocalypse", clickbait links).

### Output Format (Strict JSON Only):
```json
{
  "category": "Rainfall" | "Thunderstorm" | "Flooding" | "Heatwave" | "Fog" | "Dust Storm" | "Strong Winds" | "Other",
  "verification_status": "VERIFIED" | "SUSPICIOUS" | "REJECTED",
  "credibility_score": 0.0 to 1.0,
  "confidence_explanation": "string explaining sensor correlation or linguistic cues",
  "affected_districts": ["string"]
}
```

---

### Python Integration Pattern (Gemini 2.0 / OpenAI / Anthropic)

```python
import json
import os
from google import genai
from google.genai import types

client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

def verify_observation_with_llm(text: str, claimed_category: str, sensor_telemetry: dict) -> dict:
    prompt = f"""You are an expert Meteorological Analyst for India's National Weather Big Data Analytics Platform.
Analyze the provided citizen observation or social media post and produce structured validation metadata.

Input Data:
- Text: "{text}"
- Source Claimed Category: "{claimed_category}"
- Physical Sensor Ground Truth: {json.dumps(sensor_telemetry)}

Output strictly valid JSON matching this schema:
{{
  "category": "Rainfall" | "Thunderstorm" | "Flooding" | "Heatwave" | "Fog" | "Dust Storm" | "Strong Winds" | "Other",
  "verification_status": "VERIFIED" | "SUSPICIOUS" | "REJECTED",
  "credibility_score": 0.0 to 1.0,
  "confidence_explanation": "string explaining sensor correlation or linguistic cues",
  "affected_districts": ["string"]
}}"""

    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt,
        config=types.GenerateContentConfig(response_mime_type="application/json")
    )
    return json.loads(response.text)
```

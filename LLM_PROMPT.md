# LLM Meteorological Architect Prompt

This document defines the production system prompt, output schema, and integration patterns for replacing or augmenting the local NLP logic with a generative LLM (such as Google Gemini 1.5/2.0 or Claude) for advanced meteorological parsing in the Atmos / MausamNet platform.

---

## 1. System Prompt Template

```text
You are an expert meteorological intelligence analyst for the Atmos Big Data Platform.
Analyze the following citizen weather report: "{text}"

Rules:
1. Categorize into exactly one: "Rainfall", "Thunderstorm", "Flooding", "Heatwave", "Fog", "Dust Storm", "Strong Winds", or "Other".
2. Assess linguistic credibility. Flag extreme exaggeration, panic-mongering, or sarcasm.
3. Assign verification_status: "VERIFIED", "SUSPICIOUS", or "REJECTED".
4. Output strictly valid JSON matching this schema:
{"category": "string", "verification_status": "string", "credibility_score": "float", "extracted_locations": ["string"]}
```

---

## 2. JSON Schema Specification

| Field | Type | Description | Allowed Values |
| :--- | :--- | :--- | :--- |
| `category` | `string` | Primary meteorological hazard event type | `"Rainfall"`, `"Thunderstorm"`, `"Flooding"`, `"Heatwave"`, `"Fog"`, `"Dust Storm"`, `"Strong Winds"`, `"Other"` |
| `verification_status` | `string` | Intelligence trustworthiness classification | `"VERIFIED"` (plausible, factual report)<br/>`"SUSPICIOUS"` (exaggerated or sensational)<br/>`"REJECTED"` (spam, hoax, or irrelevant) |
| `credibility_score` | `float` | Continuous confidence rating | `0.0` to `1.0` |
| `extracted_locations` | `array[string]` | Specific cities, neighborhoods, landmarks, or districts mentioned | e.g. `["Raipur", "Telibandha Lake"]`, `["Mumbai", "Andheri Subway"]` |

---

## 3. Python Integration Example (Google Gemini SDK)

```python
import json
import os
from google import genai
from google.genai import types

client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

def analyze_weather_report_llm(text: str) -> dict:
    prompt = f"""You are an expert meteorological intelligence analyst for the Atmos Big Data Platform.
Analyze the following citizen weather report: "{text}"

Rules:
1. Categorize into exactly one: "Rainfall", "Thunderstorm", "Flooding", "Heatwave", "Fog", "Dust Storm", "Strong Winds", or "Other".
2. Assess linguistic credibility. Flag extreme exaggeration, panic-mongering, or sarcasm.
3. Assign verification_status: "VERIFIED", "SUSPICIOUS", or "REJECTED".
4. Output strictly valid JSON matching this schema:
{{"category": "string", "verification_status": "string", "credibility_score": "float", "extracted_locations": ["string"]}}"""

    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json"
        )
    )
    
    return json.loads(response.text)
```

---

## 4. Node.js Integration Example (Axios / Fetch)

```javascript
async function queryGeminiMeteorologist(reportText, apiKey) {
  const prompt = `You are an expert meteorological intelligence analyst for the Atmos Big Data Platform.
Analyze the following citizen weather report: "${reportText}"

Rules:
1. Categorize into exactly one: "Rainfall", "Thunderstorm", "Flooding", "Heatwave", "Fog", "Dust Storm", "Strong Winds", or "Other".
2. Assess linguistic credibility. Flag extreme exaggeration, panic-mongering, or sarcasm.
3. Assign verification_status: "VERIFIED", "SUSPICIOUS", or "REJECTED".
4. Output strictly valid JSON matching this schema:
{"category": "string", "verification_status": "string", "credibility_score": "float", "extracted_locations": ["string"]}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    }
  );

  const result = await response.json();
  const rawJson = result.candidates[0].content.parts[0].text;
  return JSON.parse(rawJson);
}
```

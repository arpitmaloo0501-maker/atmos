# MausamNet Severe Weather Alert Worker

A Node.js background worker service that listens in real-time for severe weather alerts, applies the spherical **Haversine formula** to locate registered citizens within a **50km radius** of the hazard coordinates, and broadcasts urgent emergency alerts via the **Twilio Node.js SDK**.

---

## 🌟 Architecture Overview

```
                          ┌───────────────────────────┐
                          │  Supabase weather_reports │
                          │  (Real-time / Polling)    │
                          └─────────────┬─────────────┘
                                        │ (New Severe Alert)
                                        ▼
                          ┌───────────────────────────┐
                          │      alertWorker.js       │
                          │  - Evaluates Severity     │
                          │  - Extracts Lat/Lon       │
                          └─────────────┬─────────────┘
                                        │
             ┌──────────────────────────┴──────────────────────────┐
             ▼                                                     ▼
┌──────────────────────────┐                         ┌──────────────────────────┐
│      geospatial.js       │                         │       mockUsers.js       │
│  Haversine Formula (50km)│◄────────────────────────┤  Citizen Location DB     │
│  d = 2R · atan2(√a, √(1-a))│                       │  (Raipur, Mumbai, NCR...)│
└────────────┬─────────────┘                         └──────────────────────────┘
             │ (Filtered Citizens <= 50km + distances)
             ▼
┌──────────────────────────┐
│     twilioService.js     │
│  Twilio Node.js SDK      │
│  client.messages.create  │
└────────────┬─────────────┘
             │
             ▼
  🚨 Emergency Broadcast SMS
  (Citizens within 50km)
```

---

## 📁 File Structure

| File | Description |
| :--- | :--- |
| [`alertWorker.js`](file:///c:/Users/arpit/Downloads/mausamnet_by_longcrown5329031/alertWorker.js) | Main background worker engine with Supabase Realtime subscription and 10s fallback polling. |
| [`geospatial.js`](file:///c:/Users/arpit/Downloads/mausamnet_by_longcrown5329031/geospatial.js) | Pure Haversine distance calculator and 50km proximity radius filter. |
| [`mockUsers.js`](file:///c:/Users/arpit/Downloads/mausamnet_by_longcrown5329031/mockUsers.js) | Mock citizen user registry across Indian metropolitan and regional districts. |
| [`twilioService.js`](file:///c:/Users/arpit/Downloads/mausamnet_by_longcrown5329031/twilioService.js) | Twilio Node.js SDK integration supporting both live delivery and simulated dispatches. |
| [`testWorker.js`](file:///c:/Users/arpit/Downloads/mausamnet_by_longcrown5329031/testWorker.js) | Automated 5-part test suite verifying Haversine math, 50km filtering, and SMS delivery. |
| [`.env.example`](file:///c:/Users/arpit/Downloads/mausamnet_by_longcrown5329031/.env.example) | Environment variables template for Twilio keys, phone numbers, and Supabase config. |

---

## 📐 Haversine Formula Implementation

The great-circle distance $d$ between alert $(\varphi_1, \lambda_1)$ and user $(\varphi_2, \lambda_2)$ is computed using the spherical mean Earth radius $R = 6,371.0\text{ km}$:

$$\Delta\varphi = \frac{\pi}{180}(\varphi_2 - \varphi_1), \quad \Delta\lambda = \frac{\pi}{180}(\lambda_2 - \lambda_1)$$

$$a = \sin^2\left(\frac{\Delta\varphi}{2}\right) + \cos(\varphi_1) \cdot \cos(\varphi_2) \cdot \sin^2\left(\frac{\Delta\lambda}{2}\right)$$

$$c = 2 \cdot \operatorname{atan2}(\sqrt{a}, \sqrt{1 - a})$$

$$d = R \cdot c$$

A user is selected if and only if $d \le 50.0\text{ km}$.

---

## 🚀 Running the Worker

### 1. Run Automated Test Suite
To verify Haversine accuracy, 50km boundaries, and Twilio SMS generation:
```bash
node testWorker.js
```
*(or using npm)*:
```bash
npm run test:worker
```

### 2. Start Background Worker Daemon
To start listening for real-time alerts from Supabase:
```bash
node alertWorker.js
```
*(or using npm)*:
```bash
npm run start:worker
```

---

## ⚙️ Twilio Configuration

To switch from simulated SMS to live SMS delivery via your Twilio account:
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Set your live Twilio credentials:
   ```env
   TWILIO_ACCOUNT_SID=ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   TWILIO_AUTH_TOKEN=your_auth_token_here
   TWILIO_PHONE_NUMBER=+1234567890
   TWILIO_SIMULATION_MODE=false
   ```
If credentials are not provided or set to `AC_MOCK_...`, the worker automatically runs in simulation mode using the standard Twilio SDK interface.

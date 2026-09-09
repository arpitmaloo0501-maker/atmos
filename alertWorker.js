/**
 * alertWorker.js
 * Node.js background worker for severe weather alerts.
 *
 * Responsibilities:
 * 1. Listens for new severe weather alerts in real-time via Supabase.
 * 2. Uses the Haversine formula (geospatial.js) to locate users within a 50km radius.
 * 3. Integrates the Twilio Node.js SDK (twilioService.js) to dispatch simulated emergency SMS alerts.
 */

require("dotenv").config();
const WebSocket = require("ws");
const { createClient } = require("@supabase/supabase-js");
const { haversineDistance, findUsersWithinRadius } = require("./geospatial");
const { MOCK_USERS } = require("./mockUsers");
const { sendEmergencyAlertSms, isSimulationMode } = require("./twilioService");

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL || "https://rblcrsboalpuhofaeqol.supabase.co";
const SUPABASE_KEY =
  process.env.SUPABASE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJibGNyc2JvYWxwdWhvZmFlcW9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2ODM3NTQsImV4cCI6MjEwNDI1OTc1NH0.dKh0sPbzAlKpPxP0KSVb3YSSVYhbEdPTA5gufHxmHqM";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  realtime: {
    transport: WebSocket
  }
});

// State tracking to prevent duplicate SMS dispatches
const processedAlertIds = new Set();
const ALERT_RADIUS_KM = 50; // 50km target radius

/**
 * Determines whether a weather report qualifies as severe.
 *
 * @param {Object} report - Weather report row
 * @returns {boolean} True if report represents a severe hazard
 */
function isSevereWeather(report) {
  if (!report) return false;

  const eventType = (report.event_type || "").toLowerCase();
  const desc = (report.description || "").toLowerCase();
  const status = (report.status || "").toLowerCase();

  // Explicit severe hazard keywords
  const severeKeywords = [
    "flood",
    "flooding",
    "heavy rain",
    "heatwave",
    "thunderstorm",
    "cyclone",
    "storm",
    "lightning",
    "cloudburst"
  ];

  const hasSevereType = severeKeywords.some((k) => eventType.includes(k) || desc.includes(k));
  const isVerifiedOrHighPriority = status === "verified" || status === "critical" || (report.trust_score && report.trust_score >= 80);

  return hasSevereType || isVerifiedOrHighPriority;
}

/**
 * Derives a human-readable severity rating for display.
 *
 * @param {Object} report
 * @returns {string} Severity level (CRITICAL, HIGH, MODERATE)
 */
function deriveSeverity(report) {
  const eventType = (report.event_type || "").toLowerCase();
  if (eventType.includes("flood") || eventType.includes("heatwave") || eventType.includes("cyclone")) {
    return "CRITICAL";
  }
  if (eventType.includes("thunder") || eventType.includes("heavy")) {
    return "HIGH";
  }
  return "MODERATE";
}

/**
 * Processes an incoming severe weather alert:
 * 1. Validates geographic coordinates.
 * 2. Runs Haversine geospatial proximity search against mock users (<= 50km).
 * 3. Dispatches Twilio emergency SMS to all targeted users.
 *
 * @param {Object} alert - Alert record
 * @returns {Promise<Object>} Summary of dispatch operations
 */
async function processSevereAlert(alert) {
  const alertId = alert.id || `SIM-${Date.now()}`;
  if (processedAlertIds.has(alertId)) {
    return { alertId, skipped: true, reason: "Already processed" };
  }
  processedAlertIds.add(alertId);

  const lat = parseFloat(alert.latitude);
  const lon = parseFloat(alert.longitude);

  if (isNaN(lat) || isNaN(lon)) {
    console.warn(`[Alert Worker] Alert #${alertId} missing valid lat/long coordinates. Skipping.`);
    return { alertId, skipped: true, reason: "Invalid coordinates" };
  }

  const severity = alert.severity || deriveSeverity(alert);
  const alertCity = alert.city || "Unknown";
  const alertState = alert.state || "India";
  const eventType = alert.event_type || "Severe Hazard";

  console.log("\n" + "=".repeat(76));
  console.log(`🚨 [ALERT INGESTED] #${alertId} - ${severity} ${eventType.toUpperCase()}`);
  console.log("=".repeat(76));
  console.log(`📍 Location: ${alertCity}${alert.area ? ` (${alert.area})` : ""}, ${alertState}`);
  console.log(`🌐 Coordinates: [Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}]`);
  console.log(`📝 Description: "${alert.description || "Field alert"}"`);
  console.log("-".repeat(76));

  // --- Step 1: Geospatial Proximity Calculation using Haversine ---
  console.log(`📐 Calculating Haversine distances against citizen database (Radius <= ${ALERT_RADIUS_KM} km)...`);
  const targetedUsers = findUsersWithinRadius(MOCK_USERS, lat, lon, ALERT_RADIUS_KM);

  console.log(`👥 Total mock users evaluated: ${MOCK_USERS.length}`);
  console.log(`🎯 Users identified within ${ALERT_RADIUS_KM}km radius: ${targetedUsers.length}`);

  if (targetedUsers.length === 0) {
    console.log(`ℹ️ No registered users found within ${ALERT_RADIUS_KM}km of coordinates.`);
    console.log("=".repeat(76) + "\n");
    return { alertId, targetedUsersCount: 0, dispatchedCount: 0 };
  }

  // --- Step 2: Twilio Emergency SMS Dispatch ---
  console.log("-".repeat(76));
  console.log(`📲 Dispatches via Twilio Node.js SDK (${isSimulationMode() ? "Simulated Mode" : "Live Delivery"}):`);

  const dispatchResults = [];

  for (let i = 0; i < targetedUsers.length; i++) {
    const user = targetedUsers[i];
    const result = await sendEmergencyAlertSms({
      user,
      alert: { ...alert, severity },
      distanceKm: user.distanceKm
    });

    dispatchResults.push(result);

    console.log(
      `   [${i + 1}/${targetedUsers.length}] ${user.name.padEnd(20)} | ` +
        `${user.area}, ${user.city} (~${user.distanceKm} km)\n` +
        `       Phone: ${user.phone} | Twilio SID: ${result.sid} | Status: ${result.status}`
    );
  }

  console.log("-".repeat(76));
  console.log(
    `✅ Successfully broadcast emergency SMS to ${dispatchResults.length} citizen(s) within ${ALERT_RADIUS_KM}km.`
  );
  console.log("=".repeat(76) + "\n");

  return {
    alertId,
    eventType,
    severity,
    location: `${alertCity}, ${alertState}`,
    coordinates: { latitude: lat, longitude: lon },
    radiusKm: ALERT_RADIUS_KM,
    targetedUsersCount: targetedUsers.length,
    dispatchResults
  };
}

/**
 * Polls Supabase for recent severe reports that have not been processed.
 */
async function pollRecentSevereAlerts() {
  try {
    const { data, error } = await supabase
      .from("weather_reports")
      .select("*")
      .order("id", { ascending: false })
      .limit(15);

    if (error) {
      console.error("[Alert Worker] Supabase poll error:", error.message);
      return;
    }

    if (data && data.length) {
      for (const report of data) {
        if (!processedAlertIds.has(report.id) && isSevereWeather(report)) {
          await processSevereAlert(report);
        }
      }
    }
  } catch (err) {
    console.error("[Alert Worker] Polling exception:", err.message);
  }
}

/**
 * Starts the Supabase Realtime subscription to receive instant alerts.
 */
function startRealtimeSubscription() {
  console.log("[Alert Worker] Connecting to Supabase Realtime channel 'severe-weather-alerts'...");

  const channel = supabase
    .channel("severe-weather-alerts-worker")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "weather_reports"
      },
      async (payload) => {
        const newReport = payload.new;
        console.log(`[Alert Worker] Real-time INSERT detected: #${newReport.id} (${newReport.event_type} in ${newReport.city})`);
        if (isSevereWeather(newReport)) {
          await processSevereAlert(newReport);
        }
      }
    )
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "weather_reports"
      },
      async (payload) => {
        const updated = payload.new;
        if (isSevereWeather(updated)) {
          await processSevereAlert(updated);
        }
      }
    )
    .subscribe((status) => {
      if (status === "SUBSCRIBED") {
        console.log("🟢 [Alert Worker] Real-time subscription ACTIVE. Listening for new severe weather alerts...");
      } else if (status === "CHANNEL_ERROR") {
        console.warn("⚠️ [Alert Worker] Realtime channel error. Fallback polling will maintain alert coverage.");
      }
    });

  return channel;
}

/**
 * Main worker initialization.
 */
async function startWorker() {
  console.log("\n" + "#".repeat(76));
  console.log("       MAUSAMNET SEVERE WEATHER ALERT - NODE.JS BACKGROUND WORKER       ");
  console.log("   Geospatial Haversine 50km Matching + Twilio Emergency SMS Engine     ");
  console.log("#".repeat(76));
  console.log(`* Earth Radius Model: 6,371.0 km (Haversine standard)`);
  console.log(`* Target Radius Threshold: ${ALERT_RADIUS_KM} km`);
  console.log(`* Mock Citizen Registry Size: ${MOCK_USERS.length} registered profiles`);
  console.log(`* Twilio Mode: ${isSimulationMode() ? "SIMULATION (Twilio Node.js SDK)" : "LIVE API"}`);
  console.log(`* Supabase URL: ${SUPABASE_URL}`);
  console.log("-".repeat(76));

  // Initial check of recent database alerts
  console.log("[Alert Worker] Performing initial check for recent severe alerts in Supabase...");
  await pollRecentSevereAlerts();

  // Start Realtime subscriber
  startRealtimeSubscription();

  // Continuous background polling interval (every 10 seconds)
  setInterval(pollRecentSevereAlerts, 10000);

  console.log("[Alert Worker] Background daemon running. Press Ctrl+C to terminate.\n");
}

// Support direct execution via CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.includes("--test")) {
    // Run automated simulated test
    const { runTestSuite } = require("./testWorker");
    runTestSuite();
  } else {
    startWorker();
  }
}

module.exports = {
  processSevereAlert,
  pollRecentSevereAlerts,
  isSevereWeather,
  startWorker
};

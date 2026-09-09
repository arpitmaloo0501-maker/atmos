/**
 * twilioService.js
 * Twilio Node.js SDK integration for emergency weather broadcast SMS.
 * Supports both production Twilio delivery and simulated emergency SMS dispatch.
 */

const crypto = require("crypto");
const twilio = require("twilio");

// Environment configurations
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhone = process.env.TWILIO_PHONE_NUMBER || "+18005550199";
const simulationMode =
  process.env.TWILIO_SIMULATION_MODE === "true" ||
  !accountSid ||
  accountSid.startsWith("AC_MOCK") ||
  !authToken;

let twilioClient;

if (!simulationMode) {
  try {
    twilioClient = twilio(accountSid, authToken);
    console.log("[Twilio Service] Initialized live Twilio client with Account SID:", accountSid.slice(0, 6) + "...");
  } catch (err) {
    console.warn("[Twilio Service] Failed to initialize live Twilio client, falling back to simulated mode:", err.message);
    twilioClient = createSimulatedClient();
  }
} else {
  console.log("[Twilio Service] Running in SIMULATION MODE. Emergency SMS will be modeled using the Twilio Node.js SDK interface.");
  twilioClient = createSimulatedClient();
}

/**
 * Creates a simulated Twilio client implementing the standard Twilio SDK messages API.
 */
function createSimulatedClient() {
  return {
    messages: {
      create: async function (options) {
        // Simulate network latency (50ms - 200ms)
        const delay = Math.floor(Math.random() * 150) + 50;
        await new Promise((resolve) => setTimeout(resolve, delay));

        // Generate standard Twilio 34-character Message SID
        const sid = "SM" + crypto.randomBytes(16).toString("hex");

        return {
          sid,
          dateCreated: new Date(),
          dateUpdated: new Date(),
          dateSent: new Date(),
          accountSid: accountSid || "AC_MOCK_MAUSAMNET_ACCOUNT_SID",
          to: options.to,
          from: options.from || fromPhone,
          body: options.body,
          status: "delivered",
          numSegments: "1",
          price: "0.0075",
          priceUnit: "USD",
          direction: "outbound-api",
          apiVersion: "2010-04-01",
          isSimulated: true
        };
      }
    }
  };
}

/**
 * Generates an urgent emergency weather alert SMS message body tailored to user location.
 *
 * @param {Object} params
 * @param {Object} params.user - User profile
 * @param {Object} params.alert - Severe alert payload
 * @param {number} params.distanceKm - Calculated distance from user to alert center
 * @returns {string} SMS message body text
 */
function formatEmergencySms({ user, alert, distanceKm }) {
  const eventName = (alert.event_type || "Severe Weather").toUpperCase();
  const locationDesc = `${alert.city || "Your Area"}${alert.area ? ` (${alert.area})` : ""}, ${alert.state || ""}`;
  const sev = (alert.severity || "CRITICAL").toUpperCase();

  let safetyGuideline = "Remain indoors, avoid waterlogged areas, and follow local disaster management instructions.";
  const evLower = eventName.toLowerCase();
  if (evLower.includes("flood")) {
    safetyGuideline = "Seek higher ground immediately. Do NOT drive or walk through flood waters. Disconnect electrical mains.";
  } else if (evLower.includes("heat")) {
    safetyGuideline = "Stay indoors in cool areas. Maintain frequent hydration. Check on vulnerable family members.";
  } else if (evLower.includes("thunder") || evLower.includes("wind") || evLower.includes("cyclone")) {
    safetyGuideline = "Secure loose outdoor items. Stay clear of trees, tin roofs, and power lines. Unplug electronics.";
  }

  // Multilingual greeting prefix
  let greeting = `Dear ${user.name},`;
  if (user.language === "hi") {
    greeting = `नमस्ते ${user.name},`;
  }

  return (
    `🚨 MAUSAMNET ${sev} ALERT: ${eventName}!\n` +
    `${greeting} A high-priority weather threat is detected ~${distanceKm} km from your location (${user.area}, ${user.city}).\n` +
    `Affected Zone: ${locationDesc}.\n` +
    `Safety Action: ${safetyGuideline}\n` +
    `National Emergency Helpline: 112 / 1070 | Live tracking: https://mausamnet.in/#alerts`
  );
}

/**
 * Dispatches an emergency SMS to a specific user using the Twilio SDK.
 *
 * @param {Object} params
 * @param {Object} params.user - User profile
 * @param {Object} params.alert - Alert object
 * @param {number} params.distanceKm - Distance in km
 * @returns {Promise<Object>} Dispatch result metadata
 */
async function sendEmergencyAlertSms({ user, alert, distanceKm }) {
  const messageBody = formatEmergencySms({ user, alert, distanceKm });

  try {
    // Calling the standard Twilio SDK client.messages.create
    const message = await twilioClient.messages.create({
      body: messageBody,
      from: fromPhone,
      to: user.phone
    });

    return {
      success: true,
      sid: message.sid,
      status: message.status,
      to: user.phone,
      userName: user.name,
      userArea: user.area,
      userCity: user.city,
      distanceKm,
      isSimulated: !!message.isSimulated,
      body: messageBody,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      to: user.phone,
      userName: user.name,
      distanceKm,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = {
  twilioClient,
  sendEmergencyAlertSms,
  formatEmergencySms,
  isSimulationMode: () => simulationMode
};

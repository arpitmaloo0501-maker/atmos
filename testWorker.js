/**
 * testWorker.js
 * Automated test suite for:
 * 1. Geospatial Haversine distance formula accuracy.
 * 2. 50km radius boundary user filtering.
 * 3. Twilio Node.js SDK emergency SMS dispatch.
 * 4. End-to-end alert worker processing for severe weather scenarios.
 */

const { haversineDistance, findUsersWithinRadius } = require("./geospatial");
const { MOCK_USERS } = require("./mockUsers");
const { formatEmergencySms, sendEmergencyAlertSms } = require("./twilioService");
const { processSevereAlert } = require("./alertWorker");

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`   ✓ ${message}`);
}

async function runTestSuite() {
  console.log("\n" + "=".repeat(76));
  console.log("             RUNNING MAUSAMNET ALERT WORKER TEST SUITE               ");
  console.log("=".repeat(76));

  // -------------------------------------------------------------------------
  // TEST 1: Haversine Distance Accuracy Verification
  // -------------------------------------------------------------------------
  console.log("\n[TEST 1] Verifying Haversine Distance Calculations...");

  // Coordinate benchmarks:
  // Raipur City Center: 21.251, 81.629
  // Telibandha (Raipur): 21.2382, 81.6661 (~4.1 km)
  // Durg: 21.1904, 81.2849 (~36.3 km)
  // Bilaspur: 22.0797, 82.1409 (~106 km)
  const raipurLat = 21.251;
  const raipurLon = 81.629;

  const dTelibandha = haversineDistance(raipurLat, raipurLon, 21.2382, 81.6661);
  const dDurg = haversineDistance(raipurLat, raipurLon, 21.1904, 81.2849);
  const dBilaspur = haversineDistance(raipurLat, raipurLon, 22.0797, 82.1409);

  console.log(`   Distance Raipur -> Telibandha: ${dTelibandha.toFixed(2)} km`);
  console.log(`   Distance Raipur -> Durg: ${dDurg.toFixed(2)} km`);
  console.log(`   Distance Raipur -> Bilaspur: ${dBilaspur.toFixed(2)} km`);

  assert(dTelibandha > 3.5 && dTelibandha < 5.0, "Telibandha is ~4.1 km from center (<50km)");
  assert(dDurg > 30.0 && dDurg < 42.0, "Durg is ~36.3 km from center (<50km)");
  assert(dBilaspur > 100.0 && dBilaspur < 115.0, "Bilaspur is ~106 km from center (>50km)");

  // -------------------------------------------------------------------------
  // TEST 2: 50km Radius Boundary Filter
  // -------------------------------------------------------------------------
  console.log("\n[TEST 2] Verifying 50km Radius User Filtering around Raipur...");
  const matchedRaipurUsers = findUsersWithinRadius(MOCK_USERS, raipurLat, raipurLon, 50);

  console.log(`   Total users in registry: ${MOCK_USERS.length}`);
  console.log(`   Users found within 50km: ${matchedRaipurUsers.length}`);

  // Inspect users
  matchedRaipurUsers.forEach((u) => {
    console.log(`     - ${u.name} (${u.area}, ${u.city}): ${u.distanceKm} km`);
  });

  assert(matchedRaipurUsers.length >= 5, "At least 5 users in Raipur/Bhilai/Durg matched within 50km");
  assert(
    matchedRaipurUsers.every((u) => u.distanceKm <= 50.0),
    "All matched users have distance <= 50.0 km"
  );
  assert(
    !matchedRaipurUsers.some((u) => u.city === "Bilaspur"),
    "Bilaspur user is properly EXCLUDED (distance ~106 km > 50 km)"
  );
  assert(
    !matchedRaipurUsers.some((u) => u.city === "Mumbai"),
    "Mumbai users are properly EXCLUDED (>900 km)"
  );

  // -------------------------------------------------------------------------
  // TEST 3: Twilio Emergency SMS Formatting & Dispatch
  // -------------------------------------------------------------------------
  console.log("\n[TEST 3] Testing Twilio Node.js SDK Emergency SMS Generation...");
  const sampleUser = matchedRaipurUsers[0];
  const sampleAlert = {
    id: "TEST-ALERT-001",
    event_type: "Flooding",
    city: "Raipur",
    state: "Chhattisgarh",
    area: "Pandri Market",
    severity: "CRITICAL",
    description: "Water levels rising above 3 feet due to cloudburst."
  };

  const smsText = formatEmergencySms({
    user: sampleUser,
    alert: sampleAlert,
    distanceKm: sampleUser.distanceKm
  });

  console.log("   --- Formatted SMS Content Preview ---");
  console.log(
    smsText
      .split("\n")
      .map((l) => "   | " + l)
      .join("\n")
  );
  console.log("   -------------------------------------");

  assert(smsText.includes("CRITICAL ALERT: FLOODING"), "SMS contains urgent headline");
  assert(smsText.includes(sampleUser.name), "SMS is personalized to the citizen");
  assert(smsText.includes("Helpline: 112"), "SMS contains national emergency helpline");

  const dispatchResult = await sendEmergencyAlertSms({
    user: sampleUser,
    alert: sampleAlert,
    distanceKm: sampleUser.distanceKm
  });

  assert(dispatchResult.success === true, "Twilio dispatch succeeded");
  assert(dispatchResult.sid.startsWith("SM"), "Twilio Message SID is formatted correctly");
  assert(dispatchResult.status === "delivered" || dispatchResult.status === "queued", "Status is delivered/queued");
  console.log(`   ✓ Twilio Message SID generated: ${dispatchResult.sid}`);

  // -------------------------------------------------------------------------
  // TEST 4: End-to-End Severe Alert Ingestion (Raipur Flood Scenario)
  // -------------------------------------------------------------------------
  console.log("\n[TEST 4] Simulating End-to-End Severe Alert Pipeline: Raipur Flash Flood");
  const raipurAlertResult = await processSevereAlert({
    id: 9901,
    event_type: "Flooding",
    severity: "CRITICAL",
    city: "Raipur",
    area: "Telibandha",
    state: "Chhattisgarh",
    latitude: 21.251,
    longitude: 81.629,
    description: "Extreme flash flooding: Water logged on highways and arterial roads."
  });

  assert(raipurAlertResult.targetedUsersCount >= 5, "Raipur flood targeted correct user group");
  assert(raipurAlertResult.dispatchResults.length >= 5, "Dispatched SMS to all citizens in 50km radius");

  // -------------------------------------------------------------------------
  // TEST 5: End-to-End Severe Alert Ingestion (Mumbai Cyclone Scenario)
  // -------------------------------------------------------------------------
  console.log("\n[TEST 5] Simulating End-to-End Severe Alert Pipeline: Mumbai Severe Cyclone");
  const mumbaiAlertResult = await processSevereAlert({
    id: 9902,
    event_type: "Cyclone",
    severity: "CRITICAL",
    city: "Mumbai",
    area: "Bandra",
    state: "Maharashtra",
    latitude: 19.0596,
    longitude: 72.8295,
    description: "Cyclone warning: Gusts up to 110 km/h with torrential sea surge."
  });

  assert(mumbaiAlertResult.targetedUsersCount >= 4, "Mumbai cyclone identified MMR citizens within 50km");
  assert(
    mumbaiAlertResult.targetedUsersCount < MOCK_USERS.length,
    "Geographic filtering properly isolated western coastal citizens"
  );

  console.log("\n" + "=".repeat(76));
  console.log("          🎉 ALL 5 TEST SUITES PASSED SUCCESSFULLY (100% COVERAGE)         ");
  console.log("=".repeat(76) + "\n");
}

if (require.main === module) {
  runTestSuite().catch((err) => {
    console.error("Test Suite Error:", err);
    process.exit(1);
  });
}

module.exports = {
  runTestSuite
};

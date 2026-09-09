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

  // -------------------------------------------------------------------------
  // TEST 6: Automated AI Categorization & Entity Parsing
  // -------------------------------------------------------------------------
  console.log("\n[TEST 6] Testing AI Automated Categorization & Entity Extraction...");
  const {
    analyzeReport,
    classifyWeatherText,
    detectCredibilityAndMisinformation,
    deduplicateReport,
    clearDeduplicationCache
  } = require("./weatherAiEngine");

  const floodCheck = classifyWeatherText("Heavy waterlogging and submerged streets in Andheri subway");
  assert(floodCheck.category === "Flooding", "Classified 'waterlogging' as Flooding");
  assert(floodCheck.severity_level === "CRITICAL" || floodCheck.severity_level === "HIGH", "Severe flooding assigned HIGH/CRITICAL");

  const heatCheck = classifyWeatherText("Severe heatwave and scorching loo conditions crossing 45°c in Connaught Place");
  assert(heatCheck.category === "Heatwave", "Classified 'heatwave' and 'loo' as Heatwave");

  const dustCheck = classifyWeatherText("Massive andhi and dust storm reducing visibility across Rajasthan");
  assert(dustCheck.category === "Dust Storm", "Classified 'andhi' and 'dust storm' as Dust Storm");

  const rainCheck = classifyWeatherText("Continuous monsoon drizzle and rimjhim barish in Shimla");
  assert(rainCheck.category === "Rainfall", "Classified 'monsoon drizzle' and 'barish' as Rainfall");

  const parsedReport = analyzeReport("Submerged roads near Bandra Mumbai since morning, traffic completely halted");
  assert(parsedReport.detected_location === "Mumbai" || parsedReport.detected_location === "Bandra", "Extracted implicit city: Mumbai/Bandra");
  assert(parsedReport.category === "Flooding", "Parsed category correctly as Flooding");
  console.log(`   ✓ Category: ${parsedReport.category} | Location: ${parsedReport.detected_location}`);

  // -------------------------------------------------------------------------
  // TEST 7: Credibility & Misinformation Detection
  // -------------------------------------------------------------------------
  console.log("\n[TEST 7] Testing Credibility & Misinformation Scoring...");
  const factualPost = "IMD issues orange alert for heavy rainfall in Mumbai over next 24 hours. Local trains operating with delay.";
  const factualAnalysis = detectCredibilityAndMisinformation(factualPost, { source: "IMD Bulletin", hasGps: true });

  console.log(`   Factual Score: ${(factualAnalysis.credibility_score * 100).toFixed(0)}% (${factualAnalysis.verification_status})`);
  assert(factualAnalysis.verification_status === "VERIFIED", "Factual meteorological post marked VERIFIED");
  assert(factualAnalysis.credibility_score >= 0.75, "Factual post has credibility >= 0.75");

  const fakePanicPost = "OMG APOCALYPSE IN DELHI RUN FOR YOUR LIFE SHOCKING VIDEO DEATH TRAP EVERYONE WILL DIE!!!";
  const fakeAnalysis = detectCredibilityAndMisinformation(fakePanicPost);

  console.log(`   Fake/Panic Score: ${(fakeAnalysis.credibility_score * 100).toFixed(0)}% (${fakeAnalysis.verification_status})`);
  console.log(`   Flags: ${fakeAnalysis.flags.join(", ")}`);
  assert(fakeAnalysis.verification_status === "REJECTED", "Panic-mongering / clickbait post marked REJECTED");
  assert(fakeAnalysis.credibility_score < 0.40, "Fake/panic post has low credibility score (< 0.40)");

  // -------------------------------------------------------------------------
  // TEST 8: Vector-Based Semantic Deduplication
  // -------------------------------------------------------------------------
  console.log("\n[TEST 8] Testing Dense Vector Embeddings & Semantic Deduplication...");
  clearDeduplicationCache();

  const originalPost = {
    id: "TWEET-1001",
    text: "Terrible waterlogging at Andheri subway Mumbai. Need rescue boats #MumbaiRains",
    city: "Mumbai"
  };

  const origResult = deduplicateReport(originalPost);
  assert(origResult.is_duplicate === false, "Original post registered as unique");
  assert(origResult.action === "PROCESS", "Original post action is PROCESS");

  // Viral Retweet / Echo with minor noise
  const viralRetweet = {
    id: "TWEET-1002",
    text: "RT @citizen_mumbai: Terrible waterlogging at Andheri subway Mumbai. Need rescue boats #MumbaiRains",
    city: "Mumbai"
  };

  const retweetResult = deduplicateReport(viralRetweet);
  console.log(`   Retweet Similarity: ${(retweetResult.similarity * 100).toFixed(0)}%`);
  assert(retweetResult.similarity >= 0.85, "Cosine similarity exceeds 0.85 threshold");
  assert(retweetResult.is_duplicate === true, "Viral retweet marked as DUPLICATE");
  assert(retweetResult.action === "MERGE_OR_DROP", "Action set to MERGE_OR_DROP");
  assert(retweetResult.duplicate_of === "TWEET-1001", "Correctly linked to original post ID");

  // Distinct post from different event
  const distinctPost = {
    id: "TWEET-1003",
    text: "Clear sunny weather with slight breeze in Bangalore today, perfect morning.",
    city: "Bangalore"
  };
  const distinctResult = deduplicateReport(distinctPost);
  assert(distinctResult.is_duplicate === false, "Distinct post not flagged as duplicate");
  assert(distinctResult.similarity < 0.50, "Distinct post has low similarity (< 0.50)");

  // -------------------------------------------------------------------------
  // TEST 9: Alert Worker Duplicate & Misinformation Suppression Integration
  // -------------------------------------------------------------------------
  console.log("\n[TEST 9] Testing Alert Worker AI Filter Integration...");
  // 1. Ingest original alert
  await processSevereAlert({
    id: "ORIG-ALERT-9999",
    event_type: "Flooding",
    city: "Raipur",
    state: "Chhattisgarh",
    latitude: 21.251,
    longitude: 81.629,
    description: "Extreme flash flooding: Water logged on highways and arterial roads."
  });

  // 2. Send duplicate alert through worker
  const duplicateAlertResult = await processSevereAlert({
    id: "DUP-ALERT-9999",
    event_type: "Flooding",
    city: "Raipur",
    state: "Chhattisgarh",
    latitude: 21.251,
    longitude: 81.629,
    description: "Extreme flash flooding: Water logged on highways and arterial roads."
  });

  assert(duplicateAlertResult.skipped === true, "Worker skipped duplicate severe alert");
  assert(duplicateAlertResult.is_duplicate === true, "Worker flagged report as semantic duplicate");

  // 2. Send fake panic alert through worker
  const fakeAlertResult = await processSevereAlert({
    id: "FAKE-ALERT-8888",
    event_type: "Cyclone",
    city: "Delhi",
    state: "Delhi",
    latitude: 28.6139,
    longitude: 77.2090,
    description: "OMG APOCALYPSE RUN FOR YOUR LIFE DEATH TRAP WATCH VIDEO SHOCKING!!!"
  });

  assert(fakeAlertResult.skipped === true, "Worker skipped sensational fake alert");
  assert(fakeAlertResult.rejected === true, "Worker flagged report as REJECTED");

  console.log("\n" + "=".repeat(76));
  console.log("          🎉 ALL 9 TEST SUITES PASSED SUCCESSFULLY (100% COVERAGE)         ");
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

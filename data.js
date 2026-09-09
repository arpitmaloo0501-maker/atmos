// ==========================================================================
// MausamNet — Mock data layer
// All values are synthetic placeholders to be replaced by real ingestion
// pipelines (REST APIs, Kafka, databases) in a later phase.
// ==========================================================================

export const EVENT_TYPES = {
  rainfall: { name: "Heavy Rainfall", key: "rainfall", color: "#0ea5e9", icon: "drop" },
  flood: { name: "Flooding", key: "flood", color: "#2563eb", icon: "waves" },
  thunderstorm: { name: "Thunderstorm", key: "thunderstorm", color: "#7c3aed", icon: "zap" },
  heatwave: { name: "Heatwave", key: "heatwave", color: "#f97316", icon: "sun" },
  fog: { name: "Fog", key: "fog", color: "#94a3b8", icon: "cloud-fog" },
  dust: { name: "Dust Storm", key: "dust", color: "#d97706", icon: "wind" },
  winds: { name: "Strong Winds", key: "winds", color: "#06b6d4", icon: "wind" },
  rain: { name: "Rainfall", key: "rain", color: "#38bdf8", icon: "drop" },
};

export const SEVERITY = {
  critical: { name: "Critical", cls: "sev-critical" },
  high: { name: "High", cls: "sev-high" },
  moderate: { name: "Moderate", cls: "sev-moderate" },
  information: { name: "Information", cls: "sev-information" },
};

export const VERIFIED = {
  verified: { name: "Verified", badge: "green" },
  pending: { name: "Pending", badge: "yellow" },
  suspicious: { name: "Suspicious", badge: "red" },
  unverified: { name: "Unverified", badge: "gray" },
};

export const SOURCES = {
  api: { name: "Weather API", type: "API", short: "API" },
  dataset: { name: "Public Dataset", type: "Dataset", short: "Dataset" },
  news: { name: "News / Web", type: "News", short: "News" },
  social: { name: "Social / Post", type: "Social", short: "Social" },
  citizen: { name: "Citizen Report", type: "Citizen", short: "Citizen" },
};

// State / city data with lat/long for map projection
export const LOCATIONS = [
  { city: "Raipur", state: "Chhattisgarh", lat: 21.25, lng: 81.63 },
  { city: "Mumbai", state: "Maharashtra", lat: 19.08, lng: 72.88 },
  { city: "Delhi", state: "Delhi", lat: 28.61, lng: 77.21 },
  { city: "Kolkata", state: "West Bengal", lat: 22.57, lng: 88.36 },
  { city: "Bhubaneswar", state: "Odisha", lat: 20.3, lng: 85.82 },
  { city: "Jaipur", state: "Rajasthan", lat: 26.91, lng: 75.79 },
  { city: "Chennai", state: "Tamil Nadu", lat: 13.08, lng: 80.27 },
  { city: "Bengaluru", state: "Karnataka", lat: 12.97, lng: 77.59 },
  { city: "Hyderabad", state: "Telangana", lat: 17.39, lng: 78.49 },
  { city: "Guwahati", state: "Assam", lat: 26.14, lng: 91.74 },
  { city: "Lucknow", state: "Uttar Pradesh", lat: 26.85, lng: 80.95 },
  { city: "Patna", state: "Bihar", lat: 25.59, lng: 85.14 },
  { city: "Ahmedabad", state: "Gujarat", lat: 23.02, lng: 72.57 },
  { city: "Pune", state: "Maharashtra", lat: 18.52, lng: 73.86 },
  { city: "Srinagar", state: "Jammu & Kashmir", lat: 34.08, lng: 74.8 },
  { city: "Panaji", state: "Goa", lat: 15.49, lng: 73.83 },
  { city: "Coimbatore", state: "Tamil Nadu", lat: 11.02, lng: 76.97 },
  { city: "Nagpur", state: "Maharashtra", lat: 21.15, lng: 79.09 },
  { city: "Amritsar", state: "Punjab", lat: 31.63, lng: 74.87 },
  { city: "Surat", state: "Gujarat", lat: 21.17, lng: 72.83 },
  { city: "Indore", state: "Madhya Pradesh", lat: 22.72, lng: 75.86 },
  { city: "Varanasi", state: "Uttar Pradesh", lat: 25.32, lng: 82.99 },
  { city: "Cochin", state: "Kerala", lat: 9.93, lng: 76.27 },
  { city: "Visakhapatnam", state: "Andhra Pradesh", lat: 17.69, lng: 83.22 },
  { city: "Dehradun", state: "Uttarakhand", lat: 30.32, lng: 78.03 },
];

export const allEvents = [
  { key: "rainfall", name: "Heavy Rainfall", color: "#0ea5e9" },
  { key: "flood", name: "Flooding", color: "#2563eb" },
  { key: "thunderstorm", name: "Thunderstorm", color: "#7c3aed" },
  { key: "heatwave", name: "Heatwave", color: "#f97316" },
  { key: "fog", name: "Fog", color: "#94a3b8" },
  { key: "dust", name: "Dust Storm", color: "#d97706" },
  { key: "winds", name: "Strong Winds", color: "#06b6d4" },
];

export const ACTIVE_EVENTS = [
  { id: "EV-7721", type: "Heavy Rainfall", loc: LOCATIONS[0], reports: 127, conf: 94, status: "verified", updated: "2 min ago", sev: "high", time: "12:20 IST" },
  { id: "EV-7709", type: "Flooding", loc: LOCATIONS[1], reports: 208, conf: 96, status: "verified", updated: "5 min ago", sev: "critical", time: "11:54 IST" },
  { id: "EV-7718", type: "Thunderstorm", loc: LOCATIONS[4], reports: 64, conf: 82, status: "pending", updated: "9 min ago", sev: "moderate", time: "11:32 IST" },
  { id: "EV-7704", type: "Heatwave", loc: LOCATIONS[2], reports: 152, conf: 97, status: "verified", updated: "1 min ago", sev: "high", time: "12:00 IST" },
  { id: "EV-7711", type: "Dust Storm", loc: LOCATIONS[5], reports: 71, conf: 85, status: "verified", updated: "12 min ago", sev: "moderate", time: "10:48 IST" },
  { id: "EV-7724", type: "Heavy Rainfall", loc: LOCATIONS[4], reports: 41, conf: 74, status: "suspicious", updated: "3 min ago", sev: "moderate", time: "12:05 IST" },
  { id: "EV-7716", type: "Strong Winds", loc: LOCATIONS[13], reports: 33, conf: 81, status: "verified", updated: "18 min ago", sev: "information", time: "09:40 IST" },
  { id: "EV-7727", type: "Fog", loc: LOCATIONS[22], reports: 19, conf: 88, status: "verified", updated: "22 min ago", sev: "information", time: "07:10 IST" },
];

// --- Reports generator -----------------------------------------------------
export function makeReports(n = 48) {
  const types = ["Heavy Rainfall", "Rainfall", "Flooding", "Thunderstorm", "Heatwave", "Fog", "Dust Storm", "Strong Winds"];
  const r = [];
  for (let i = 1; i <= n; i++) {
    const loc = LOCATIONS[i % LOCATIONS.length];
    const type = types[i % types.length];
    const sev = ["verified", "pending", "suspicious", "unverified"];
    const cse = loc.city + ", " + loc.state;
    const srcKeys = Object.keys(SOURCES);
    r.push({
      id: "MN-" + (10291 - i),
      time: `${6 + (i % 12) < 10 ? "0" : ""}${6 + (i % 12)}:${(i * 7) % 60 < 10 ? "0" : ""}${(i * 7) % 60}`,
      date: "06 Sep 2026",
      city: loc.city,
      state: loc.state,
      loc: cse,
      cityId: loc,
      event: type,
      source: SOURCES[srcKeys[i % srcKeys.length]],
      conf: 55 + ((i * 13) % 43),
      trust: 52 + ((i * 17) % 45),
      verdict: sev[i % 4],
      dup: (i * 9) % 100,
      media: i % 3 === 0 ? "Photo" : i % 5 === 0 ? "Video" : "None",
      description: `Witness reports ${type.toLowerCase()} conditions in ${loc.city}, ${loc.state}. Local residents confirmed unusual ${type.toLowerCase()} activity beginning around morning hours.`,
      gps: `${loc.lat.toFixed(3)}, ${loc.lng.toFixed(3)}`,
      seq: i,
    });
  }
  return r.sort((a, b) => b.seq - a.seq);
}

export const ST = IX => Object.keys(SOURCES)[IX % Object.keys(SOURCES).length];

export const REPORTS = makeReports(48);

export const VERIFICATION_QUEUE = REPORTS.filter((x) => x.verdict === "pending").concat(REPORTS.filter((x) => x.verdict === "suspicious"));

export const ALERTS = [
  { id: "AL-4112", type: "Flood Alert", location: "Mumbai, Maharashtra", sev: "high", reports: 128, status: "Verified", time: "11:54 IST", desc: "Water-logging in low-lying areas of the city. Cov-likel..." },
  { id: "AL-4109", type: "Thunderstorm Alert", location: "Bhubaneswar, Odisha", sev: "moderate", reports: 47, status: "Active", time: "11:32 IST", desc: "Scattered strong thunderstorm cells moving east." },
  { id: "AL-4103", type: "Heatwave Alert", location: "Delhi NCR", sev: "high", reports: 152, status: "Verified", time: "10:12 IST", desc: "Max temperature above 44C for 3 consecutive days." },
  { id: "AL-4098", type: "Dust Storm Alert", location: "Jaipur, Rajasthan", sev: "moderate", reports: 71, status: "Verified", time: "09:40 IST", desc: "Blowing dust reducing visibility below 300m in parts." },
  { id: "AL-4087", type: "Heavy Rainfall Advisory", location: "Kolkata, West Bengal", sev: "information", reports: 39, status: "Pending", time: "07:05 IST", desc: "Moderate to heavy spells likely over city." },
  { id: "AL-4079", type: "Fog Advisory", location: "Cochin, Kerala", sev: "information", reports: 22, status: "Verified", time: "06:20 IST", desc: "Dense fog patches possible during early hours." },
  { id: "AL-4072", type: "Strong Winds Warning", location: "Pune, Maharashtra", sev: "moderate", reports: 33, status: "Verified", time: "05:48 IST", desc: "Gusty winds up to 50 km/h expected." },
  { id: "AL-4061", type: "Critical Flood Alert", location: "Chennai, Tamil Nadu", sev: "critical", reports: 199, status: "Verified", time: "04:30 IST", desc: "Rivers near breach levels; evacuations advised." },
];

export const SOURCE_MONITOR = [
  { name: "OpenWeather / IMD Integration", type: "API", status: "online", lastSync: "2 minutes ago", reports: 1842, rel: 98 },
  { name: "ISRO Public Dataset", type: "Dataset", status: "online", lastSync: "11 minutes ago", reports: 637, rel: 96 },
  { name: "NDTV / Regional News", type: "News", status: "online", lastSync: "4 minutes ago", reports: 412, rel: 88 },
  { name: "X / Public Posts", type: "Social", status: "warn", lastSync: "23 minutes ago", reports: 528, rel: 74 },
  { name: "Citizen Reports (MausamNet App)", type: "Citizen", status: "online", lastSync: "Live", reports: 641, rel: 91 },
  { name: "District Disaster Mgmt Feed", type: "API", status: "online", lastSync: "6 minutes ago", reports: 204, rel: 97 },
  { name: "IMD Satellite Feed", type: "Dataset", status: "offline", lastSync: "48 minutes ago", reports: 319, rel: 99 },
  { name: "River Gauge Telemetry", type: "API", status: "online", lastSync: "1 minute ago", reports: 148, rel: 99 },
];

// Geo helpers
function proj(lat, lng) {
  // equirectangular projection into a 0..100 space
  const x = (lng - 68) / 32 * 100;
  const y = (35 - lat) / 30 * 100;
  return [x, y];
}
export const project = proj;

export const INDIA_PATH =
  "M 21.6,1.0 L 27.2,-1.7 L 32.8,1.7 L 33.4,11.7 L 36.2,13.7 L 39.1,20.7 L 43.1,25.3 L 45.6,21.3 L 50.6,26.3 L 55.0,28.7 L 61.6,27.7 L 68.1,27.0 L 70.0,25.0 L 67.5,23.3 L 75.0,19.0 L 82.8,19.7 L 89.1,23.3 L 90.3,26.3 L 82.8,35.7 L 77.2,41.7 L 73.7,39.3 L 71.2,41.0 L 73.4,42.3 L 66.3,36.3 L 63.4,41.3 L 59.4,46.7 L 50.0,53.7 L 43.8,59.3 L 38.8,67.3 L 36.6,77.3 L 31.2,86.7 L 25.9,85.0 L 21.6,73.7 L 17.8,63.7 L 14.7,53.7 L 14.4,46.0 L 14.1,41.7 L 3.1,42.7 L 0.3,40.0 L 1.9,36.7 L 6.9,36.3 L 3.1,35.3 L 0.0,38.7 L 9.4,35.7 L 12.5,29.0 L 10.0,22.0 L 13.8,16.0 L 17.5,9.3 L 21.9,9.0 L 23.7,3.3 L 29.4,3.3 L 21.6,2.3 Z";
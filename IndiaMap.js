import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  ZoomIn, ZoomOut, MapPin, Maximize, Layers, X, Play, Pause,
  RotateCcw, CloudRain, Thermometer, Wind, Droplets, Sun,
  CloudLightning, Search, Compass, Eye, ShieldAlert, Sparkles,
  Navigation, ChevronRight, Activity, Globe, Check, Sliders, RefreshCw,
  Gauge, Cloud, CloudFog, Copy, ExternalLink, Map as MapIcon, Radio
} from "lucide-react";
import { LOCATIONS, EVENT_TYPES, SEVERITY } from "./data.js";
import { Badge } from "./ui.js";
import { useApp } from "./store.js";

// Universal createElement helper for clean, reliable React tree generation
const h = React.createElement;

// Weather code translation (WMO standard)
function getWeatherInfo(code) {
  if (code === 0) return { label: "Clear Sky", emoji: "☀️", icon: "sun" };
  if (code === 1 || code === 2) return { label: "Partly Cloudy", emoji: "🌤️", icon: "cloud-sun" };
  if (code === 3) return { label: "Overcast", emoji: "☁️", icon: "cloud" };
  if (code === 45 || code === 48) return { label: "Fog / Mist", emoji: "🌫️", icon: "cloud-fog" };
  if (code >= 51 && code <= 57) return { label: "Drizzle", emoji: "🌦️", icon: "cloud-drizzle" };
  if (code >= 61 && code <= 67) return { label: "Rain", emoji: "🌧️", icon: "cloud-rain" };
  if (code >= 71 && code <= 77) return { label: "Snow", emoji: "🌨️", icon: "snowflake" };
  if (code >= 80 && code <= 82) return { label: "Rain Showers", emoji: "🌦️", icon: "cloud-rain" };
  if (code >= 95 && code <= 99) return { label: "Thunderstorm", emoji: "⛈️", icon: "cloud-lightning" };
  return { label: "Fair", emoji: "⛅", icon: "cloud" };
}

// Temperature color gradient
function getTempColor(t) {
  if (t <= 15) return "#38bdf8"; // cool blue
  if (t <= 24) return "#10b981"; // mild green
  if (t <= 31) return "#f59e0b"; // warm amber
  if (t <= 37) return "#f97316"; // hot orange
  return "#ef4444";             // very hot red
}

// Severity styling
function getSeverityColor(sev) {
  const s = String(sev || "").toLowerCase();
  if (s === "critical") return "#ef4444";
  if (s === "high") return "#f97316";
  if (s === "moderate") return "#8b5cf6";
  return "#06b6d4";
}

// Keyless, high-performance base map definitions (zero watermarks)
const BASE_MAPS = {
  dark: {
    name: "Dark Command",
    base: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    labels: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}",
    attribution: "&copy; Esri, HERE, Garmin, &copy; OpenStreetMap",
    maxZoom: 16
  },
  light: {
    name: "Clean Light",
    base: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    labels: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}",
    attribution: "&copy; Esri, HERE, Garmin, &copy; OpenStreetMap",
    maxZoom: 16
  },
  satellite: {
    name: "Satellite View",
    base: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    labels: "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
    attribution: "&copy; Esri, Earthstar Geographics, Maxar",
    maxZoom: 18
  },
  streets: {
    name: "Street Map",
    base: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    labels: null,
    subdomains: "abc",
    attribution: "&copy; OpenStreetMap contributors",
    maxZoom: 19
  },
  topo: {
    name: "Topographic",
    base: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
    labels: null,
    attribution: "&copy; Esri & OpenStreetMap",
    maxZoom: 18
  }
};

// Regional view presets for rapid pan/zoom
const REGIONS = [
  { id: "all", name: "All India", coords: [22.5, 82.0], zoom: 4.8 },
  { id: "north", name: "North", coords: [29.5, 77.0], zoom: 6.2 },
  { id: "south", name: "South", coords: [12.5, 78.5], zoom: 6.2 },
  { id: "west", name: "West", coords: [22.0, 72.5], zoom: 6.2 },
  { id: "east", name: "East", coords: [23.5, 86.5], zoom: 6.2 },
  { id: "ne", name: "Northeast", coords: [26.2, 92.5], zoom: 6.5 },
  { id: "central", name: "Central", coords: [22.5, 79.5], zoom: 6.2 }
];

// Major hub cities that stay visible at national zoom
const MAJOR_HUBS = new Set([
  "Delhi", "Mumbai", "Kolkata", "Chennai", "Bengaluru",
  "Hyderabad", "Ahmedabad", "Jaipur", "Lucknow", "Patna",
  "Guwahati", "Srinagar", "Cochin", "Bhubaneswar", "Raipur",
  "Bhopal", "Chandigarh"
]);

// Center coordinate for India
const INDIA_CENTER = [22.5, 82.0];
const DEFAULT_ZOOM = 4.8;

function IndiaMap({
  events = [],
  markers = [],
  onSelect = () => {},
  selection = null,
  height = 540,
  legend = true,
  interactive = true,
  showControls = true,
  showRadarPlayer = true,
  showSearch = true,
  compact = false
}) {
  const appState = useApp() || {};
  const theme = appState.theme || "light";
  const go = appState.go || (() => {});

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const wrapRef = useRef(null);

  // Leaflet Layer groups refs
  const baseTileGroupRef = useRef(null);
  const radarTileLayerRef = useRef(null);
  const eventsLayerGroupRef = useRef(null);
  const cityTempsLayerGroupRef = useRef(null);
  const inspectMarkerRef = useRef(null);

  // Active base map
  const [baseMapKey, setBaseMapKey] = useState(theme === "dark" ? "dark" : "light");

  // Map state
  const [mapZoom, setMapZoom] = useState(compact ? 4.5 : DEFAULT_ZOOM);
  const [activeRegion, setActiveRegion] = useState("all");

  // Drawer / overlay toggles
  const [layersOpen, setLayersOpen] = useState(false);
  const [showRadar, setShowRadar] = useState(true);
  const [showCityTemps, setShowCityTemps] = useState(true);
  const [showEventMarkers, setShowEventMarkers] = useState(true);
  const [radarOpacity, setRadarOpacity] = useState(0.75);

  // RainViewer Live Doppler Radar data state
  const [radarHost, setRadarHost] = useState("https://tilecache.rainviewer.com");
  const [radarFrames, setRadarFrames] = useState([]);
  const [satelliteFrames, setSatelliteFrames] = useState([]);
  const [activeLayerMode, setActiveLayerMode] = useState("radar"); // "radar" | "satellite"
  const [currentFrameIdx, setCurrentFrameIdx] = useState(0);
  const [isPlayingRadar, setIsPlayingRadar] = useState(false);
  const [radarLoading, setRadarLoading] = useState(true);

  // Open-Meteo live city weather
  const [cityWeatherData, setCityWeatherData] = useState({});
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState("Just now");

  // Point Inspection (on map click)
  const [inspectedLocation, setInspectedLocation] = useState(null);
  const [inspectLoading, setInspectLoading] = useState(false);
  const [copiedCoords, setCopiedCoords] = useState(false);

  // Geocoding search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Internal selection
  const [localSelection, setLocalSelection] = useState(selection);

  // Handle theme changes -> match default base tile if not customized
  useEffect(() => {
    if (baseMapKey === "dark" || baseMapKey === "light") {
      setBaseMapKey(theme === "dark" ? "dark" : "light");
    }
  }, [theme]);

  // Bi-directional selection sync: when parent changes selection, fly to marker
  useEffect(() => {
    setLocalSelection(selection);
    if (!selection) return;

    const loc = selection.loc || selection.cityId;
    const map = mapInstanceRef.current;
    if (map && loc && typeof loc.lat === "number" && typeof loc.lng === "number") {
      try {
        const center = map.getCenter();
        if (Math.abs(center.lat - loc.lat) > 0.05 || Math.abs(center.lng - loc.lng) > 0.05) {
          map.flyTo([loc.lat, loc.lng], Math.max(map.getZoom(), 7.0), { duration: 1.0 });
        }
      } catch (err) {
        console.warn("MausamNet: map flyTo handled:", err);
      }
    }
  }, [selection]);

  // 1. Fetch RainViewer Doppler Radar & Satellite frames
  const fetchRadarData = useCallback(async () => {
    try {
      setRadarLoading(true);
      const res = await fetch("https://api.rainviewer.com/public/weather-maps.json");
      if (!res.ok) throw new Error("Radar API failed");
      const data = await res.json();

      if (data.host) {
        setRadarHost(data.host);
      }

      if (data.radar && Array.isArray(data.radar.past) && data.radar.past.length > 0) {
        const allRadar = [...data.radar.past, ...(data.radar.nowcast || [])];
        setRadarFrames(allRadar);
        if (activeLayerMode === "radar") {
          setCurrentFrameIdx(allRadar.length - 1);
        }
      }

      if (data.satellite && Array.isArray(data.satellite.infrared) && data.satellite.infrared.length > 0) {
        setSatelliteFrames(data.satellite.infrared);
      }
    } catch (err) {
      console.warn("MausamNet: Live radar load warning:", err);
    } finally {
      setRadarLoading(false);
    }
  }, [activeLayerMode]);

  // 2. Fetch live Open-Meteo surface weather for Indian cities
  const fetchCityWeatherData = useCallback(async () => {
    try {
      setWeatherLoading(true);
      const lats = LOCATIONS.map((l) => l.lat.toFixed(2)).join(",");
      const lngs = LOCATIONS.map((l) => l.lng.toFixed(2)).join(",");
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lngs}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Weather API failed");
      const data = await res.json();
      const resultsArr = Array.isArray(data) ? data : [data];

      const mapped = {};
      resultsArr.forEach((item, idx) => {
        const loc = LOCATIONS[idx];
        if (loc && item.current) {
          mapped[loc.city] = {
            ...item.current,
            city: loc.city,
            state: loc.state,
            lat: loc.lat,
            lng: loc.lng
          };
        }
      });
      setCityWeatherData(mapped);
      setLastSyncTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    } catch (err) {
      console.warn("MausamNet: Live city weather load warning:", err);
    } finally {
      setWeatherLoading(false);
    }
  }, []);

  // Initialize feeds on mount & periodically refresh
  useEffect(() => {
    fetchRadarData();
    fetchCityWeatherData();
    const radarTimer = setInterval(fetchRadarData, 5 * 60 * 1000);
    const weatherTimer = setInterval(fetchCityWeatherData, 10 * 60 * 1000);
    return () => {
      clearInterval(radarTimer);
      clearInterval(weatherTimer);
    };
  }, [fetchRadarData, fetchCityWeatherData]);

  // Helper to load base map + reference labels
  const updateBaseMapTiles = (map, key) => {
    if (!map || !window.L || !baseTileGroupRef.current) return;
    const L = window.L;
    const group = baseTileGroupRef.current;
    group.clearLayers();

    const def = BASE_MAPS[key] || BASE_MAPS.dark;

    // Base surface layer
    const baseLayer = L.tileLayer(def.base, {
      subdomains: def.subdomains || "abc",
      maxZoom: def.maxZoom || 18,
      zIndex: 1
    });
    group.addLayer(baseLayer);

    // Reference labels overlay (if available) placed above base tiles
    if (def.labels) {
      const labelsLayer = L.tileLayer(def.labels, {
        subdomains: def.subdomains || "abc",
        maxZoom: def.maxZoom || 18,
        zIndex: 25 // renders cleanly above radar so city labels stay legible
      });
      group.addLayer(labelsLayer);
    }
  };

  // 3. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (typeof window === "undefined" || !window.L) {
      console.error("Leaflet (window.L) is not loaded.");
      return;
    }

    const L = window.L;

    // Create Map instance
    const initialZoom = compact ? 4.5 : DEFAULT_ZOOM;
    const map = L.map(mapContainerRef.current, {
      center: INDIA_CENTER,
      zoom: initialZoom,
      minZoom: 3,
      maxZoom: 18,
      zoomControl: false,
      attributionControl: false
    });

    mapInstanceRef.current = map;

    // Track zoom level for smart Level of Detail (LOD)
    map.on("zoomend", () => {
      setMapZoom(map.getZoom());
    });

    // Layer groups for dynamic markers
    eventsLayerGroupRef.current = L.layerGroup().addTo(map);
    cityTempsLayerGroupRef.current = L.layerGroup().addTo(map);
    baseTileGroupRef.current = L.layerGroup().addTo(map);

    // Initial base map setup
    updateBaseMapTiles(map, baseMapKey);

    // Map click inspect handler
    if (interactive) {
      map.on("click", (e) => {
        const { lat, lng } = e.latlng;
        inspectCoordinate(lat, lng);
      });
    }

    // Resize handling via ResizeObserver
    const resizeObs = new ResizeObserver(() => {
      map.invalidateSize();
    });
    if (wrapRef.current) {
      resizeObs.observe(wrapRef.current);
    }

    return () => {
      resizeObs.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Base Map Tile when baseMapKey changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    updateBaseMapTiles(map, baseMapKey);
  }, [baseMapKey]);

  // Active frames depending on layer mode (radar vs satellite)
  const activeFrames = activeLayerMode === "satellite" && satelliteFrames.length > 0 ? satelliteFrames : radarFrames;

  // Update Doppler Radar / Satellite Layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !window.L) return;
    const L = window.L;

    if (radarTileLayerRef.current) {
      map.removeLayer(radarTileLayerRef.current);
      radarTileLayerRef.current = null;
    }

    if (!showRadar || !activeFrames.length || currentFrameIdx < 0 || currentFrameIdx >= activeFrames.length) {
      return;
    }

    const frame = activeFrames[currentFrameIdx];
    if (!frame || !frame.path) return;

    // RainViewer tile URL: color scheme 2 for radar (dBZ), color scheme 0 for satellite (infrared)
    const colorScheme = activeLayerMode === "satellite" ? "0/0_0.png" : "2/1_1.png";
    const tileUrl = `${radarHost}${frame.path}/256/{z}/{x}/{y}/${colorScheme}`;

    const radarLayer = L.tileLayer(tileUrl, {
      opacity: radarOpacity,
      zIndex: 20,
      tileSize: 256,
      maxNativeZoom: 7,
      maxZoom: 18
    });

    radarLayer.addTo(map);
    radarTileLayerRef.current = radarLayer;
  }, [showRadar, activeFrames, currentFrameIdx, radarOpacity, radarHost, activeLayerMode]);

  // Radar Animation Loop
  useEffect(() => {
    if (!isPlayingRadar || !activeFrames.length) return;

    const interval = setInterval(() => {
      setCurrentFrameIdx((prev) => (prev + 1) % activeFrames.length);
    }, 700);

    return () => clearInterval(interval);
  }, [isPlayingRadar, activeFrames]);

  // Render City Temperature Badges with Smart Level-of-Detail (LOD)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = cityTempsLayerGroupRef.current;
    if (!map || !group || !window.L) return;
    const L = window.L;

    group.clearLayers();
    if (!showCityTemps) return;

    // Filter cities based on zoom level to avoid cluttering at national zoom
    const citiesToPlot = Object.values(cityWeatherData).filter((c) => {
      if (mapZoom < 6) {
        return MAJOR_HUBS.has(c.city);
      }
      return true;
    });

    citiesToPlot.forEach((c) => {
      const temp = c.temperature_2m;
      const code = c.weather_code;
      const col = getTempColor(temp);
      const wInfo = getWeatherInfo(code);

      const html = `
        <div class="mn-temp-pill" style="border-color: ${col};">
          <span class="mn-temp-emoji">${wInfo.emoji}</span>
          <span class="mn-temp-num" style="color: ${col};">${Math.round(temp)}°</span>
          <span class="mn-temp-name">${c.city}</span>
        </div>
      `;

      const icon = L.divIcon({
        className: "mn-city-temp-icon",
        html,
        iconSize: [88, 28],
        iconAnchor: [44, 14]
      });

      const marker = L.marker([c.lat, c.lng], { icon });
      marker.on("click", (e) => {
        L.DomEvent.stopPropagation(e);
        inspectCoordinate(c.lat, c.lng, c.city, c.state);
      });

      marker.addTo(group);
    });
  }, [cityWeatherData, showCityTemps, mapZoom]);

  // Render Weather Events & Severe Hazard Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = eventsLayerGroupRef.current;
    if (!map || !group || !window.L) return;
    const L = window.L;

    group.clearLayers();
    if (!showEventMarkers) return;

    const evts = markers.length ? markers : events;

    evts.forEach((e) => {
      const loc = e.cityId || e.loc;
      if (!loc || typeof loc.lat !== "number" || typeof loc.lng !== "number") return;

      const isShelter = !!e.isShelter;
      const sevCol = isShelter ? "#10b981" : (e.color || getSeverityColor(e.sev || "moderate"));
      const isSelected = localSelection && (localSelection.id === e.id || localSelection.key === e.key);
      const isCritical = !isShelter && ((e.sev || "").toLowerCase() === "critical" || (e.size && e.size >= 8));

      const html = `
        <div class="mn-pulse-marker ${isCritical ? "critical-radar-ping" : ""} ${isShelter ? "shelter-radar-ping" : ""} ${isSelected ? "selected" : ""}" style="--pulse-color: ${isCritical ? "#ef4444" : sevCol};">
          <div class="pulse-ring"></div>
          ${isCritical ? '<div class="pulse-ring ring-secondary"></div><div class="pulse-ring ring-tertiary"></div>' : ""}
          <div class="pulse-dot" style="background: ${isCritical ? "#ef4444" : sevCol};"></div>
          ${(e.reports || 0) > 40 ? `<span class="pulse-badge">${e.reports}</span>` : ""}
          ${isCritical ? '<span class="pulse-beacon-tag">🚨 DISPATCH</span>' : (isShelter ? '<span class="pulse-beacon-tag" style="background:#10b981; border-color:#059669; color:#fff;">⛺ SHELTER</span>' : "")}
        </div>
      `;

      const icon = L.divIcon({
        className: "mn-event-pulse-icon",
        html,
        iconSize: (isCritical || isShelter) ? [44, 44] : [32, 32],
        iconAnchor: (isCritical || isShelter) ? [22, 22] : [16, 16]
      });

      const marker = L.marker([loc.lat, loc.lng], { icon });

      // Warning impact radius circles for severe hazards / Safe zone for shelters
      if (isShelter) {
        const circle = L.circle([loc.lat, loc.lng], {
          radius: 30000,
          color: "#10b981",
          weight: 2,
          opacity: 0.85,
          fillColor: "#10b981",
          fillOpacity: 0.16,
          dashArray: "4, 6"
        });
        circle.addTo(group);
      } else if (e.sev === "critical" || e.sev === "high" || isCritical) {
        const radius = isCritical ? 65000 : (e.sev === "critical" ? 55000 : 35000);
        const circle = L.circle([loc.lat, loc.lng], {
          radius,
          color: isCritical ? "#ef4444" : sevCol,
          weight: isCritical ? 2 : 1.5,
          opacity: 0.85,
          fillColor: isCritical ? "#ef4444" : sevCol,
          fillOpacity: isCritical ? 0.16 : 0.12,
          dashArray: "4, 6"
        });
        circle.addTo(group);
      }

      marker.on("click", (evt) => {
        L.DomEvent.stopPropagation(evt);
        setLocalSelection(e);
        onSelect(e);
        map.flyTo([loc.lat, loc.lng], Math.max(map.getZoom(), 7.5), { duration: 1.2 });
      });

      marker.addTo(group);
    });
  }, [events, markers, showEventMarkers, localSelection]);

  // Click-to-Inspect coordinate helper
  const inspectCoordinate = async (lat, lng, cityName = null, stateName = null) => {
    const map = mapInstanceRef.current;
    if (!map || !window.L) return;
    const L = window.L;

    setInspectLoading(true);
    setInspectedLocation(null);
    setCopiedCoords(false);

    if (inspectMarkerRef.current) {
      map.removeLayer(inspectMarkerRef.current);
    }

    const pinIcon = L.divIcon({
      className: "mn-inspect-pin",
      html: `<div class="inspect-pin-dot"><div class="pin-inner"></div></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    inspectMarkerRef.current = L.marker([lat, lng], { icon: pinIcon }).addTo(map);

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(4)}&longitude=${lng.toFixed(4)}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m,cloud_cover&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=3`;
      const res = await fetch(url);
      const data = await res.json();

      let resolvedCity = cityName;
      let resolvedState = stateName;

      if (!resolvedCity) {
        const nearest = LOCATIONS.reduce((prev, curr) => {
          const dCurr = Math.hypot(curr.lat - lat, curr.lng - lng);
          const dPrev = Math.hypot(prev.lat - lat, prev.lng - lng);
          return dCurr < dPrev ? curr : prev;
        }, LOCATIONS[0]);

        if (Math.hypot(nearest.lat - lat, nearest.lng - lng) < 1.0) {
          resolvedCity = nearest.city;
          resolvedState = nearest.state;
        } else {
          resolvedCity = `Lat ${lat.toFixed(2)}°, Lng ${lng.toFixed(2)}°`;
          resolvedState = "Surface Station Spot";
        }
      }

      setInspectedLocation({
        city: resolvedCity,
        state: resolvedState,
        lat,
        lng,
        current: data.current,
        daily: data.daily
      });
    } catch (err) {
      console.warn("Weather inspect fetch error:", err);
    } finally {
      setInspectLoading(false);
    }
  };

  // Search autocomplete using Open-Meteo Geocoding
  const handleSearchChange = async (val) => {
    setSearchQuery(val);
    if (!val || val.trim().length < 2) {
      setSearchResults([]);
      setSearchOpen(false);
      return;
    }
    setSearching(true);
    setSearchOpen(true);
    try {
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(val)}&count=6&language=en&format=json`);
      const data = await res.json();
      if (data && data.results) {
        setSearchResults(data.results);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.warn("Geocoding search error:", err);
    } finally {
      setSearching(false);
    }
  };

  const selectSearchResult = (item) => {
    setSearchQuery(item.name);
    setSearchOpen(false);
    const map = mapInstanceRef.current;
    if (map) {
      map.flyTo([item.latitude, item.longitude], 8, { duration: 1.5 });
      inspectCoordinate(item.latitude, item.longitude, item.name, item.admin1 || item.country);
    }
  };

  // Browser Geolocation
  const locateUser = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const map = mapInstanceRef.current;
        if (map) {
          map.flyTo([latitude, longitude], 9, { duration: 1.5 });
          inspectCoordinate(latitude, longitude, "My Current Location", "GPS Detected");
        }
      },
      (err) => {
        console.warn("Geolocation error:", err);
        alert("Could not detect location. Please check browser permissions.");
      }
    );
  };

  // Pan to region preset
  const jumpToRegion = (region) => {
    setActiveRegion(region.id);
    const map = mapInstanceRef.current;
    if (map) {
      map.flyTo(region.coords, region.zoom, { duration: 1.2 });
    }
  };

  // Controls actions
  const doZoom = (factor) => {
    const map = mapInstanceRef.current;
    if (map) {
      if (factor > 1) map.zoomIn();
      else map.zoomOut();
    }
  };

  const resetView = () => {
    setActiveRegion("all");
    const map = mapInstanceRef.current;
    if (map) {
      map.flyTo(INDIA_CENTER, compact ? 4.5 : DEFAULT_ZOOM, { duration: 1 });
    }
  };

  const toggleFullscreen = () => {
    if (!wrapRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      wrapRef.current.requestFullscreen?.();
    }
  };

  const formatRadarTime = (ts) => {
    if (!ts) return "Live Now";
    const date = new Date(ts * 1000);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " IST";
  };

  const copyCoordinates = () => {
    if (!inspectedLocation) return;
    const text = `${inspectedLocation.lat.toFixed(4)}, ${inspectedLocation.lng.toFixed(4)}`;
    navigator.clipboard?.writeText(text);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  return h("div", { className: "map-wrap", style: { height }, ref: wrapRef },
    // Leaflet map container
    h("div", {
      ref: mapContainerRef,
      className: "mn-leaflet-container",
      style: { width: "100%", height: "100%" }
    }),

    // Floating Search Box (Top Left)
    showSearch && !compact && h("div", { className: "mn-map-search-wrap" },
      h("div", { className: "mn-map-search-bar" },
        h(Search, { size: 16, className: "mn-search-icon" }),
        h("input", {
          type: "text",
          placeholder: "Search Indian city, district, or coordinates...",
          value: searchQuery,
          onChange: (e) => handleSearchChange(e.target.value),
          onFocus: () => searchQuery.length >= 2 && setSearchOpen(true)
        }),
        searchQuery && h("button", {
          className: "mn-search-clear",
          onClick: () => { setSearchQuery(""); setSearchOpen(false); }
        }, h(X, { size: 14 }))
      ),
      searchOpen && searchResults.length > 0 && h("div", { className: "mn-search-dropdown" },
        searchResults.map((r, i) => h("div", {
          key: i,
          className: "mn-search-item",
          onClick: () => selectSearchResult(r)
        },
          h(MapPin, { size: 14, className: "item-ic" }),
          h("div", { className: "item-info" },
            h("strong", null, r.name),
            h("span", null, `${r.admin1 ? `${r.admin1}, ` : ""}${r.country}`)
          )
        ))
      )
    ),

    // Quick Region Selector Pills (Top Center)
    !compact && h("div", { className: "mn-regions-bar" },
      REGIONS.map((reg) => h("button", {
        key: reg.id,
        className: `mn-region-pill ${activeRegion === reg.id ? "active" : ""}`,
        onClick: () => jumpToRegion(reg),
        title: `Pan to ${reg.name}`
      }, reg.name))
    ),

    // Map Quick Action Controls (Right side)
    showControls && h("div", { className: "map-ctrl" },
      h("button", { className: "mc", title: "Zoom in", onClick: () => doZoom(1.5) }, h(ZoomIn, { size: 16 })),
      h("button", { className: "mc", title: "Zoom out", onClick: () => doZoom(0.67) }, h(ZoomOut, { size: 16 })),
      h("button", { className: "mc", title: "Reset View (All India)", onClick: resetView }, h(Compass, { size: 16 })),
      h("button", { className: "mc", title: "My Location (GPS)", onClick: locateUser }, h(Navigation, { size: 15 })),
      h("button", {
        className: `mc ${layersOpen ? "active" : ""}`,
        title: "Layers & Base Maps",
        onClick: () => setLayersOpen(!layersOpen)
      }, h(Layers, { size: 16 })),
      h("button", { className: "mc", title: "Fullscreen", onClick: toggleFullscreen }, h(Maximize, { size: 15 }))
    ),

    // Floating Layer & Base Map Selector Drawer
    layersOpen && h("div", { className: "mn-layers-panel" },
      h("div", { className: "panel-header" },
        h("span", { className: "title" }, "Map Layers & Basemaps"),
        h("button", { className: "panel-close", onClick: () => setLayersOpen(false) }, h(X, { size: 14 }))
      ),
      h("div", { className: "panel-section" },
        h("div", { className: "sec-lbl" }, "Weather Overlays"),
        h("label", { className: "layer-chk" },
          h("input", { type: "checkbox", checked: showRadar, onChange: (e) => setShowRadar(e.target.checked) }),
          h(CloudRain, { size: 14, className: "chk-ic" }),
          h("span", null, "Doppler Radar"),
          h("span", { className: "live-tag" }, "LIVE")
        ),
        satelliteFrames.length > 0 && h("label", { className: "layer-chk" },
          h("input", {
            type: "checkbox",
            checked: showRadar && activeLayerMode === "satellite",
            onChange: (e) => {
              setShowRadar(true);
              setActiveLayerMode(e.target.checked ? "satellite" : "radar");
            }
          }),
          h(Cloud, { size: 14, className: "chk-ic" }),
          h("span", null, "Satellite Cloud Cover"),
          h("span", { className: "live-tag", style: { background: "#0ea5e9" } }, "SAT")
        ),
        h("label", { className: "layer-chk" },
          h("input", { type: "checkbox", checked: showCityTemps, onChange: (e) => setShowCityTemps(e.target.checked) }),
          h(Thermometer, { size: 14, className: "chk-ic" }),
          h("span", null, "City Surface Temps")
        ),
        h("label", { className: "layer-chk" },
          h("input", { type: "checkbox", checked: showEventMarkers, onChange: (e) => setShowEventMarkers(e.target.checked) }),
          h(ShieldAlert, { size: 14, className: "chk-ic" }),
          h("span", null, "Severe Alerts & Cones")
        )
      ),
      showRadar && h("div", { className: "panel-section" },
        h("div", { className: "sec-lbl" }, `Radar Opacity: ${Math.round(radarOpacity * 100)}%`),
        h("input", {
          type: "range",
          min: "0.2",
          max: "1.0",
          step: "0.05",
          value: radarOpacity,
          onChange: (e) => setRadarOpacity(parseFloat(e.target.value)),
          style: { width: "100%", accentColor: "var(--primary)" }
        })
      ),
      h("div", { className: "panel-section" },
        h("div", { className: "sec-lbl" }, "Base Maps"),
        h("div", { className: "basemap-grid" },
          Object.entries(BASE_MAPS).map(([k, def]) => h("button", {
            key: k,
            className: `basemap-btn ${baseMapKey === k ? "active" : ""}`,
            onClick: () => setBaseMapKey(k)
          },
            h(Globe, { size: 13 }),
            def.name
          ))
        )
      )
    ),

    // Doppler Radar Timeline Player Bar (Bottom)
    showRadarPlayer && showRadar && activeFrames.length > 0 && h("div", { className: "mn-radar-player" },
      h("div", { className: "player-left" },
        h("button", {
          className: "p-btn play-btn",
          onClick: () => setIsPlayingRadar(!isPlayingRadar),
          title: isPlayingRadar ? "Pause" : "Play loop"
        }, isPlayingRadar ? h(Pause, { size: 15 }) : h(Play, { size: 15 })),
        h("div", { className: "radar-meta" },
          h("div", { className: "meta-title" },
            h("span", { className: "live-pulse" }),
            activeLayerMode === "satellite" ? "Satellite Cloud" : "Doppler Radar"
          ),
          h("div", { className: "meta-time" }, formatRadarTime(activeFrames[currentFrameIdx]?.time))
        )
      ),
      h("div", { className: "player-scrub" },
        h("input", {
          type: "range",
          min: 0,
          max: activeFrames.length - 1,
          value: currentFrameIdx,
          onChange: (e) => {
            setIsPlayingRadar(false);
            setCurrentFrameIdx(parseInt(e.target.value, 10));
          },
          className: "radar-range"
        }),
        h("div", { className: "scrub-ticks" },
          h("span", null, "-2h"),
          h("span", null, "-1h"),
          h("span", { className: "now-label" }, "NOW")
        )
      ),
      h("button", {
        className: "p-btn reset-btn",
        title: "Jump to latest frame",
        onClick: () => setCurrentFrameIdx(activeFrames.length - 1)
      }, h(RotateCcw, { size: 14 }))
    ),

    // Click-anywhere Weather Inspector Card (Floating overlay)
    inspectedLocation && h("div", { className: "mn-inspect-card" },
      h("div", { className: "ic-head" },
        h("div", null,
          h("div", { className: "ic-city" }, inspectedLocation.city),
          h("div", { className: "ic-sub" }, inspectedLocation.state)
        ),
        h("div", { style: { display: "flex", alignItems: "center", gap: 6 } },
          h("button", {
            className: "ic-action-btn",
            onClick: copyCoordinates,
            title: copiedCoords ? "Copied!" : "Copy Lat/Lng"
          }, copiedCoords ? h(Check, { size: 13, color: "#16a34a" }) : h(Copy, { size: 13 })),
          h("button", {
            className: "ic-close",
            onClick: () => setInspectedLocation(null),
            title: "Close"
          }, h(X, { size: 14 }))
        )
      ),
      h("div", { className: "ic-body" },
        h("div", { className: "ic-main-row" },
          h("div", { className: "ic-temp-box" },
            h("span", { className: "temp-emoji" }, getWeatherInfo(inspectedLocation.current?.weather_code).emoji),
            h("span", { className: "temp-val" }, `${Math.round(inspectedLocation.current?.temperature_2m ?? 0)}°C`)
          ),
          h("div", { className: "ic-cond-box" },
            h("div", { className: "cond-label" }, getWeatherInfo(inspectedLocation.current?.weather_code).label),
            h("div", { className: "feels-label" },
              `Feels like ${Math.round(inspectedLocation.current?.apparent_temperature ?? inspectedLocation.current?.temperature_2m ?? 0)}°C`
            )
          )
        ),
        h("div", { className: "ic-grid" },
          h("div", { className: "grid-stat" },
            h(Wind, { size: 14, className: "stat-ic" }),
            h("span", { className: "stat-k" }, "Wind"),
            h("strong", { className: "stat-v" }, `${inspectedLocation.current?.wind_speed_10m ?? 0} km/h`)
          ),
          h("div", { className: "grid-stat" },
            h(Droplets, { size: 14, className: "stat-ic" }),
            h("span", { className: "stat-k" }, "Humidity"),
            h("strong", { className: "stat-v" }, `${inspectedLocation.current?.relative_humidity_2m ?? 0}%`)
          ),
          h("div", { className: "grid-stat" },
            h(CloudRain, { size: 14, className: "stat-ic" }),
            h("span", { className: "stat-k" }, "Rain"),
            h("strong", { className: "stat-v" }, `${inspectedLocation.current?.precipitation ?? 0} mm`)
          ),
          h("div", { className: "grid-stat" },
            h(Gauge, { size: 14, className: "stat-ic" }),
            h("span", { className: "stat-k" }, "Pressure"),
            h("strong", { className: "stat-v" }, `${Math.round(inspectedLocation.current?.surface_pressure ?? 1013)} hPa`)
          )
        ),
        inspectedLocation.daily && h("div", { className: "ic-forecast" },
          h("div", { className: "fc-title" }, "3-Day Outlook"),
          h("div", { className: "fc-row" },
            inspectedLocation.daily.time?.map((t, idx) => h("div", { key: idx, className: "fc-col" },
              h("div", { className: "fc-day" }, idx === 0 ? "Today" : idx === 1 ? "Tomorrow" : "Day 3"),
              h("div", { className: "fc-icon" }, getWeatherInfo(inspectedLocation.daily.weather_code[idx]).emoji),
              h("div", { className: "fc-temps" },
                h("span", { className: "hi" }, `${Math.round(inspectedLocation.daily.temperature_2m_max[idx])}°`),
                h("span", { className: "lo" }, `${Math.round(inspectedLocation.daily.temperature_2m_min[idx])}°`)
              )
            ))
          )
        ),
        h("button", {
          className: "btn primary sm full",
          style: { marginTop: 4, width: "100%", justifyContent: "center" },
          onClick: () => go("citizen")
        }, "Submit Citizen Weather Report")
      )
    ),

    // Live Legend & Radar dBZ Scale (Bottom Left)
    legend && h("div", { className: "map-legend" },
      h("div", { className: "lg-header" },
        h("span", { className: "lg-title" }, "Weather Intelligence"),
        h("span", { className: "lg-sync" },
          h("span", { className: "pulse-green" }),
          "Live Synced"
        )
      ),
      h("div", { className: "lg-grid" },
        h("div", { className: "lg-item" },
          h("span", { className: "swatch", style: { background: "#ef4444" } }),
          "Critical Flood / Cyclone"
        ),
        h("div", { className: "lg-item" },
          h("span", { className: "swatch", style: { background: "#f97316" } }),
          "Heavy Rain / Heatwave"
        ),
        h("div", { className: "lg-item" },
          h("span", { className: "swatch", style: { background: "#8b5cf6" } }),
          "Thunderstorm / Squall"
        ),
        h("div", { className: "lg-item" },
          h("span", { className: "swatch", style: { background: "#06b6d4" } }),
          "Moderate Alert"
        )
      ),
      // Real-time Doppler Reflectivity / dBZ Intensity Bar
      showRadar && h("div", { className: "mn-radar-legend" },
        h("div", { className: "dbz-head" },
          h("span", null, "Radar Reflectivity (dBZ)"),
          h("span", { className: "dbz-scale-lbl" }, "Light → Severe")
        ),
        h("div", { className: "dbz-ramp" }),
        h("div", { className: "dbz-labels" },
          h("span", null, "15 dBZ"),
          h("span", null, "30"),
          h("span", null, "45"),
          h("span", null, "60+ dBZ")
        )
      )
    )
  );
}

export { IndiaMap };

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const HOST = '127.0.0.1';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.webp': 'image/webp'
};

let supabase = null;
try {
  const { createClient } = require('@supabase/supabase-js');
  const supabaseUrl = 'https://rblcrsboalpuhofaeqol.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJibGNyc2JvYWxwdWhvZmFlcW9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2ODM3NTQsImV4cCI6MjEwNDI1OTc1NH0.dKh0sPbzAlKpPxP0KSVb3YSSVYhbEdPTA5gufHxmHqM';
  supabase = createClient(supabaseUrl, supabaseKey);
} catch (e) {
  console.warn("Supabase init warning in server.js:", e.message);
}

const server = http.createServer((req, res) => {
  // Global CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Parse URL and strip query strings/hashes
  const parsedUrl = new URL(req.url, `http://${req.headers.host || HOST}`);
  let pathname = decodeURIComponent(parsedUrl.pathname);

  // Ingest API endpoint for citizen reports
  if (req.method === 'POST' && pathname === '/ingest') {
    let bodyStr = '';
    req.on('data', chunk => { bodyStr += chunk; });
    req.on('end', async () => {
      try {
        const payload = JSON.parse(bodyStr || '{}');
        const text = payload.text || '';
        const lower = text.toLowerCase();

        // Categorization heuristic
        let event = 'Rainfall';
        if (lower.includes('flood') || lower.includes('waterlog') || lower.includes('submerged') || lower.includes('overflow')) event = 'Flooding';
        else if (lower.includes('thunder') || lower.includes('lightning') || lower.includes('toofan')) event = 'Thunderstorm';
        else if (lower.includes('heat') || lower.includes('loo') || lower.includes('hot')) event = 'Heatwave';
        else if (lower.includes('fog') || lower.includes('smog') || lower.includes('dhund')) event = 'Fog';
        else if (lower.includes('dust') || lower.includes('aandhi')) event = 'Dust Storm';
        else if (lower.includes('wind') || lower.includes('cyclone') || lower.includes('gale')) event = 'Strong Winds';

        // City & State heuristic
        let city = 'Raipur';
        let state = 'Chhattisgarh';
        if (lower.includes('mumbai') || lower.includes('andheri') || lower.includes('dadar') || lower.includes('bandra') || lower.includes('kurla')) {
          city = 'Mumbai'; state = 'Maharashtra';
        } else if (lower.includes('delhi') || lower.includes('ncr') || lower.includes('connaught')) {
          city = 'New Delhi'; state = 'Delhi';
        } else if (lower.includes('bengaluru') || lower.includes('bangalore')) {
          city = 'Bengaluru'; state = 'Karnataka';
        } else if (lower.includes('kolkata') || lower.includes('howrah')) {
          city = 'Kolkata'; state = 'West Bengal';
        } else if (lower.includes('chennai')) {
          city = 'Chennai'; state = 'Tamil Nadu';
        }

        const reportLat = payload.lat || 21.251;
        const reportLon = payload.lon || 81.629;

        // --- LIVE WEATHER SENSOR VERIFICATION ---
        let calculatedTrust = 65;
        let calculatedStatus = "Suspicious";

        try {
          const wResp = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${reportLat}&longitude=${reportLon}&current=temperature_2m,precipitation,weather_code,wind_speed_10m`);
          if (wResp.ok) {
            const wData = await wResp.json();
            const curr = wData.current || {};
            const p = curr.precipitation || 0;
            const t = curr.temperature_2m || 25;
            const w = curr.wind_speed_10m || 0;
            const code = curr.weather_code || 0;

            const evLower = event.toLowerCase();
            if (evLower.includes('flood') || evLower.includes('waterlog')) {
              if (p >= 15.0) {
                calculatedTrust = 94;
                calculatedStatus = "Verified";
              } else {
                calculatedTrust = 15;
                calculatedStatus = "Rejected";
              }
            } else if (evLower.includes('rain') || evLower.includes('thunderstorm')) {
              if (p >= 2.0) {
                calculatedTrust = 90;
                calculatedStatus = "Verified";
              } else {
                calculatedTrust = 30;
                calculatedStatus = "Rejected";
              }
            } else if (evLower.includes('heatwave') || evLower.includes('heat')) {
              if (t >= 35.0) {
                calculatedTrust = 90;
                calculatedStatus = "Verified";
              } else {
                calculatedTrust = 15;
                calculatedStatus = "Rejected";
              }
            } else if (evLower.includes('cyclone') || evLower.includes('storm')) {
              if (w >= 50.0) {
                calculatedTrust = 90;
                calculatedStatus = "Verified";
              } else {
                calculatedTrust = 15;
                calculatedStatus = "Rejected";
              }
            } else {
              calculatedTrust = 75;
              calculatedStatus = "Verified";
            }
          }
        } catch (we) {
          console.warn("Weather verification in ingest warning:", we);
        }

        // Sensationalism & clickbait heuristics
        const clickbaits = ["omg", "shocking", "apocalypse", "deadly", "crazy", "fake", "prank"];
        if (clickbaits.some(word => lower.includes(word))) {
          calculatedTrust = Math.max(5, calculatedTrust - 20);
          if (calculatedTrust < 50) calculatedStatus = "Rejected";
        }

        let dbId = null;
        if (supabase) {
          const insertPayload = {
            event_type: event,
            state: state,
            city: city,
            description: text || `${event} reported by citizen`,
            latitude: reportLat,
            longitude: reportLon,
            media_url: payload.media_url || null,
            status: calculatedStatus,
            trust_score: calculatedTrust
          };
          const { data, error } = await supabase.from('weather_reports').insert([insertPayload]).select();
          if (data && data[0]) dbId = data[0].id;
          if (error) console.warn("Supabase ingest error:", error);
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          success: true, 
          message: 'Report ingested and AI verified successfully', 
          id: dbId || Date.now(),
          trust_score: calculatedTrust,
          status: calculatedStatus
        }));
      } catch (err) {
        console.error("Ingest parse error:", err);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  if (pathname === '/') {
    pathname = '/index.html';
  }

  // Prevent directory traversal
  const safePath = path.normalize(pathname).replace(/^(\.\.[/\\])+/, '');
  const filePath = path.join(__dirname, safePath);

  // Ensure filePath stays within __dirname
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`MausamNet server running at http://${HOST}:${PORT}/`);
});

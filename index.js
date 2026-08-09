const express = require('express');
const app = express();

// Middleware parsing raw body khusus DRM Challenge
app.use(express.raw({ type: '*/*', limit: '2mb' }));

// CORS Header
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Main Handler
app.all(['/', '/license'], async (req, res) => {
  try {
    const id = req.query.id || '1';
    const id20 = id.padStart(20, '0');

    // Default nilai fallback jika parameter tidak dikirim
    const server = req.query.server || 'd2xz2v5wuvgur6';
    const dash = req.query.dash || '997ce8767b604fae9fce05379b3b8b3a';
    const hls = req.query.hls || '19361262a9cc45a6aae6c58420568734';

    const token = process.env.VISION_TOKEN || req.query.token || "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOjQ0ODIyNjc4LCJ0eSI6IlVTRVIiLCJwY2kiOiI0NDYwNTE3NyIsImh3SWQiOiI5NzIyNGNkNy04YjhjLTRjMzctYTA4ZS0wMjBkNDE1OGNhNzAiLCJleHAiOjE3ODYyNDA3MzcsInBuIjoiTU5DIiwiY2lkIjoyMTM0MzUzNzR9.dwgIf-hDdMIwuQhGlM99jNm-2mXdb7Og2JgaQnim7JY";

    const targetUrl = `multirights:mediapackage/live//EG_${server}/DASH/${dash}/HLS/${hls}/${id20}`;
    const encodedTargetUrl = encodeURIComponent(targetUrl);

    const apiUrl = `https://www.visionplus.id/streamlocators/multirights/getPlayableUrlAndLicense` +
      `?adsProfile=free&drm=WV&packaging=DASH` +
      `&provisioningData=eyJwcm92aXNpb25pbmciOlt7InN5c3RlbSI6InZlcmltYXRyaXgiLCJkYXRhIjpbeyJuYW1lIjoidnVpZDIsInZhbHVlIjoiOTcyMjRjZDctOGI4Yy00YzM3LWEwOGUtMDIwZDQxNThjYTcwIn1dfV19` +
      `&url=${encodedTargetUrl}&userSessionToken=${token}`;

    // Dynamic Native Fetch
    const apiRes = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "accept": "*/*",
        "authorization": token,
        "iris-app-mode": "Normal",
        "iris-app-version": "11.4.13(0)_prd",
        "iris-device-class": "PC",
        "iris-device-region": "Indonesia",
        "iris-device-status": "ACTIVE",
        "iris-device-type": "WINDOWS/CHROME",
        "iris-hw-device-id": "97224cd7-8b8c-4c37-a08e-020d4158ca70",
        "iris-profile-id": "27856765"
      }
    });

    const data = await apiRes.json();
    const licenseUrl = data?.videos?.[0]?.licenses?.[0]?.url;

    if (!licenseUrl) {
      return res.status(404).json({ error: "License URL Not Found", idRequested: id });
    }

    // Redirect jika GET biasa
    if (req.method === 'GET') {
      return res.redirect(307, licenseUrl);
    }

    // Proxy POST DRM Challenge dari Player
    const rawBodyBuffer = req.body && Buffer.isBuffer(req.body) ? req.body : Buffer.alloc(0);

    const vmxResponse = await fetch(licenseUrl, {
      method: 'POST',
      headers: {
        'Accept': '*/*',
        'Content-Type': req.headers['content-type'] || 'application/octet-stream',
        'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      },
      body: rawBodyBuffer
    });

    const arrayBuffer = await vmxResponse.arrayBuffer();
    const licenseBuffer = Buffer.from(arrayBuffer);

    res.status(vmxResponse.status);
    res.set('Content-Type', vmxResponse.headers.get('content-type') || 'application/octet-stream');
    return res.send(licenseBuffer);

  } catch (err) {
    console.error("Function Error:", err);
    return res.status(500).json({ error: "Internal Server Error", message: err.message });
  }
});

module.exports = app;

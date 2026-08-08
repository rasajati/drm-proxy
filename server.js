const express = require('express');
const fetch = require('node-fetch');
const app = express();

// CORS Header
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', '*');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Helper untuk membaca Stream Body Binary saat POST
const getRawBody = (req) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', (err) => reject(err));
  });
};

app.all('/license', async (req, res) => {
  try {
    const { id = '1', server = 'd2xz2v5wuvgur6', dash = '997ce8767b604fae9fce05379b3b8b3a', hls = '19361262a9cc45a6aae6c58420568734' } = req.query;

    const id20 = id.padStart(20, '0');
    const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOjQ0ODIyNjc4LCJ0eSI6IlVTRVIiLCJwY2kiOiI0NDYwNTE3NyIsImh3SWQiOiI5NzIyNGNkNy04YjhjLTRjMzctYTA4ZS0wMjBkNDE1OGNhNzAiLCJleHAiOjE3ODYyNDA3MzcsInBuIjoiTU5DIiwiY2lkIjoyMTM0MzUzNzR9.dwgIf-hDdMIwuQhGlM99jNm-2mXdb7Og2JgaQnim7JY";

    const targetUrl = `multirights:mediapackage/live//EG_${server}/DASH/${dash}/HLS/${hls}/${id20}`;
    const encodedTargetUrl = encodeURIComponent(targetUrl);

    const apiUrl = `https://www.visionplus.id/streamlocators/multirights/getPlayableUrlAndLicense` +
      `?adsProfile=free&drm=WV&packaging=DASH` +
      `&provisioningData=eyJwcm92aXNpb25pbmciOlt7InN5c3RlbSI6InZlcmltYXRyaXgiLCJkYXRhIjpbeyJuYW1lIjoidnVpZDIsInZhbHVlIjoiOTcyMjRjZDctOGI4Yy00YzM3LWEwOGUtMDIwZDQxNThjYTcwIn1dfV19` +
      `&url=${encodedTargetUrl}&userSessionToken=${token}`;

    // Ambil URL Lisensi Verimatrix
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
      return res.status(404).json({ error: "License URL Not Found" });
    }

    // =========================================================
    // JALUR 1: JIKA DIBUKA DI ADDRESS BAR BROWSER (HTTP GET)
    // =========================================================
    if (req.method === 'GET') {
      console.log(`[GET TEST] Direct Redirect 307 ke Verimatrix URL`);
      return res.redirect(307, licenseUrl);
    }

    // =========================================================
    // JALUR 2: JIKA DIPANGGIL OLEH PLAYER VIDEO (HTTP POST)
    // =========================================================
    const rawBodyBuffer = await getRawBody(req);
    
    const vmxResponse = await fetch(licenseUrl, {
      method: 'POST',
      headers: {
        'Accept': '*/*',
        'Content-Type': req.headers['content-type'] || 'application/octet-stream',
        'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      },
      body: rawBodyBuffer
    });

    const licenseBuffer = await vmxResponse.buffer();

    res.status(vmxResponse.status);
    res.set('Content-Type', vmxResponse.headers.get('content-type') || 'application/octet-stream');
    return res.send(licenseBuffer);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server Node.js berjalan di http://localhost:${PORT}`);
});
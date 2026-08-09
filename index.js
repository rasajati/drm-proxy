const { URL } = require('url');

// Helper membaca Raw Binary Body dari Shaka Player
const getRawBody = (req) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', (err) => reject(err));
  });
};

module.exports = async (req, res) => {
  // 1. CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }

  // 2. Abaikan Request Favicon / Icon Browser
  if (req.url.includes('favicon.ico') || req.url.includes('favicon.png')) {
    res.statusCode = 204;
    return res.end();
  }

  try {
    // --- PERBAIKAN BACA QUERY ATTEMPT SAFELY ---
    const host = req.headers.host || 'localhost';
    const parsedUrl = new URL(req.url, `http://${host}`);
    const queryParams = parsedUrl.searchParams;

    // Ambil input dari query parameter address bar
    const id = queryParams.get('id') || (req.query && req.query.id) || '3';
    const server = queryParams.get('server') || (req.query && req.query.server) || 'd2xz2v5wuvgur6';
    const dash = queryParams.get('dash') || (req.query && req.query.dash) || '997ce8767b604fae9fce05379b3b8b3a';
    const hls = queryParams.get('hls') || (req.query && req.query.hls) || '19361262a9cc45a6aae6c58420568734';
    const tokenQuery = queryParams.get('token') || (req.query && req.query.token);

    const id20 = String(id).padStart(20, '0');
    
    // PERBAHARUI TOKEN INI JIKA TERJADI ERROR VISION+
    const token = process.env.VISION_TOKEN || tokenQuery || "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOjQ0ODIyNjc4LCJ0eSI6IlVTRVIiLCJwY2kiOiI0NDYwNTE3NyIsImh3SWQiOiI5NzIyNGNkNy04YjhjLTRjMzctYTA4ZS0wMjBkNDE1OGNhNzAiLCJleHAiOjE3ODYyNTI5MTksInBuIjoiTU5DIiwiY2lkIjoyMTM0MzUzNzR9.Ou32ahAzBg91YcaSm7FAR45QpoCHGl-aBKBIInF7fXw";

    const targetUrl = `multirights:mediapackage/live//EG_${server}/DASH/${dash}/HLS/${hls}/${id20}`;
    const encodedTargetUrl = encodeURIComponent(targetUrl);

    const apiUrl = `https://www.visionplus.id/streamlocators/multirights/getPlayableUrlAndLicense` +
      `?adsProfile=free&drm=WV&packaging=DASH` +
      `&provisioningData=eyJwcm92aXNpb25pbmciOlt7InN5c3RlbSI6InZlcmltYXRyaXgiLCJkYXRhIjpbeyJuYW1lIjoidnVpZDIsInZhbHVlIjoiOTcyMjRjZDctOGI4Yy00YzM3LWEwOGUtMDIwZDQxNThjYTcwIn1dfV19` +
      `&url=${encodedTargetUrl}&userSessionToken=${token}`;

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

    if (!apiRes.ok) {
      res.statusCode = apiRes.status;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ 
        error: "Vision+ API Error", 
        status: apiRes.status,
        message: "Token Vision+ kemungkinan expired/invalid." 
      }));
    }

    const data = await apiRes.json();
    const licenseUrl = data?.videos?.[0]?.licenses?.[0]?.url;

    if (!licenseUrl) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ error: "License URL Not Found", detail: data }));
    }

    // JALUR GET: Untuk browser (Standard Redirect 307)
    if (req.method === 'GET') {
      res.writeHead(307, { Location: licenseUrl });
      return res.end();
    }

    // JALUR POST: Untuk Player (Proxy DRM Binary)
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

    const arrayBuffer = await vmxResponse.arrayBuffer();
    const licenseBuffer = Buffer.from(arrayBuffer);

    res.statusCode = vmxResponse.status;
    res.setHeader('Content-Type', vmxResponse.headers.get('content-type') || 'application/octet-stream');
    return res.end(licenseBuffer);

  } catch (err) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ error: err.message }));
  }
};

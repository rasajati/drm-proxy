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

  // 2. Abaikan Request Favicon Browser
  if (req.url.includes('favicon.ico') || req.url.includes('favicon.png')) {
    res.statusCode = 204;
    return res.end();
  }

  try {
    const query = req.query || {};
    
    // Ambil ID dari URL query
    const id = query.id || '1';
    const id20 = id.padStart(20, '0');

    // Murni parameter custom (bisa NULL jika tidak dikirim)
    const server = query.server ? `EG_${query.server}` : '';
    const dash = query.dash ? `/DASH/${query.dash}` : '';
    const hls = query.hls ? `/HLS/${query.hls}` : '';

    // KETENTUAN UTAMA: Hanya Token yang Wajib Ada
    const token = query.token || "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOjQ0ODIyNjc4LCJ0eSI6IlVTRVIiLCJwY2kiOiI0NDYwNTE3NyIsImh3SWQiOiI5NzIyNGNkNy04YjhjLTRjMzctYTA4ZS0wMjBkNDE1OGNhNzAiLCJleHAiOjE3ODYyNDA3MzcsInBuIjoiTU5DIiwiY2lkIjoyMTM0MzUzNzR9.dwgIf-hDdMIwuQhGlM99jNm-2mXdb7Og2JgaQnim7JY";

    // Menyusun Target URL tanpa memaksa nilai default (server, dash, hls opsional/NULL)
    let targetUrl = `multirights:mediapackage/live/`;
    if (server) targetUrl += `/${server}`;
    if (dash) targetUrl += `${dash}`;
    if (hls) targetUrl += `${hls}`;
    targetUrl += `/${id20}`;

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
        message: "Vision+ menolak permintaan. Pastikan token aktif/valid." 
      }));
    }

    const data = await apiRes.json();
    const licenseUrl = data?.videos?.[0]?.licenses?.[0]?.url;

    if (!licenseUrl) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ 
        error: "License URL Not Found", 
        idRequested: id,
        detail: data 
      }));
    }

    // JALUR GET: Untuk browser test (307 Redirect)
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

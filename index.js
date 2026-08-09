const express = require('express');
const fetch = require('node-fetch');
const app = express();

// Database Internal Channel Vision+
// Format: ID: [server, dash]
const CHANNEL_DB = {
  "1": ["d2xz2v5wuvgur6", "997ce8767b604fae9fce05379b3b8b3a"],
  "2": ["d2xz2v5wuvgur6", "d6b026ad50f14b7f9af5ddd5450007d4"],
  "3": ["d2tjypxxy769fn", "b8b9b1d5f80f45649b4a3619291551ab"],
  "4": ["d2tjypxxy769fn", "7b0404cd6a8a4a908123f10774854e46"],
  "5": ["d2xz2v5wuvgur6", "8c2df39f9b2842fbb997b89378841ad9"],
  "6": ["d2xz2v5wuvgur6", "7a69cfc9e135493f87ac4efd63000429"],
  "7": ["d2tjypxxy769fn", "0fd7b7d368bc44bc9b4dece20acc3e33"],
  "10": ["d84q7nw4qf3j3", "0a6c6b1534444ab4bd903af8761e6747"],
  "11": ["d3b0v7fggu5zwm", "abf3e254818c4608aab8aa109a972203"],
  "12": ["d3b0v7fggu5zwm", "f3df48faafaf4198a65b9763140fce30"],
  "13": ["d2xz2v5wuvgur6", "dafcaf8b26064ae7b27702088240b535"],
  "14": ["d2tjypxxy769fn", "fd4360b1c12c4375848c8f085fd51d41"],
  "15": ["d2xz2v5wuvgur6", "36d936f64cd2482ebc077567dbcf0919"],
  "16": ["d84q7nw4qf3j3", "b642f32e396042f981d83fbb5f472272"],
  "17": ["d2tjypxxy769fn", "9cebfb76975f470d8d3dff0b3d27bdd9"],
  "18": ["d2tjypxxy769fn", "744044c3985142399fbd466f9f3fd8fa"],
  "23": ["d84q7nw4qf3j3", "6941abe8211d4ce8bd13d9b96bdd1630"],
  "24": ["d3b0v7fggu5zwm", "77641c37b4834a9db823ec5137774973"],
  "25": ["d2tjypxxy769fn", "1f05c642353a4a778d8a544837e1b49c"],
  "26": ["d2tjypxxy769fn", "44a2d1ab71a740babb233cf14832c59d"],
  "27": ["d3b0v7fggu5zwm", "f16b53f0d5ed459da208c459049c9bb0"],
  "28": ["d3b0v7fggu5zwm", "9688c51b534d4165bf4b0b328e53b980"],
  "29": ["d84q7nw4qf3j3", "7819c09ece974a7582eed4770bf60e65"],
  "30": ["d84q7nw4qf3j3", "980cfe26ff00479c97eb8057a1129c7f"],
  "36": ["d3b0v7fggu5zwm", "e992e986a88346c18a5dcc4fbcdae6b9"],
  "37": ["d84q7nw4qf3j3", "c70975aaa68d47f2a38799e6730a7816"],
  "38": ["d3b0v7fggu5zwm", "bde0a6d8d3fd4d77ae5093ad2e6699dc"],
  "39": ["d2tjypxxy769fn", "782400332c96440598260730a864bc6f"],
  "40": ["d2xz2v5wuvgur6", "47c895ca72544fcfa4221c499b555a10"],
  "41": ["d2tjypxxy769fn", "3c619ecc120b46e999d1eaa627cc544f"],
  "42": ["d2xz2v5wuvgur6", "de93893d01e6446daaf052a7fec694fc"],
  "44": ["d2xz2v5wuvgur6", "fd25e662b7154c60a94f7c061573ba2d"],
  "45": ["d84q7nw4qf3j3", "6bdbe6ce7f034807aba5f09bed048b05"],
  "46": ["d2tjypxxy769fn", "096d5cf064294e7ea3a7f59ee2899669"],
  "47": ["d2xz2v5wuvgur6", "81cb1af2ea4d4842a94f1c83957b4cd2"],
  "48": ["d84q7nw4qf3j3", "45c0752c6b6b4397b80243ac9fed96fd"],
  "49": ["d2xz2v5wuvgur6", "751a0982779f4edd904205eb351e220d"],
  "50": ["d3b0v7fggu5zwm", "65432a4c12ca4a52abf473a0e41d7c7e"],
  "54": ["d84q7nw4qf3j3", "dc63bd198bc44193b570e0567ff5b22c"],
  "56": ["d3b0v7fggu5zwm", "9041826689ae4f9c9619576d411fa989"],
  "57": ["d84q7nw4qf3j3", "198f7febb48c4c909d62977d88c195b0"],
  "58": ["d2xz2v5wuvgur6", "2a5668fb3b9f4e34ab7c02cdc6ef56db"],
  "60": ["d84q7nw4qf3j3", "27163af9499b4bcca2da96677b158efe"],
  "63": ["d3b0v7fggu5zwm", "8554b3cb938e44038093df2d65080932"],
  "64": ["d2tjypxxy769fn", "3fe6d9eb97ed455c942eb8d3d1c2c2e8"],
  "65": ["d84q7nw4qf3j3", "ab3ef0f0e4144c3c8b7e60f1873a3bcc"],
  "67": ["d3b0v7fggu5zwm", "7518da9041c4414d86f173daa719152e"],
  "71": ["d84q7nw4qf3j3", "77d7eac1b90247ac9aa745bd2eb47fa8"],
  "72": ["d2tjypxxy769fn", "a90cb773466446b08595007bab12b920"],
  "73": ["d84q7nw4qf3j3", "6dc5412d26ea4e65961c825d866f2a34"],
  "74": ["d84q7nw4qf3j3", "9ec31bcce34848d69d4771270ff23ab9"],
  "75": ["d2tjypxxy769fn", "7a50d44c0a154dd29880c3728fb49a56"],
  "76": ["d2xz2v5wuvgur6", "85b02e02587747058c1940af6aa3d0fa"],
  "77": ["d2xz2v5wuvgur6", "333a9658ed6a4424a92e319114fb7111"],
  "79": ["d3b0v7fggu5zwm", "456143d3b12140e1a872b25f067ddb62"],
  "80": ["d84q7nw4qf3j3", "1880fc1b32d3449196e80345f6cd5918"],
  "87": ["d2xz2v5wuvgur6", "873c24d3946048f68e459250f1d2fd98"],
  "88": ["d3b0v7fggu5zwm", "8cf72e61626f4361a45c57ce6f2fdad8"],
  "89": ["d3b0v7fggu5zwm", "17c724036c5f4615bd0b8093126b5c44"],
  "92": ["d2tjypxxy769fn", "4cae4723d4d54a7fb71020bd7939a202"],
  "93": ["d84q7nw4qf3j3", "010bb28c19b64975b318d3b00f58b18b"],
  "95": ["d2xz2v5wuvgur6", "384f26c1c3b74ce09fa60bed24719b79"],
  "101": ["d2tjypxxy769fn", "c169ca1dcbe249c5bf233aabc3db4a4f"],
  "102": ["d84q7nw4qf3j3", "4e5b2a283adf462c8b6b55b2ef059fac"],
  "103": ["d2tjypxxy769fn", "99b07f39f4964b7cb9bfc092b51af734"],
  "104": ["d3b0v7fggu5zwm", "936ed6f98448469b924a0ce456586651"],
  "105": ["d2xz2v5wuvgur6", "15500e8f0dc44058ba0431d39a8fed57"],
  "112": ["d2tjypxxy769fn", "89a6e4261cd7470f83e5869e90440cff"],
  "113": ["d3b0v7fggu5zwm", "d2c68a3dfb644808b416bd90dcc92d5f"],
  "114": ["d2xz2v5wuvgur6", "6f5596513af749c19d0bcdac013dda3c"],
  "115": ["d2xz2v5wuvgur6", "63c0da12bb4d48afbaf053f51dff2353"],
  "119": ["d3b0v7fggu5zwm", "b4814ae93ca84dd3bb5b0aff76ca263f"],
  "120": ["d2tjypxxy769fn", "46d9cf39b9a84183b8d5022ac8f4bc41"],
  "121": ["d2tjypxxy769fn", "73b7057c72da4615888a11b02a6cbb3c"],
  "122": ["d6m3sfa7e58z5", "3b0660e05eed4d769521eb0275aab3ab"],
  "123": ["d6m3sfa7e58z5", "cfca527d0f16403396a71b2d3d54c32f"],
  "124": ["d6m3sfa7e58z5", "a265695db5cb461095cbfefc02ad793b"],
  "125": ["d6m3sfa7e58z5", "2e55bc8199044c27b1dbb827af65a04f"],
  "126": ["d6m3sfa7e58z5", "fe4d00f07e2f43b789102b84b4d243a9"],
  "130": ["d84q7nw4qf3j3", "7d38a4525dfa42b08a94c22c173061da"],
  "131": ["d3b0v7fggu5zwm", "e8d3f81aae4b46fbacf545140b86f2c4"],
  "132": ["d3b0v7fggu5zwm", "444f3d7b909d470f9f5a55c781a79728"],
  "133": ["d2xz2v5wuvgur6", "3212c95b42154b6284671f28cc2c943c"],
  "134": ["d2tjypxxy769fn", "db34a1b61f414d2181c29f1892bc8d0b"],
  "137": ["d84q7nw4qf3j3", "a8f14e34c687494fb1454b88742db085"],
  "138": ["d2tjypxxy769fn", "a61250017f23459692bf28a6841cf087"],
  "139": ["d2xz2v5wuvgur6", "623c771560e443f2920ea5be99016b7e"],
  "142": ["d84q7nw4qf3j3", "c20d75deb06f401aa89681a9e5054de7"],
  "143": ["d2tjypxxy769fn", "b26eb25311954fcb8ece0c1923c6cce2"],
  "144": ["d2xz2v5wuvgur7", "dd9cfc9ae76a4f8abbaa89708a915e38"],
  "146": ["d2tjypxxy769fn", "3c64eec3b1594ec98aa758ed334fa6a0"],
  "147": ["d2xz2v5wuvgur6", "498b57e974a843d28ea1a393603e5318"],
  "148": ["d2tjypxxy769fn", "be2bcc4b75e348e5b331fc5f99aa3daf"],
  "149": ["d84q7nw4qf3j3", "b1d58fabf2764d52aa1e130f4a45d2af"],
  "150": ["d2xz2v5wuvgur6", "451249e7e3004f5aba228da284c2a649"],
  "151": ["d2tjypxxy769fn", "23af54d57d8a447dbf0621ec71d89e7e"],
  "152": ["d3b0v7fggu5zwm", "7295b950a9b44dd2bf622a7d7d25dbd3"],
  "153": ["d84q7nw4qf3j3", "099aba2d60b44679915cd56f303b975d"],
  "154": ["d3b0v7fggu5zwm", "96e20532df53449ab254f765073ec866"],
  "155": ["d3b0v7fggu5zwm", "9757e131659a4ab8ba08d448c4a3779e"],
  "156": ["d84q7nw4qf3j3", "c3e6d7241fbf404082087774d7221635"],
  "157": ["d2tjypxxy769fn", "39a34211e80145678ce1616b52368f99"],
  "158": ["d3b0v7fggu5zwm", "a1dc0cb4b4f14a3094088b16366bbeed"],
  "159": ["d2xz2v5wuvgur6", "2c21b0f4792a42a09a7ed5fee3f010c0"],
  "160": ["d2tjypxxy769fn", "63e4d9f383cb4ca59317c7be9407e228"],
  "161": ["d2xz2v5wuvgur6", "ccc51c0317284496b6cde9f7bd670b80"],
  "162": ["d84q7nw4qf3j3", "8decf3562fe943e88872ef868d6fb6a5"],
  "163": ["d84q7nw4qf3j3", "980cfe26ff00479c97eb8057a1129c7f"],
  "164": ["d2tjypxxy769fn", "6f059cfe2653405aab54a7887f92ac39"],
  "165": ["d84q7nw4qf3j3", "6c075b570f99473fa6715bb399bc9571"],
  "201": ["d3b0v7fggu5zwm", "c0131a4c400d429fb870ed033ec90e8e"],
  "202": ["d84q7nw4qf3j3", "c815e827dfb640619d594dd6f5aee86d"],
  "203": ["d2tjypxxy769fn", "229e5579891148208031e5755743e00a"],
  "204": ["d2xz2v5wuvgur6", "db82aed7a1864935b8b8f960651c3db7"],
  "207": ["d2xz2v5wuvgur7", "8cf72e61626f4361a45c57ce6f2fdad8"],
  "1002": ["d3b0v7fggu5zwm", "d2c68a3dfb644808b416bd90dcc92d5f"],
  "1011": ["d3b0v7fggu5zwm", "d2c68a3dfb644808b416bd90dcc92d5f"],
  "1012": ["d2tjypxxy769fn", "a90cb773466446b08595007bab12b920"],
  "1013": ["d2xz2v5wuvgur6", "997ce8767b604fae9fce05379b3b8b3a"],
  "1014": ["d84q7nw4qf3j3", "c20d75deb06f401aa89681a9e5054de7"]
};

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

// Melayani Endpoint Root (/) dan juga (/license) agar fleksibel
app.all(['/', '/license'], async (req, res) => {
  try {
    const id = req.query.id || '1';
    const id20 = id.padStart(20, '0');

    // Ambil data channel dari DB Internal
    const dbMatch = CHANNEL_DB[id] || ["d2xz2v5wuvgur6", "997ce8767b604fae9fce05379b3b8b3a"];
    const server = req.query.server || dbMatch[0];
    const dash = req.query.dash || dbMatch[1];
    const hls = req.query.hls || '19361262a9cc45a6aae6c58420568734';

    const token = process.env.VISION_TOKEN || req.query.token || "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOjQ0ODIyNjc4LCJ0eSI6IlVTRVIiLCJwY2kiOiI0NDYwNTE3NyIsImh3SWQiOiI5NzIyNGNkNy04YjhjLTRjMzctYTA4ZS0wMjBkNDE1OGNhNzAiLCJleHAiOjE3ODYyNDA3MzcsInBuIjoiTU5DIiwiY2lkIjoyMTM0MzUzNzR9.dwgIf-hDdMIwuQhGlM99jNm-2mXdb7Og2JgaQnim7JY";

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
      return res.status(404).json({ 
        error: "License URL Not Found",
        idRequested: id,
        detail: data 
      });
    }

    // JALUR 1: BROWSER TEST (HTTP GET)
    if (req.method === 'GET') {
      return res.redirect(307, licenseUrl);
    }

    // JALUR 2: PLAYER VIDEO (HTTP POST)
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

    // PENTING: Menggunakan arrayBuffer() agar kompatibel dengan Vercel Node Runtime
    const arrayBuffer = await vmxResponse.arrayBuffer();
    const licenseBuffer = Buffer.from(arrayBuffer);

    res.status(vmxResponse.status);
    res.set('Content-Type', vmxResponse.headers.get('content-type') || 'application/octet-stream');
    return res.send(licenseBuffer);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// EXPORT UNTUK VERCEL SERVERLESS
module.exports = app;

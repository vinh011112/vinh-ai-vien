// api/gemini.js — Proxy gọi Google AI Studio (Gemini Images API) bằng AI_API_KEY (ENV trên Vercel)

function parseDataUrl(dataUrl) {
  if (!dataUrl) return { mime: 'image/jpeg', b64: '' };
  if (!dataUrl.startsWith('data:')) return { mime: 'image/jpeg', b64: dataUrl };
  const m = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  return { mime: (m && m[1]) || 'image/jpeg', b64: (m && m[2]) || '' };
}

function pickB64(json) {
  const a = json?.images?.[0]?.base64 || json?.images?.[0]?.bytesBase64Encoded;
  if (a) return a;
  const b = json?.predictions?.[0]?.bytesBase64Encoded || json?.predictions?.[0]?.image?.base64;
  if (b) return b;
  const c =
    json?.generatedImages?.[0]?.base64 ||
    json?.candidates?.[0]?.content?.parts?.find((p) => p?.inline_data)?.inline_data?.data;
  return c || null;
}

export default async function handler(req, res) {
  // CORS đơn giản (cùng origin thì không cần, nhưng để sẵn)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const API_KEY = process.env.AI_API_KEY;
  if (!API_KEY) return res.status(500).json({ error: 'Missing AI_API_KEY on server' });

  try {
    const { prompt, imageBase64, mode = 'edit' } = req.body || {};

    // 1) EDIT (nếu có ảnh đầu vào)
    if (mode === 'edit' && imageBase64) {
      const { mime, b64 } = parseDataUrl(imageBase64);
      const r = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-edit-001:editImage?key=${API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            edits: [{ image: { inlineData: { mimeType: mime, data: b64 } } }],
            prompt: { text: prompt || 'Enhance the photo' },
            outputMimeType: 'image/png',
            samples: 1,
          }),
        }
      );
      if (r.ok) {
        const j = await r.json();
        const out = pickB64(j);
        if (out) return res.status(200).json({ imageBase64: `data:image/png;base64,${out}` });
      }
      // nếu chưa có quyền edit → rơi xuống generate
    }

    // 2) GENERATE (text -> image)
    const r2 = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:generateImages?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: { text: prompt || 'A beautiful photo, high quality' },
          outputMimeType: 'image/png',
          samples: 1,
        }),
      }
    );
    if (r2.ok) {
      const j = await r2.json();
      const out = pickB64(j);
      if (out) return res.status(200).json({ imageBase64: `data:image/png;base64,${out}` });
    } else {
      // 3) Fallback: một số key chỉ được endpoint tổng quát hơn
      const r3 = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/imagegeneration:generate?key=${API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: prompt || 'A beautiful photo, high quality',
            size: '1024x1024',
            safetyFilterLevel: 'block_most',
          }),
        }
      );
      if (r3.ok) {
        const j = await r3.json();
        const out = pickB64(j);
        if (out) return res.status(200).json({ imageBase64: `data:image/png;base64,${out}` });
      } else {
        return res.status(r2.status).json({ error: await r2.text() });
      }
    }

    return res.status(500).json({ error: 'No image returned from provider' });
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'Unknown error' });
  }
}

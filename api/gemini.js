// api/gemini.js — Bản tối giản: chỉ gọi endpoint phổ quát imagegeneration:generate

async function readErr(res) {
  try {
    const j = await res.clone().json();
    const msg = j?.error?.message || j?.message || JSON.stringify(j).slice(0, 600);
    return `${res.status} ${res.statusText} – ${msg}`;
  } catch {
    const t = await res.text();
    return `${res.status} ${res.statusText} – ${t || 'Unknown error'}`;
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const API_KEY = process.env.AI_API_KEY;
  if (!API_KEY) return res.status(500).json({ error: 'Missing AI_API_KEY on server' });

  try {
    const { prompt } = req.body || {};
    const text = prompt || 'A beautiful, high-quality photo of a tropical beach at sunset';

    const url = `https://generativelanguage.googleapis.com/v1beta/models/imagegeneration:generate?key=${API_KEY}`;
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: text,
        size: '1024x1024',           // có thể đổi: 512x512, 768x768...
        safetyFilterLevel: 'block_most'
      })
    });

    if (!r.ok) {
      const err = await readErr(r);
      return res.status(502).json({ error: err });
    }

    const j = await r.json();
    const b64 =
      j?.predictions?.[0]?.bytesBase64Encoded ||
      j?.predictions?.[0]?.image?.base64 ||
      j?.images?.[0]?.base64 ||
      null;

    if (!b64) return res.status(502).json({ error: 'Provider returned no image data' });
    return res.status(200).json({ imageBase64: `data:image/png;base64,${b64}` });
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'Unknown error' });
  }
}

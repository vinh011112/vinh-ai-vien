// api/gemini.ts — Gọi Gemini Images API (AI Studio) bằng biến môi trường AI_API_KEY
import type { VercelRequest, VercelResponse } from '@vercel/node';

function parseDataUrl(dataUrl: string) {
  if (!dataUrl) return { mime: 'image/jpeg', b64: '' };
  if (!dataUrl.startsWith('data:')) return { mime: 'image/jpeg', b64: dataUrl };
  const m = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  return { mime: m?.[1] || 'image/jpeg', b64: m?.[2] || '' };
}

function pickB64(json: any): string | null {
  // imagen 3.x
  const a = json?.images?.[0]?.base64 || json?.images?.[0]?.bytesBase64Encoded;
  if (a) return a;
  // imagegeneration:generate
  const b = json?.predictions?.[0]?.bytesBase64Encoded || json?.predictions?.[0]?.image?.base64;
  if (b) return b;
  // generic
  const c =
    json?.generatedImages?.[0]?.base64 ||
    json?.candidates?.[0]?.content?.parts?.find((p: any) => p.inline_data)?.inline_data?.data;
  return c || null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const API_KEY = process.env.AI_API_KEY; // <— LẤY KEY TỪ ENV (đặt trong Vercel)
  if (!API_KEY) return res.status(500).json({ error: 'Missing AI_API_KEY on server' });

  try {
    const { prompt, imageBase64, mode = 'edit' } = (req.body || {}) as {
      prompt: string;
      imageBase64?: string;
      mode?: 'edit' | 'generate';
    };

    // 1) EDIT ảnh nếu có ảnh đầu vào (đổi nền, xóa vật thể...)
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
      // nếu chưa được cấp quyền edit → fallback xuống generate
    }

    // 2) GENERATE ảnh từ prompt (text->image)
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
      // 3) Fallback thêm cho vài tài khoản chỉ mở endpoint tổng quát
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
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Unknown error' });
  }
}

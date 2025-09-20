import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS cho frontend gọi
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { prompt, imageBase64 } = req.body || {};
    if (!imageBase64) return res.status(400).json({ error: 'Missing imageBase64' });

    // TODO: gọi API AI bạn chọn ở đây (Gemini ImageFX/Stability/Replicate/HF...).
    // Tạm thời, trả về luôn ảnh gốc để xác nhận đường đi:
    return res.status(200).json({ imageBase64, meta: { prompt } });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Unknown error' });
  }
}

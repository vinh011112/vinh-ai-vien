export default async function handler(req, res) {
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const API_KEY = process.env.AI_API_KEY;
  if (!API_KEY) return res.status(500).json({ error: "Missing AI_API_KEY on server" });

  try {
    const body = await (async () => {
      if (req.body) return req.body;
      const chunks = [];
      for await (const c of req) chunks.push(c);
      const txt = Buffer.concat(chunks).toString("utf8");
      return txt ? JSON.parse(txt) : {};
    })();

    const prompt = body?.prompt || "A high-quality photo of a tropical beach at sunset";
    const url1 = "https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict";
    const r1 = await fetch(url1, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": API_KEY },
      body: JSON.stringify({
        instances: [{ prompt }],
        parameters: { sampleCount: 1 }
      })
    });

    if (r1.ok) {
      const j = await r1.json();
      const p = j?.predictions?.[0];
      const b64 =
        p?.bytesBase64Encoded ||
        p?.image?.imageBytes ||
        p?.image?.bytesBase64Encoded ||
        p?.image?.base64 ||
        j?.generatedImages?.[0]?.image?.imageBytes ||
        j?.generatedImages?.[0]?.image?.bytesBase64Encoded ||
        j?.generatedImages?.[0]?.image?.base64 ||
        null;
      if (b64) return res.status(200).json({ imageBase64: "data:image/png;base64," + b64 });
      return res.status(502).json({ error: "Provider returned no image data" });
    }

    const url2 = "https://generativelanguage.googleapis.com/v1beta/models/imagegeneration:generate";
    const r2 = await fetch(url2, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": API_KEY },
      body: JSON.stringify({ prompt, size: "1024x1024" })
    });

    if (r2.ok) {
      const j = await r2.json();
      const b64 =
        j?.predictions?.[0]?.bytesBase64Encoded ||
        j?.predictions?.[0]?.image?.base64 ||
        j?.images?.[0]?.base64 ||
        null;
      if (b64) return res.status(200).json({ imageBase64: "data:image/png;base64," + b64 });
      return res.status(502).json({ error: "Provider returned no image data (fallback)" });
    }

    const m1 = await r1.text().catch(() => "");
    const m2 = await r2.text().catch(() => "");
    return res.status(502).json({ error: `Primary ${r1.status} ${r1.statusText} – ${m1 || "Unknown"}. Fallback ${r2.status} ${r2.statusText} – ${m2 || "Unknown"}` });
  } catch (e) {
    return res.status(500).json({ error: e?.message || "Unknown error" });
  }
}

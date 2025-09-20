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
      return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
    })();

    const prompt = body?.prompt || "A beautiful, high-quality photo of a tropical beach at sunset";
    const r = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/imagegeneration:generate?key=" + API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, size: "1024x1024", safetyFilterLevel: "block_most" })
      }
    );

    if (!r.ok) {
      let msg = await r.text();
      try { const j = JSON.parse(msg); msg = j?.error?.message || msg; } catch {}
      return res.status(502).json({ error: r.status + " " + r.statusText + " – " + (msg || "Unknown error") });
    }

    const j = await r.json();
    const b64 =
      (j && j.predictions && j.predictions[0] && j.predictions[0].bytesBase64Encoded) ||
      (j && j.predictions && j.predictions[0] && j.predictions[0].image && j.predictions[0].image.base64) ||
      (j && j.images && j.images[0] && j.images[0].base64) ||
      null;

    if (!b64) return res.status(502).json({ error: "Provider returned no image data" });
    return res.status(200).json({ imageBase64: "data:image/png;base64," + b64 });
  } catch (e) {
    return res.status(500).json({ error: e?.message || "Unknown error" });
  }
}

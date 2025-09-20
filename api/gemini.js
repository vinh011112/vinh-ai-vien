export default async function handler(req, res) {
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  async function readBody() {
    if (req.body) return req.body;
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const txt = Buffer.concat(chunks).toString("utf8");
    return txt ? JSON.parse(txt) : {};
  }

  function toDataUrl(ab, mime) {
    const b64 = Buffer.from(ab).toString("base64");
    return "data:" + (mime || "image/png") + ";base64," + b64;
  }

  async function tryGemini(prompt, key) {
    const url = "https://generativelanguage.googleapis.com/v1beta/models/imagegeneration:generate?key=" + key;
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, size: "1024x1024", safetyFilterLevel: "block_most" })
    });
    if (!r.ok) return { ok: false, err: await r.text() };
    const j = await r.json();
    const b64 = j?.predictions?.[0]?.bytesBase64Encoded || j?.predictions?.[0]?.image?.base64 || j?.images?.[0]?.base64 || null;
    if (!b64) return { ok: false, err: "no image" };
    return { ok: true, dataUrl: "data:image/png;base64," + b64 };
  }

  async function tryHF(prompt, token) {
    async function call(model) {
      const r = await fetch("https://api-inference.huggingface.co/models/" + model, {
        method: "POST",
        headers: { Authorization: "Bearer " + token, "Content-Type": "application/json", Accept: "image/png" },
        body: JSON.stringify({ inputs: prompt })
      });
      if (!r.ok) return { ok: false, status: r.status, text: await r.text() };
      const ab = await r.arrayBuffer();
      return { ok: true, dataUrl: toDataUrl(ab, r.headers.get("content-type") || "image/png") };
    }
    let out = await call("black-forest-labs/FLUX.1-schnell");
    if (!out.ok && (out.status === 503 || out.status === 404 || out.status === 403)) out = await call("stabilityai/stable-diffusion-2-1");
    if (!out.ok) return { ok: false, err: out.text || "hf error" };
    return { ok: true, dataUrl: out.dataUrl };
  }

  async function tryPollinations(prompt) {
    const u = "https://image.pollinations.ai/prompt/" + encodeURIComponent(prompt) + "?width=1024&height=1024&nologo=true";
    const r = await fetch(u);
    if (!r.ok) return { ok: false, err: await r.text() };
    const ab = await r.arrayBuffer();
    return { ok: true, dataUrl: toDataUrl(ab, r.headers.get("content-type") || "image/jpeg") };
  }

  try {
    const body = await readBody();
    const prompt = body?.prompt || "A high-quality photo of a tropical beach at sunset";

    if (process.env.AI_API_KEY) {
      const g = await tryGemini(prompt, process.env.AI_API_KEY);
      if (g.ok) return res.status(200).json({ imageBase64: g.dataUrl });
    }

    if (process.env.HF_TOKEN) {
      const h = await tryHF(prompt, process.env.HF_TOKEN);
      if (h.ok) return res.status(200).json({ imageBase64: h.dataUrl });
    }

    const p = await tryPollinations(prompt);
    if (p.ok) return res.status(200).json({ imageBase64: p.dataUrl });

    return res.status(502).json({ error: "All providers failed" });
  } catch (e) {
    return res.status(500).json({ error: e?.message || "Unknown error" });
  }
}

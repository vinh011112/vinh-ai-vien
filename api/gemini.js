export default async function handler(req, res) {
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const TOKEN = process.env.HF_TOKEN;
  if (!TOKEN) return res.status(500).json({ error: "Missing HF_TOKEN on server" });

  try {
    const body = await (async () => {
      if (req.body) return req.body;
      const chunks = [];
      for await (const c of req) chunks.push(c);
      const txt = Buffer.concat(chunks).toString("utf8");
      return txt ? JSON.parse(txt) : {};
    })();

    const prompt = body?.prompt || "A high-quality photo of a tropical beach at sunset";

    async function call(model) {
      const r = await fetch("https://api-inference.huggingface.co/models/" + model, {
        method: "POST",
        headers: {
          Authorization: "Bearer " + TOKEN,
          "Content-Type": "application/json",
          Accept: "image/png"
        },
        body: JSON.stringify({ inputs: prompt })
      });
      if (!r.ok) return { ok: false, status: r.status, text: await r.text() };
      const ab = await r.arrayBuffer();
      return { ok: true, b64: Buffer.from(ab).toString("base64") };
    }

    let out = await call("black-forest-labs/FLUX.1-schnell");
    if (!out.ok && (out.status === 503 || out.status === 404 || out.status === 403))
      out = await call("stabilityai/stable-diffusion-2-1");

    if (!out.ok) return res.status(502).json({ error: out.text || "HF error" });
    return res.status(200).json({ imageBase64: "data:image/png;base64," + out.b64 });
  } catch (e) {
    return res.status(500).json({ error: e?.message || "Unknown error" });
  }
}

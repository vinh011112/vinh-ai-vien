async function readErr(r) {
  try {
    const j = await r.clone().json();
    return (j && (j.error && j.error.message)) || (typeof j === "string" ? j : JSON.stringify(j).slice(0, 400));
  } catch {
    return await r.text();
  }
}
export default async function handler(req, res) {
  const key = process.env.AI_API_KEY;
  if (!key) return res.status(500).json({ error: "Missing AI_API_KEY" });

  const textURL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + key;
  const rText = await fetch(textURL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: "say OK" }] }] })
  });

  const imgURL = "https://generativelanguage.googleapis.com/v1beta/models/imagegeneration:generate?key=" + key;
  const rImg = await fetch(imgURL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: "A red apple, photo", size: "512x512" })
  });

  res.status(200).json({
    text: rText.ok ? "OK" : (await readErr(rText)) || "ERR",
    imagegeneration_generate: rImg.ok ? "OK" : (await readErr(rImg)) || "ERR"
  });
}

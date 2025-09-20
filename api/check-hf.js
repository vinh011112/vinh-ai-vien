export default function handler(req, res) {
  const k = process.env.HF_TOKEN || "";
  res.status(200).json({ hasToken: Boolean(k), sample: k ? k.slice(0, 6) + "..." + k.slice(-4) : null });
}

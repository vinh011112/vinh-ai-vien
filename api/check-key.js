export default function handler(req, res) {
  const k = process.env.AI_API_KEY || "";
  res.status(200).json({ hasKey: Boolean(k), sample: k ? k.slice(0, 6) + "..." + k.slice(-4) : null });
}

export async function generateImage(_imageFile: { base64: string } | null, prompt: string, _opts?: any) {
  const res = await fetch("/api/gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt })
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

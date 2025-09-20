export async function generateImage(imageFile: { base64: string }, prompt: string) {
  const r = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, imageBase64: imageFile.base64 }),
  });
  if (!r.ok) throw new Error(await r.text());
  return await r.json(); // { imageBase64, meta }
}

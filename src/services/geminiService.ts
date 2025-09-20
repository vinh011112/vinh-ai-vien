// src/services/geminiService.ts
export async function generateImage(imageFile: { base64: string }, prompt: string) {
  const res = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, imageBase64: imageFile.base64, mode: 'edit' }),
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json(); // { imageBase64 }
}

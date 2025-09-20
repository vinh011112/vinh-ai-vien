export async function generateImage(
  _imageFile: { base64: string } | null,
  prompt: string
) {
  const res = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }) // chỉ gửi text
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || 'Provider error');
  }
  return await res.json(); // { imageBase64 }
}

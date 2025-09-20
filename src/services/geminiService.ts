// src/services/geminiService.ts
export async function generateImage(
  imageFile: { base64: string },
  prompt: string
) {
  const res = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      imageBase64: imageFile?.base64, // gửi ảnh gốc để chế độ edit hoạt động
      mode: 'edit',                   // đổi nền / chỉnh sửa dựa trên ảnh
    }),
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || 'Provider error');
  }
  return await res.json(); // { imageBase64 }
}

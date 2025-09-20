// src/services/geminiService.ts
import type { ImageFile, EditResult } from "../types";

/**
 * Stub đơn giản để build qua.
 * Sau này bạn thay bằng gọi API thật (Vercel Function / Gemini API).
 */
export async function generateImage(
  imageFile: ImageFile,
  prompt: string
): Promise<EditResult> {
  // Giả lập chờ API
  await new Promise((r) => setTimeout(r, 500));

  // Trả về "kết quả" dùng ngay ảnh gốc (để app chạy được)
  return {
    editedImageBase64: imageFile?.base64 ?? null,
    meta: { prompt },
  } as unknown as EditResult;
}


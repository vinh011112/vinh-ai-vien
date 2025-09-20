// src/services/geminiService.ts
export async function generateImage(
  imageFile: { base64: string } | null,
  prompt: string,
  opts?: { mode?: "edit" | "generate" }
) {
  const mode = opts?.mode ?? (imageFile ? "edit" : "generate");

  const res = await fetch("/api/gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt,
      imageBase64: imageFile?.base64 ?? null,
      mode,
    }),
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json(); // { imageBase64 }
}

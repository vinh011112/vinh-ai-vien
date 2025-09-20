import React, { useState, useCallback } from "react";
import { generateImage } from "./services/geminiService";
import { ControlPanel } from "./components/ControlPanel";

export default function App() {
  const [imageFile, setImageFile] = useState<any | null>(null);
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onGenerate = useCallback(
    async (mode: "edit" | "generate") => {
      if (mode === "edit" && !imageFile) {
        setError("Hãy chọn ảnh trước (chế độ Edit).");
        return;
      }
      setLoading(true);
      setError(null);
      setResult(null);
      try {
        const r = await generateImage(imageFile, prompt, { mode });
        setResult(r?.imageBase64 || null);
      } catch (e: any) {
        setError(e?.message || "Có lỗi xảy ra");
      } finally {
        setLoading(false);
      }
    },
    [imageFile, prompt]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-dark via-black to-black text-white">
      <header className="px-6 py-4 text-2xl font-bold">🖼️ Trình chỉnh sửa Ảnh AI của Vinh</header>
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-screen-2xl mx-auto">
          <ControlPanel
            onImageUpload={setImageFile}
            prompt={prompt}
            onPromptChange={setPrompt}
            onGenerate={onGenerate}
            isLoading={loading}
            uploadedImage={imageFile?.base64 ?? null}
          />

          <section className="bg-white/5 rounded-xl p-4 sm:p-6 border border-white/10">
            <h3 className="text-lg font-semibold mb-3">Vùng kết quả</h3>
            {error && <div className="text-red-300 mb-3">{error}</div>}
            {loading && <div className="opacity-80">Đang xử lý…</div>}
            {!loading && !result && <div className="opacity-60">Hình ảnh sau khi chỉnh sẽ xuất hiện ở đây.</div>}
            {result && (
              <div className="space-y-3">
                <img src={result} alt="result" className="rounded-lg border border-white/10" />
                <a
                  className="inline-block px-3 py-2 rounded-lg bg-white/90 text-black font-semibold hover:bg-white"
                  href={result}
                  download="result.png"
                >
                  Tải ảnh về
                </a>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

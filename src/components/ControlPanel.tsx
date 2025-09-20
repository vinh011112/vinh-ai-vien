import React, { useState } from "react";

type Props = {
  onImageUpload: (file: any) => void;      // nhận object { base64, name?, size? }
  prompt: string;
  onPromptChange: (v: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
  uploadedImage: string | null;
};

const fileToDataURL = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });

export const ControlPanel: React.FC<Props> = ({
  onImageUpload,
  prompt,
  onPromptChange,
  onGenerate,
  isLoading,
  uploadedImage,
}) => {
  const [localPreview, setLocalPreview] = useState<string | null>(uploadedImage);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const base64 = await fileToDataURL(f);
    setLocalPreview(base64);
    onImageUpload({ base64, name: f.name, size: f.size });
  }

  return (
    <section className="bg-white/5 rounded-xl p-4 sm:p-6 border border-white/10">
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-white/80 mb-2">Chọn ảnh</label>
          <input type="file" accept="image/*" onChange={handleFile} />
          {(localPreview || uploadedImage) && (
            <img
              src={localPreview || uploadedImage || undefined}
              alt="preview"
              className="mt-3 rounded-lg border border-white/10 max-h-64 object-contain"
            />
          )}
        </div>

        <div>
          <label className="block text-sm text-white/80 mb-2">Mô tả yêu cầu</label>
          <textarea
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            placeholder="Ví dụ: Đổi nền thành bãi biển lúc hoàng hôn…"
            className="w-full min-h-28 rounded-lg bg-black/40 border border-white/10 p-3 text-white outline-none"
          />
        </div>

        <button
          onClick={onGenerate}
          disabled={isLoading}
          className="w-full py-2.5 rounded-lg bg-white/90 text-black font-semibold hover:bg-white disabled:opacity-60"
        >
          {isLoading ? "Đang xử lý..." : "Tạo ảnh với AI"}
        </button>
      </div>
    </section>
  );
};

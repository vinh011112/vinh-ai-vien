import React, { useState } from "react";
import { FILTERS, EDITS, CREATIVE } from "../constants";
import { FeatureButton } from "./FeatureButton";

type Props = {
  onImageUpload: (file: any) => void;
  prompt: string;
  onPromptChange: (v: string) => void;
  onGenerate: (mode: "edit" | "generate") => void;
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
  const [mode, setMode] = useState<"edit" | "generate">("edit");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const base64 = await fileToDataURL(f);
    setLocalPreview(base64);
    onImageUpload({ base64, name: f.name, size: f.size });
    setMode("edit");
  }

  function addPhrase(text: string) {
    const addon = text
      .replaceAll("Đổi nền", "change background")
      .replaceAll("Xoá vật thể", "remove unwanted objects")
      .replaceAll("Tăng độ nét", "increase sharpness")
      .replaceAll("Giảm nhiễu", "denoise");
    onPromptChange(prompt ? `${prompt}; ${addon}` : addon);
  }

  return (
    <section className="bg-white/5 rounded-xl p-4 sm:p-6 border border-white/10 space-y-6">
      {/* 1. Tải ảnh */}
      <div>
        <label className="block text-sm text-white/80 mb-2">Chọn ảnh</label>
        <input type="file" accept="image/*" onChange={handleFile} />
        {(localPreview || uploadedImage) && (
          <img
            src={localPreview || uploadedImage || undefined}
            alt="preview"
            className="mt-3 rounded-lg border border-white/10 max-h-56 object-contain"
          />
        )}
      </div>

      {/* 2. Bộ lọc */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">2. Bộ lọc</h3>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((x) => (
            <FeatureButton key={x} label={x} onClick={() => addPhrase(x)} />
          ))}
        </div>
      </div>

      {/* 3. Chỉnh sửa & Biến đổi */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">3. Chỉnh sửa & Biến đổi</h3>
        <div className="flex flex-wrap gap-2">
          {EDITS.map((x) => (
            <FeatureButton key={x} label={x} onClick={() => addPhrase(x)} />
          ))}
        </div>
      </div>

      {/* 4. Sáng tạo với AI */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">4. Sáng tạo với AI</h3>
        <div className="flex flex-wrap gap-2">
          {CREATIVE.map((x) => (
            <FeatureButton key={x} label={x} onClick={() => addPhrase(x)} />
          ))}
        </div>
      </div>

      {/* 5. Mô tả & chế độ */}
      <div className="space-y-3">
        <label className="block text-sm text-white/80">5. Mô tả yêu cầu</label>
        <textarea
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder="Ví dụ: Đổi nền thành bãi biển lúc hoàng hôn…"
          className="w-full min-h-28 rounded-lg bg-black/40 border border-white/10 p-3 text-white outline-none"
        />

        <div className="flex items-center gap-4">
          <label className="text-white/80">Chế độ:</label>
          <label className="flex items-center gap-2 text-white/90">
            <input
              type="radio"
              name="mode"
              checked={mode === "edit"}
              onChange={() => setMode("edit")}
            />
            Edit (dựa trên ảnh)
          </label>
          <label className="flex items-center gap-2 text-white/90">
            <input
              type="radio"
              name="mode"
              checked={mode === "generate"}
              onChange={() => setMode("generate")}
            />
            Generate (tạo mới)
          </label>
        </div>
      </div>

      <button
        onClick={() => onGenerate(mode)}
        disabled={isLoading}
        className="w-full py-2.5 rounded-lg bg-white/90 text-black font-semibold hover:bg-white disabled:opacity-60"
      >
        {isLoading ? "Đang xử lý..." : "Tạo ảnh với AI"}
      </button>
    </section>
  );
};

import React from "react";

type Props = {
  originalImage: string | null;
  editResult: any;
  isLoading: boolean;
  error: string | null;
};

export const OutputDisplay: React.FC<Props> = ({ originalImage, editResult, isLoading, error }) => {
  const edited =
    editResult?.editedImageBase64 ||
    editResult?.imageBase64 ||
    editResult?.base64 || null;

  return (
    <section className="bg-white/5 rounded-xl p-4 sm:p-6 border border-white/10">
      <h2 className="text-white/90 font-semibold mb-4">Kết quả</h2>

      {error && <div className="mb-4 text-sm text-red-300 bg-red-900/30 border border-red-400/30 rounded-lg p-3">{error}</div>}
      {isLoading && <div className="text-white/80">Đang xử lý ảnh, vui lòng đợi…</div>}
      {!isLoading && !edited && !error && <div className="text-white/60 text-sm">Chưa có kết quả. Hãy tải ảnh và bấm “Tạo ảnh với AI”.</div>}

      <div className="grid grid-cols-1 gap-4">
        {originalImage && (
          <div>
            <div className="text-white/70 text-sm mb-2">Ảnh gốc</div>
            <img src={originalImage} alt="original" className="rounded-lg border border-white/10 max-h-[480px] object-contain"/>
          </div>
        )}
        {edited && (
          <div>
            <div className="text-white/70 text-sm mb-2">Ảnh đã chỉnh</div>
            <img src={edited} alt="edited" className="rounded-lg border border-white/10 max-h-[480px] object-contain"/>
          </div>
        )}
      </div>
    </section>
  );
};

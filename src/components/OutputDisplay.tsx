
import React from 'react';
import { EditResult } from '../types';

interface OutputDisplayProps {
  originalImage: string | null;
  editResult: EditResult | null;
  isLoading: boolean;
  error: string | null;
}

const DownloadButton: React.FC<{ generatedImage: string; format: 'jpeg' | 'png' | 'webp' }> = ({ generatedImage, format }) => {
    const handleDownload = () => {
        const image = new Image();
        image.src = generatedImage;
        image.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = image.width;
            canvas.height = image.height;
            const ctx = canvas.getContext('2d');
            if(ctx) {
                ctx.drawImage(image, 0, 0);
                const dataUrl = canvas.toDataURL(`image/${format}`, 1.0);
                const a = document.createElement('a');
                a.href = dataUrl;
                a.download = `edited-image-vinh-ai.${format}`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
        };
    };

    return (
        <button onClick={handleDownload} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition duration-300 text-sm">
            Lưu ảnh .{format.toUpperCase()}
        </button>
    );
};


export const OutputDisplay: React.FC<OutputDisplayProps> = ({ originalImage, editResult, isLoading, error }) => {
  const generatedImage = editResult?.image?.base64;

  const Placeholder = () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900/30 border-2 border-dashed border-gray-600 rounded-2xl text-center p-8">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <h3 className="text-xl font-semibold text-white">Vùng kết quả</h3>
      <p className="text-gray-400 mt-2">Hình ảnh sau khi chỉnh sửa sẽ xuất hiện ở đây.</p>
    </div>
  );
  
  const LoadingState = () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900/30 border-2 border-dashed border-brand-light/50 rounded-2xl p-8 animate-pulse-fast">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-brand-light mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2 1M4 7l2-1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
        </svg>
        <h3 className="text-xl font-semibold text-white">AI đang sáng tạo...</h3>
        <p className="text-gray-400 mt-2">Vui lòng chờ trong giây lát.</p>
      </div>
  );

  return (
    <div className="bg-gray-900/50 backdrop-blur-md border border-gray-700 rounded-2xl p-6 h-full flex flex-col animate-fade-in aspect-[4/3] lg:aspect-auto">
        <div className="w-full flex-grow relative">
            {isLoading && <LoadingState />}
            {!isLoading && error && (
                <div className="w-full h-full flex flex-col items-center justify-center bg-red-900/30 border-2 border-dashed border-red-500 rounded-2xl text-center p-8">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-xl font-semibold text-white">Lỗi!</h3>
                    <p className="text-red-300 mt-2">{error}</p>
                </div>
            )}
            {!isLoading && !error && !generatedImage && <Placeholder />}
            {!isLoading && !error && generatedImage && (
                <img src={generatedImage} alt="Kết quả chỉnh sửa" className="w-full h-full object-contain rounded-lg" />
            )}
        </div>

        {generatedImage && !isLoading && (
            <div className="mt-6">
                <h3 className="text-lg font-semibold text-brand-light mb-3 text-center">Tải xuống</h3>
                <div className="flex gap-2 justify-center">
                    <DownloadButton generatedImage={generatedImage} format="jpeg"/>
                    <DownloadButton generatedImage={generatedImage} format="png"/>
                    <DownloadButton generatedImage={generatedImage} format="webp"/>
                </div>
                {editResult?.text && <p className="text-center mt-4 text-gray-300 italic">Ghi chú từ AI: "{editResult.text}"</p>}
            </div>
        )}
    </div>
  );
};

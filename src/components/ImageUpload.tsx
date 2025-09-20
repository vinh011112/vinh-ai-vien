
import React, { useCallback, useState } from 'react';
import { ImageFile } from '../types';

interface ImageUploadProps {
  onImageUpload: (file: ImageFile | null) => void;
  uploadedImage: string | null;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ onImageUpload, uploadedImage }) => {
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setError('Định dạng không hợp lệ. Chỉ hỗ trợ JPG, PNG, WEBP.');
        onImageUpload(null);
        return;
      }
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageUpload({
          name: file.name,
          type: file.type,
          base64: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  }, [onImageUpload]);

  return (
    <div className="w-full">
      <label htmlFor="file-upload" className="cursor-pointer">
        <div className="w-full p-4 border-2 border-dashed border-gray-600 hover:border-brand-light rounded-lg transition-colors duration-300 flex items-center justify-center text-center">
          {uploadedImage ? (
            <img src={uploadedImage} alt="Uploaded preview" className="max-h-32 rounded-md object-contain"/>
          ) : (
            <div className="text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="mt-2 font-semibold">Nhấn để tải ảnh lên</p>
                <p className="text-xs mt-1">Hỗ trợ JPG, PNG, WEBP</p>
            </div>
          )}
        </div>
      </label>
      <input
        id="file-upload"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
};


import React, { useCallback } from 'react';
import { ImageUpload } from './ImageUpload';
import { FeatureButton } from './FeatureButton';
import { FEATURE_PROMPTS, RANDOM_SUGGESTIONS } from '../constants';

interface ControlPanelProps {
  onImageUpload: (file: { name: string; type: string; base64: string; } | null) => void;
  prompt: string;
  onPromptChange: (prompt: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
  uploadedImage: string | null;
}

const ControlSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-6">
    <h3 className="text-lg font-semibold text-brand-light mb-3 border-b-2 border-brand-light/20 pb-2">{title}</h3>
    <div className="flex flex-wrap gap-2">
      {children}
    </div>
  </div>
);

export const ControlPanel: React.FC<ControlPanelProps> = ({
  onImageUpload,
  prompt,
  onPromptChange,
  onGenerate,
  isLoading,
  uploadedImage
}) => {
  const handleFeatureClick = (feature: string) => {
    onPromptChange(FEATURE_PROMPTS[feature] || '');
  };

  const handleRandomSuggestion = () => {
    const randomIndex = Math.floor(Math.random() * RANDOM_SUGGESTIONS.length);
    onPromptChange(RANDOM_SUGGESTIONS[randomIndex]);
  };

  const handleClear = () => {
    onPromptChange('');
  };

  const filters = ['Cổ điển', 'Đen trắng', 'Rực rỡ', 'Sống động', 'Tươi mới'];
  const edits = ['Tranh sơn dầu', 'Tranh chì', 'Siêu thực', 'Đổi nền', 'Xoá vật thể', 'Làm đẹp', 'Tăng độ nét', 'Giảm nhiễu'];
  const creations = ['Phục chế ảnh', 'Mô hình 3D', 'Phong cách Ghibli', 'Thử trang phục', 'Faceswap', 'Mẫu cầm sản phẩm', 'Poster truyền thông'];

  return (
    <div className="bg-gray-900/50 backdrop-blur-md border border-gray-700 rounded-2xl p-6 h-full flex flex-col animate-fade-in">
      <div className="overflow-y-auto pr-2 flex-grow">
        <ControlSection title="1. Tải ảnh lên">
          <ImageUpload onImageUpload={onImageUpload} uploadedImage={uploadedImage} />
        </ControlSection>

        <ControlSection title="2. Bộ lọc">
          {filters.map(f => <FeatureButton key={f} label={f} onClick={() => handleFeatureClick(f)} />)}
        </ControlSection>

        <ControlSection title="3. Chỉnh sửa và Biến đổi">
          {edits.map(e => <FeatureButton key={e} label={e} onClick={() => handleFeatureClick(e)} />)}
        </ControlSection>

        <ControlSection title="4. Sáng tạo với AI">
          {creations.map(c => <FeatureButton key={c} label={c} onClick={() => handleFeatureClick(c)} />)}
        </ControlSection>
        
        <div className="mb-4">
            <h3 className="text-lg font-semibold text-brand-light mb-3 border-b-2 border-brand-light/20 pb-2">5. Mô tả yêu cầu của bạn</h3>
            <textarea
                value={prompt}
                onChange={(e) => onPromptChange(e.target.value)}
                placeholder="Ví dụ: Thêm một con mèo đội mũ phi hành gia vào ảnh..."
                rows={4}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-brand-light focus:border-brand-light transition duration-300 text-white placeholder-gray-400"
            />
            <div className="flex gap-2 mt-2">
                <button onClick={handleRandomSuggestion} className="flex-1 text-sm bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition duration-300">
                Tạo gợi ý ngẫu nhiên
                </button>
                <button onClick={handleClear} className="flex-1 text-sm bg-red-800/80 hover:bg-red-700/80 text-white font-medium py-2 px-4 rounded-lg transition duration-300">
                Xoá bỏ
                </button>
            </div>
        </div>
      </div>

      <div className="mt-auto pt-6">
        <button
          onClick={onGenerate}
          disabled={isLoading || !uploadedImage}
          className="w-full bg-gradient-to-r from-brand-light to-blue-500 hover:from-brand-light/90 hover:to-blue-500/90 text-white font-bold text-lg py-4 px-4 rounded-xl shadow-lg shadow-brand-light/30 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Đang xử lý...
            </>
          ) : (
            'Tạo Ảnh'
          )}
        </button>
      </div>
    </div>
  );
};

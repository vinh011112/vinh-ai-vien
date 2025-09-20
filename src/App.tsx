
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ControlPanel } from './components/ControlPanel';
import { OutputDisplay } from './components/OutputDisplay';
import { ImageFile, EditResult } from './types';
import { generateImage } from './services/geminiService';

const App: React.FC = () => {
  const [imageFile, setImageFile] = useState<ImageFile | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [editResult, setEditResult] = useState<EditResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!imageFile || !prompt) {
      setError('Vui lòng tải ảnh lên và nhập mô tả yêu cầu.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setEditResult(null);

    try {
      const result = await generateImage(imageFile, prompt);
      setEditResult(result);
    } catch (err: any) {
      console.error('API Error:', err);
      setError(`Đã có lỗi xảy ra: ${err.message}. Vui lòng thử lại.`);
    } finally {
      setIsLoading(false);
    }
  }, [imageFile, prompt]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-dark via-black to-black">
      <Header />
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="container mx-auto max-w-screen-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ControlPanel
              onImageUpload={setImageFile}
              prompt={prompt}
              onPromptChange={setPrompt}
              onGenerate={handleGenerate}
              isLoading={isLoading}
              uploadedImage={imageFile?.base64 ?? null}
            />
            <OutputDisplay
              originalImage={imageFile?.base64 ?? null}
              editResult={editResult}
              isLoading={isLoading}
              error={error}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;

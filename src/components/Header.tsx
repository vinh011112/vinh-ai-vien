
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 bg-black/50 backdrop-blur-lg shadow-lg shadow-brand-light/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            <h1 className="text-xl font-bold text-white tracking-wider">
              Trình chỉnh sửa Ảnh AI của Vinh
            </h1>
          </div>
          <div className="text-sm font-medium text-gray-300">
            <span className="hidden sm:inline">Người đồng hành cùng bạn Viên Viên ! - </span>
            <a 
              href="https://facebook.com/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-brand-light hover:text-white transition-colors duration-300"
            >
              Truy cập Facebook
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

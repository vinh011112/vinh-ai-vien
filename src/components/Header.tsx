import React from "react";

export const Header: React.FC = () => {
  return (
    <header className="w-full py-4 px-6 bg-black/50 border-b border-white/10">
      <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-bold text-white">
          Trình chỉnh sửa Ảnh AI của Vinh
        </h1>
      </div>
    </header>
  );
};


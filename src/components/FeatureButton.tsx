
import React from 'react';

interface FeatureButtonProps {
  label: string;
  onClick: () => void;
}

export const FeatureButton: React.FC<FeatureButtonProps> = ({ label, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="bg-gray-800 text-gray-300 hover:bg-brand-dark hover:text-white transition-all duration-300 text-sm font-medium py-2 px-3 rounded-lg shadow-sm transform hover:-translate-y-0.5"
    >
      {label}
    </button>
  );
};

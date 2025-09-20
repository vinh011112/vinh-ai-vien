// src/components/FeatureButton.tsx
import React from "react";

export const FeatureButton: React.FC<{ label: string; onClick: () => void }> = ({ label, onClick }) => (
  <button
    onClick={onClick}
    className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-white"
  >
    {label}
  </button>
);

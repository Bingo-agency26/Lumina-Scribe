import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
  >
    <defs>
      {/* Lighter gradient for the top wing */}
      <linearGradient id="plane-light" x1="2" y1="9" x2="22" y2="2" gradientUnits="userSpaceOnUse">
        <stop stopColor="#5eead4" /> {/* teal-300 */}
        <stop offset="1" stopColor="#2dd4bf" /> {/* teal-400 */}
      </linearGradient>
      
      {/* Darker gradient for the bottom wing/shadow */}
      <linearGradient id="plane-dark" x1="11" y1="13" x2="15" y2="22" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0d9488" /> {/* teal-600 */}
        <stop offset="1" stopColor="#115e59" /> {/* teal-800 */}
      </linearGradient>
    </defs>
    
    {/* Top/Left Wing (Main Body) */}
    <path d="M22 2L2 9L11 13L22 2Z" fill="url(#plane-light)" />
    
    {/* Bottom/Right Wing (Fold/Shadow) */}
    <path d="M22 2L11 13L15 22L22 2Z" fill="url(#plane-dark)" />
  </svg>
);
import React from 'react';
import { Link } from 'react-router-dom';

interface FPTLogoProps {
  className?: string;
}

export const FPTLogo: React.FC<FPTLogoProps> = ({ className = '' }) => {
  return (
    <Link 
      to="/" 
      className={`flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity ${className}`}
    >
      {/* FPT Education Logo */}
      <div className="relative">
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/6/68/Logo_FPT_Education.png"
          alt="FPT Education Logo"
          className="h-16 w-auto object-contain"
          onError={(e) => {
            // Fallback to text if image fails to load
            e.currentTarget.style.display = 'none';
            const fallback = e.currentTarget.nextElementSibling;
            if (fallback) fallback.classList.remove('hidden');
          }}
        />
        {/* Fallback SVG Logo (hidden by default) */}
        <svg 
          viewBox="0 0 100 100" 
          className="h-16 w-16 hidden"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="50" cy="50" r="48" fill="#FF6600" />
          <text
            x="50"
            y="62"
            fontFamily="Arial, sans-serif"
            fontSize="32"
            fontWeight="bold"
            fill="white"
            textAnchor="middle"
          >
            FPT
          </text>
        </svg>
      </div>
    </Link>
  );
};

export default FPTLogo;

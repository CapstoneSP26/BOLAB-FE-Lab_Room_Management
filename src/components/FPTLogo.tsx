import React from 'react';

interface FPTLogoProps {
  className?: string;
  showText?: boolean;
}

export const FPTLogo: React.FC<FPTLogoProps> = ({ className = '', showText = true }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* FPT Logo Icon */}
      <div className="relative">
        <svg 
          viewBox="0 0 100 100" 
          className="h-10 w-10"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Orange Circle Background */}
          <circle cx="50" cy="50" r="48" fill="#FF6600" />
          
          {/* White FPT Text */}
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
      
      {/* Text */}
      {showText && (
        <div className="flex flex-col">
          <span className="text-xl font-bold text-white leading-tight drop-shadow-lg">FPT University</span>
          <span className="text-xs text-white/90 drop-shadow-lg">Lab Management</span>
        </div>
      )}
    </div>
  );
};

export default FPTLogo;

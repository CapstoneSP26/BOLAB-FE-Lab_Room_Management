import React from 'react';
import { useLocation } from 'react-router-dom';

const Footer: React.FC = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  
  return (
    <footer className={`w-full relative py-4 flex flex-col md:flex-row items-center justify-between px-6 text-sm mt-auto ${
      isHomePage 
        ? 'bg-transparent text-white' 
        : 'bg-gray-50 text-gray-700 border-t border-gray-200'
    }`}>
      {/* Border Top (only for transparent background) */}
      {isHomePage && (
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      )}
      
      {/* Content */}
      <span className="relative z-10" style={isHomePage ? { textShadow: '0 2px 4px rgba(0,0,0,0.5)' } : {}}>
        © {new Date().getFullYear()} FPT University. All rights reserved.
      </span>
      <span className="relative z-10 mt-2 md:mt-0" style={isHomePage ? { textShadow: '0 2px 4px rgba(0,0,0,0.5)' } : {}}>
        Smart Campus Management System
      </span>
    </footer>
  );
};

export default Footer;

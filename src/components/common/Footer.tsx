import React from 'react';
import { useLocation } from 'react-router-dom';

const Footer: React.FC = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  
  return (
    <footer className={`w-full relative py-4 flex flex-col md:flex-row items-center justify-between px-6 text-sm mt-auto ${
      isHomePage 
        ? 'bg-transparent text-black' 
        : 'bg-white text-black border-t border-slate-200'
    }`}>
      {/* Border Top (only for transparent background) */}
      {isHomePage && (
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-black/30 to-transparent" />
      )}
      
      {/* Content */}
      <span className="relative z-10">© {new Date().getFullYear()} FPT University. All rights reserved.</span>
      <span className="relative z-10 mt-2 md:mt-0">
        Smart Campus Management System
      </span>
    </footer>
  );
};

export default Footer;

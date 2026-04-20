import React from 'react';
import { useLocation } from 'react-router-dom';

const Footer: React.FC = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  
  return (
    <footer className={`w-full relative py-4 flex flex-col md:flex-row items-center justify-between px-6 text-sm mt-auto bg-white text-gray-700 border-t border-gray-200`}>
      {/* Content */}
      <span className="relative z-10">
        © {new Date().getFullYear()} FPT University. All rights reserved.
      </span>
      <span className="relative z-10 mt-2 md:mt-0">
        Smart Campus Management System
      </span>
    </footer>
  );
};

export default Footer;

import React from 'react';
import { useLocation } from 'react-router-dom';
import NotificationDropdown from './NotificationDropdown';
import ProfileMenu from './ProfileMenu';
import { FPTLogo } from './FPTLogo';

const Header: React.FC = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  
  return (
    <header className={`w-full h-16 relative flex items-center justify-between px-6 sticky top-0 z-[100] ${
      isHomePage 
        ? 'bg-transparent' 
        : 'bg-white shadow-md border-b border-gray-200'
    }`}>
      {/* Border Bottom (only for transparent background) */}
      {isHomePage && (
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      )}
      
      {/* Content */}
      <div className={`relative z-10 flex items-center ${isHomePage ? 'text-white' : 'text-gray-900'}`} 
           style={isHomePage ? { textShadow: '0 2px 4px rgba(0,0,0,0.3)' } : {}}>
        <FPTLogo showText={true} />
      </div>
      
      {/* Right Section: Notifications & Profile */}
      <div className={`flex items-center gap-4 relative z-10 ${isHomePage ? 'text-white' : 'text-gray-900'}`}
           style={isHomePage ? { textShadow: '0 2px 4px rgba(0,0,0,0.3)' } : {}}>
        <NotificationDropdown isHomePage={isHomePage} />
        <ProfileMenu 
          userName="Admin"
          userRole="Administrator"
          isHomePage={isHomePage}
        />
      </div>
    </header>
  );
};

export default Header;

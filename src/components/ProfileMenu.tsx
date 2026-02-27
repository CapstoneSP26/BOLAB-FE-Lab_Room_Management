import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface ProfileMenuProps {
  userName?: string;
  userAvatar?: string;
  userRole?: string;
  isHomePage?: boolean;
}

const ProfileMenu: React.FC<ProfileMenuProps> = ({ 
  userName = 'Admin',
  userAvatar = 'https://randomuser.me/api/portraits/men/32.jpg',
  userRole = 'Administrator',
  isHomePage = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleProfile = () => {
    setIsOpen(false);
    // Navigate to profile page
    console.log('Navigate to profile');
  };

  const handleSettings = () => {
    setIsOpen(false);
    // Navigate to settings page
    console.log('Navigate to settings');
  };

  const handleSignOut = () => {
    setIsOpen(false);
    // Clear auth data and navigate to login
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="relative z-50" ref={dropdownRef}>
      <button 
        className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
          isHomePage 
            ? 'hover:bg-white/10' 
            : 'hover:bg-gray-100'
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <img 
          src={userAvatar} 
          alt="Profile" 
          className={`w-8 h-8 rounded-full object-cover shadow-lg ${
            isHomePage 
              ? 'border-2 border-white/50' 
              : 'border-2 border-gray-300'
          }`}
        />
        <div className="hidden md:block text-left">
          <p className={`font-medium text-sm ${
            isHomePage 
              ? 'text-white drop-shadow-lg' 
              : 'text-gray-900'
          }`}>
            {userName}
          </p>
          <p className={`text-xs ${
            isHomePage 
              ? 'text-white/80 drop-shadow-lg' 
              : 'text-gray-600'
          }`}>
            {userRole}
          </p>
        </div>
        <svg 
          className={`w-4 h-4 transition-transform ${
            isHomePage 
              ? 'text-white drop-shadow-lg' 
              : 'text-gray-700'
          } ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-[9999]">
          {/* User Info */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <img 
                src={userAvatar} 
                alt="Profile" 
                className="w-12 h-12 rounded-full border-2 border-gray-200 object-cover" 
              />
              <div>
                <p className="font-semibold text-gray-800">{userName}</p>
                <p className="text-sm text-gray-500">{userRole}</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <button
              onClick={handleProfile}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Profile</span>
            </button>

            <button
              onClick={handleSettings}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Settings</span>
            </button>
          </div>

          {/* Sign Out */}
          <div className="border-t border-gray-200 py-2">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;
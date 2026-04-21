import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { Role } from '../../constants/role';

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
  const { user } = useAuthStore();
  const logout = useAuthStore((state) => state.logout);

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

  const getProfilePath = () => {
    const userRole = user?.roles?.[0];
    if (userRole === Role.Student) {
      return '/student/profile';
    }
    return '/profile';
  };

  const handleProfile = () => {
    setIsOpen(false);
    navigate(getProfilePath());
  };

  const handleSettings = () => {
    setIsOpen(false);
    navigate('/profile', {
      state: { openNotifications: true },
    });
  };

  const handleSignOut = async () => {
    setIsOpen(false);
    await logout();
    navigate('/login');
  };

  return (
    <div className="relative z-50" ref={dropdownRef}>
      <button
        className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${isHomePage
          ? 'hover:bg-white/10'
          : 'hover:bg-gray-100'
          }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <img
          src={userAvatar}
          alt="Profile"
          className={`w-8 h-8 rounded-full object-cover shadow-lg ${isHomePage
            ? 'border-2 border-white/50'
            : 'border-2 border-gray-300'
            }`}
        />
        <div className="hidden md:block text-left">
          <p className={`font-medium text-sm ${isHomePage
            ? 'text-white drop-shadow-lg'
            : 'text-gray-900'
            }`}>
            {userName}
          </p>
          <p className={`text-xs ${isHomePage
            ? 'text-white/80 drop-shadow-lg'
            : 'text-gray-600'
            }`}>
            {userRole}
          </p>
        </div>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${isHomePage
            ? 'text-white drop-shadow-lg'
            : 'text-gray-700'
            } ${isOpen ? 'rotate-180' : ''}`}
        />
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
              <User className="w-5 h-5 text-gray-500" />
              <span>Profile</span>
            </button>

            {user?.roles?.[0] !== Role.Student && (
              <button
                onClick={handleSettings}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Settings className="w-5 h-5 text-gray-500" />
                <span>Settings</span>
              </button>
            )}
          </div>

          {/* Sign Out */}
          <div className="border-t border-gray-200 py-2">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;
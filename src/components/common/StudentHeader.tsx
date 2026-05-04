import React from 'react';
import { useLocation } from 'react-router-dom';
import ProfileMenu from './ProfileMenu';
import { FPTLogo } from '../icon/FPTLogo';
import { LoadingBar } from '../ui/LoadingBar';
import { useMyProfile } from '../../features/profile/hooks/userProfile';
import { useAuthStore } from '../../store/useAuthStore';

const formatRoleLabel = (role?: string | null) => {
  if (!role?.trim()) return 'User';

  return role
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const StudentHeader: React.FC = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const authUser = useAuthStore((state) => state.user);
  const { data: profile } = useMyProfile(true);

  const userName =
    profile?.fullName?.trim() ||
    authUser?.fullName?.trim() ||
    authUser?.email?.trim() ||
    'User';

  const rawRole = profile?.role?.trim() || authUser?.roles?.[0]?.trim();
  const userRole = formatRoleLabel(rawRole);

  const userAvatar =
    profile?.avatarUrl?.trim() ||
    profile?.userImageUrl?.trim() ||
    'https://randomuser.me/api/portraits/men/32.jpg';

  return (
    <>
      <header
        className={`w-full h-16 relative flex items-center justify-between px-6 sticky top-0 z-[100] ${
          isHomePage
            ? 'bg-[#fffaf0] shadow-md border-b border-orange-100'
            : 'bg-white shadow-md border-b border-gray-200'
        }`}
      >
        {/* Content */}
        <div className="relative z-10 flex items-center text-gray-900">
          <FPTLogo />
        </div>

        {/* Right Side: Profile Menu Only */}
        <div className="flex items-center gap-3 relative z-10">
          <ProfileMenu
            userName={userName}
            userRole={userRole}
            userAvatar={userAvatar}
            isHomePage={false}
          />
        </div>

        <div className="absolute inset-x-0 bottom-0 h-1 z-50">
          <LoadingBar />
        </div>
      </header>
    </>
  );
};

export default StudentHeader;

import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { QrCode, Calendar, BookOpen, Users } from 'lucide-react';
import { NotificationDropdown } from './NotificationDropdown';
import ProfileMenu from './ProfileMenu';
import { FPTLogo } from '../icon/FPTLogo';
import { Badge } from '../ui/Badge';
import { Breadcrumb } from '../ui/Breadcrumb';
import { ActiveSessionIndicator } from '../ui/ActiveSessionIndicator';
import { LoadingBar } from '../ui/LoadingBar';
import { useActiveSession } from '../../context/ActiveSessionContext';
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

const Header: React.FC = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const { activeSession } = useActiveSession();
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

  // Active sessions from global context (shared with AttendancePage)
  const activeSessions = activeSession && activeSession.isActive && activeSession.qrExpiry
    ? [
        {
          id: activeSession.id,
          roomName: activeSession.roomName,
          expiresAt: activeSession.qrExpiry,
          attendeeCount: activeSession.presentCount || 0,
        },
      ]
    : [];

  // Navigation items
  const navItems = [
    {
      path: '/book-room',
      label: 'Book Room',
      icon: Calendar,
      badgeKey: 'book-room',
    },
    {
      path: '/my-bookings',
      label: 'My Bookings',
      icon: BookOpen,
      badgeKey: 'my-bookings',
    },
    {
      path: '/attendance',
      label: 'Attendance',
      icon: QrCode,
      badgeKey: 'attendance',
    },
    {
      path: '/student-groups',
      label: 'Groups',
      icon: Users,
      badgeKey: 'student-groups',
    },
  ];

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

        {/* Center: Navigation Links */}
        <nav className="flex items-center gap-1 relative z-10">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  isHomePage
                    ? isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    : isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{item.label}</span>
                {/* Attendance badge: Show blue dot icon if there's an active session */}
                {item.badgeKey === 'attendance' && activeSession?.isActive && (
                  <Badge
                    dot={true}
                    type="info"
                    pulse={true}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Side: Active Sessions, Notifications & Profile */}
        <div className="flex items-center gap-3 relative z-10">
          {!isHomePage && <ActiveSessionIndicator sessions={activeSessions} />}
          <div className="flex items-center gap-4 text-gray-900">
            <NotificationDropdown isHomePage={false} />
            <ProfileMenu
              userName={userName}
              userRole={userRole}
              userAvatar={userAvatar}
              isHomePage={false}
            />
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 h-1 z-50">
          <LoadingBar />
        </div>
      </header>

      {/* Breadcrumb below header (only on non-home pages) */}
      {!isHomePage && (
        <div className="bg-gradient-to-r from-orange-50/50 via-white to-red-50/50 border-b border-orange-100 px-6 py-3 shadow-sm">
          <Breadcrumb />
        </div>
      )}
    </>
  );
};

export default Header;

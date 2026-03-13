import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { QrCode, Calendar, BookOpen } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import ProfileMenu from './ProfileMenu';
import { FPTLogo } from './FPTLogo';
import { Badge } from './Badge';
import { Breadcrumb } from './Breadcrumb';
import { ActiveSessionIndicator } from './ActiveSessionIndicator';
import { useActiveSession } from '../context/ActiveSessionContext';

const Header: React.FC = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const { activeSession } = useActiveSession();
  
  // Mock badge counts - Replace with real data from API/state
  const badgeCounts = {
    'book-room': 0,
    'my-bookings': 3, // 3 pending approvals
    'attendance': 2, // 2 active sessions
  };
  
  // Active sessions from global context (shared with AttendancePage)
  const activeSessions = activeSession && activeSession.isActive
    ? [{
        id: activeSession.id,
        roomName: activeSession.roomName,
        expiresAt: activeSession.qrExpiry,
        attendeeCount: activeSession.presentCount + activeSession.lateCount,
      }]
    : [];
  
  // Navigation items
  const navItems = [
    { path: '/book-room', label: 'Book Room', icon: Calendar, badgeKey: 'book-room' },
    { path: '/my-bookings', label: 'My Bookings', icon: BookOpen, badgeKey: 'my-bookings' },
    { path: '/attendance', label: 'Attendance', icon: QrCode, badgeKey: 'attendance' },
  ];
  
  return (
    <>
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
        <FPTLogo />
      </div>
      
      {/* Center: Navigation Links */}
      <nav className="flex items-center gap-1 relative z-10">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          const badgeCount = badgeCounts[item.badgeKey as keyof typeof badgeCounts];
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                isHomePage
                  ? isActive
                    ? 'bg-white/20 text-white backdrop-blur-sm'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                  : isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
              style={isHomePage ? { textShadow: '0 1px 2px rgba(0,0,0,0.2)' } : {}}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm">{item.label}</span>
              {badgeCount > 0 && (
                <Badge 
                  count={badgeCount} 
                  type={item.badgeKey === 'attendance' ? 'success' : 'warning'}
                  pulse={item.badgeKey === 'attendance'}
                />
              )}
            </Link>
          );
        })}
      </nav>
      
      {/* Right Side: Active Sessions, Notifications & Profile */}
      <div className="flex items-center gap-3 relative z-10">
        {!isHomePage && <ActiveSessionIndicator sessions={activeSessions} />}
        <div className={`flex items-center gap-4 ${isHomePage ? 'text-white' : 'text-gray-900'}`}
             style={isHomePage ? { textShadow: '0 2px 4px rgba(0,0,0,0.3)' } : {}}>
          <NotificationDropdown isHomePage={isHomePage} />
          <ProfileMenu 
            userName="Lecturer A"
            userRole="Lecturer"
            isHomePage={isHomePage}
          />
        </div>
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

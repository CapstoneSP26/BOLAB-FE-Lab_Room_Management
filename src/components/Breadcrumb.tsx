/**
 * Breadcrumb Component
 * Navigation breadcrumb trail
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path: string;
}

// Route name mappings
const routeNames: Record<string, string> = {
  '': 'Home',
  'book-room': 'Book Room',
  'my-bookings': 'My Bookings',
  'attendance': 'Attendance',
  'building': 'Building',
  'qr-display': 'QR Display',
  'scan-attendance': 'Scan Attendance',
  'manual': 'Manual Entry',
  'profile': 'Profile',
};

export const Breadcrumb: React.FC = () => {
  const location = useLocation();
  
  // Parse current path
  const pathSegments = location.pathname.split('/').filter(Boolean);
  
  // Don't show breadcrumb on homepage
  if (pathSegments.length === 0) {
    return null;
  }

  // Build breadcrumb items
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', path: '/' },
  ];

  let currentPath = '';
  pathSegments.forEach((segment) => {
    currentPath += `/${segment}`;
    const label = routeNames[segment] || segment;
    breadcrumbs.push({ label, path: currentPath });
  });

  return (
    <nav className="flex items-center gap-2 text-sm">
      {breadcrumbs.map((item, index) => {
        const isLast = index === breadcrumbs.length - 1;
        const isFirst = index === 0;

        return (
          <React.Fragment key={item.path}>
            {index > 0 && (
              <ChevronRight className="w-4 h-4 text-orange-300" />
            )}
            {isLast ? (
              <span className="text-orange-600 font-semibold flex items-center gap-1.5 bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-200">
                {isFirst && <Home className="w-4 h-4" />}
                {item.label}
              </span>
            ) : (
              <Link
                to={item.path}
                className="text-gray-600 hover:text-orange-600 hover:bg-orange-50 transition-all flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
              >
                {isFirst && <Home className="w-4 h-4" />}
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

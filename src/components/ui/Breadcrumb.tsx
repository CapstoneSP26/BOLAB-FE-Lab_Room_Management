/**
 * Breadcrumb Component
 * Navigation breadcrumb trail
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useBreadcrumb } from '../../context/BreadcrumbContext';

interface BreadcrumbItem {
  label: string;
  path: string;
}

// Route name mappings
const routeNames: Record<string, string> = {
  '': 'Home',
  'book-room': 'Book Room',
  'buildings': 'Buildings',
  'lab-room': 'Lab Room',
  'my-bookings': 'My Bookings',
  'notifications': 'Notifications',
  'attendance': 'Attendance',
  'building': 'Building',
  'qr-display': 'QR Display',
  'scan-attendance': 'Scan Attendance',
  'manual': 'Manual Entry',
  'profile': 'Profile',
  'student-groups': 'Groups',
};

const hiddenSessionParents = new Set(['qr-display', 'scan-attendance', 'manual']);

const isLikelyDynamicId = (segment: string): boolean => {
  // Matches numeric IDs, UUID-like IDs, and slug IDs such as "qr-session-001".
  return /^\d+$/.test(segment) || /^[a-z0-9]+(?:-[a-z0-9]+)+$/i.test(segment);
};

export const Breadcrumb: React.FC = () => {
  const location = useLocation();
  const { buildingName, roomName } = useBreadcrumb();
  
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
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;

    const parentSegment = pathSegments[index - 1];
    const nextSegment = pathSegments[index + 1];

    // Skip intermediate 'buildings' segment if followed by building name ID
    if (segment === 'buildings' && nextSegment && isLikelyDynamicId(nextSegment)) {
      return;
    }

    // Skip 'lab-room' segment if followed by room ID (we'll add room name from context instead)
    if (segment === 'lab-room' && nextSegment && isLikelyDynamicId(nextSegment)) {
      return;
    }

    // Handle dynamic building ID - use buildingName from context
    if (parentSegment === 'buildings' && isLikelyDynamicId(segment) && buildingName) {
      breadcrumbs.push({ label: buildingName, path: currentPath });
      return;
    }

    if (parentSegment && isLikelyDynamicId(segment)) {
      if (hiddenSessionParents.has(parentSegment)) {
        return;
      }

      // Handle dynamic room ID - use roomName from context
      // If we have roomName, skip adding "Lab Room" label
      if (parentSegment === 'lab-room' && roomName) {
        // Add building name if not already added
        if (buildingName && !breadcrumbs.some((b) => b.label === buildingName)) {
          breadcrumbs.push({ label: buildingName, path: `/lab-room/${segment}` });
        }
        breadcrumbs.push({ label: roomName, path: currentPath });
        return;
      }
    }

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

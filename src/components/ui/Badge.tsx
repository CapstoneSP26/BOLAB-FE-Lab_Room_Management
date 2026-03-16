/**
 * Badge Component
 * Notification badges for navigation items
 */

import React from 'react';

interface BadgeProps {
  count?: number;
  type?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  pulse?: boolean;
  dot?: boolean;
  className?: string;
}

const badgeStyles = {
  default: 'bg-gray-500 text-white',
  success: 'bg-green-500 text-white',
  warning: 'bg-amber-500 text-white',
  danger: 'bg-red-500 text-white',
  info: 'bg-blue-500 text-white',
};

export const Badge: React.FC<BadgeProps> = ({
  count = 0,
  type = 'danger',
  pulse = false,
  dot = false,
  className = '',
}) => {
  if (count === 0 && !dot) return null;

  if (dot) {
    return (
      <span
        className={`
          absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full
          ${badgeStyles[type]}
          ${pulse ? 'animate-badge-pulse' : ''}
          ${className}
        `}
      />
    );
  }

  const displayCount = count > 99 ? '99+' : count.toString();

  return (
    <span
      className={`
        absolute -top-2 -right-2
        min-w-[1.25rem] h-5 px-1.5
        flex items-center justify-center
        text-xs font-bold rounded-full
        ${badgeStyles[type]}
        ${pulse ? 'animate-badge-pulse' : ''}
        shadow-lg
        ${className}
      `}
    >
      {displayCount}
    </span>
  );
};

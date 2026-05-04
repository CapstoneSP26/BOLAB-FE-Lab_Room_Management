/**
 * RoomStatusBadge Component
 * Live indicator for room availability status
 */

import React from 'react';
import { Circle, Users, Clock } from 'lucide-react';

export type RoomStatus = 'available' | 'occupied' | 'reserved' | 'maintenance';

interface RoomStatusBadgeProps {
  status: RoomStatus;
  showLabel?: boolean;
  showIcon?: boolean;
  pulse?: boolean;
  className?: string;
  occupancy?: {
    current: number;
    capacity: number;
  };
  nextAvailable?: string; // Time when room becomes available
}

const statusConfig: Record<RoomStatus, {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ElementType;
}> = {
  available: {
    label: 'Available',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-300',
    icon: Circle,
  },
  occupied: {
    label: 'Occupied',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-300',
    icon: Circle,
  },
  reserved: {
    label: 'Reserved',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-300',
    icon: Clock,
  },
  maintenance: {
    label: 'Maintenance',
    color: 'text-amber-800',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-300',
    icon: Circle,
  },
};

export const RoomStatusBadge: React.FC<RoomStatusBadgeProps> = ({
  status,
  showLabel = true,
  showIcon = true,
  pulse = false,
  className = '',
  occupancy,
  nextAvailable,
}) => {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={`
        inline-flex items-center gap-2 px-3 py-1.5 rounded-full
        border-2 ${config.borderColor} ${config.bgColor} ${config.color}
        ${pulse && (status === 'available' || status === 'occupied') ? 'animate-badge-pulse' : ''}
        ${className}
      `}
    >
      {showIcon && (
        <Icon 
          className={`w-3 h-3 ${status === 'available' || status === 'occupied' ? 'fill-current' : ''}`} 
        />
      )}
      
      {showLabel && (
        <span className="text-xs font-medium">
          {config.label}
        </span>
      )}

      {occupancy && (
        <div className="flex items-center gap-1 ml-1 pl-2 border-l border-current/20">
          <Users className="w-3 h-3" />
          <span className="text-xs font-semibold">
            {occupancy.current}/{occupancy.capacity}
          </span>
        </div>
      )}

      {nextAvailable && status !== 'available' && (
        <div className="text-xs ml-1 pl-2 border-l border-current/20 font-normal">
          {nextAvailable}
        </div>
      )}
    </div>
  );
};

// Preset for compact display (icon only with tooltip)
export const RoomStatusDot: React.FC<{ status: RoomStatus; tooltip?: boolean }> = ({ 
  status, 
  tooltip = true 
}) => {
  const config = statusConfig[status];
  
  return (
    <span
      className={`
        inline-block w-2 h-2 rounded-full
        ${config.bgColor.replace('bg-', 'bg-').replace('-50', '-500')}
        ${status === 'available' || status === 'occupied' ? 'animate-badge-pulse' : ''}
      `}
      title={tooltip ? config.label : undefined}
    />
  );
};

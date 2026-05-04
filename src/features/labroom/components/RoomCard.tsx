import React from 'react';
import { Users, Wifi, Monitor, MoreVertical, Clock } from 'lucide-react';
import { RoomStatusBadge } from '../../../components/ui/RoomStatusBadge';
import type { RoomStatus } from '../../../components/ui/RoomStatusBadge';

const FALLBACK_ROOM_IMAGE = 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=1200';

interface RoomCardProps {
  name: string;
  capacity: number;
  status: 'Available' | 'Occupied' | 'Maintenance';
  nextAvailable: string;
  image: string;
  features: string[];
  onActionClick?: () => void;
}

const RoomCard: React.FC<RoomCardProps> = ({
  name,
  capacity,
  status,
  nextAvailable,
  image,
  features,
  onActionClick,
}) => {
  // Map status to RoomStatusBadge format
  const roomStatus: RoomStatus = status === 'Available' ? 'available' : status === 'Occupied' ? 'occupied' : 'maintenance';
  const cardToneClass =
    status === 'Available'
      ? 'border-emerald-200 hover:border-emerald-300 hover:shadow-emerald-100/80'
      : status === 'Occupied'
      ? 'border-rose-200 hover:border-rose-300 hover:shadow-rose-100/80'
      : 'border-amber-200 hover:border-amber-300 hover:shadow-amber-100/80';

  return (
    <div
      onClick={onActionClick}
      className={`group bg-white rounded-xl overflow-hidden shadow-card border hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 flex flex-col ${cardToneClass} ${
        onActionClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="relative h-40">
        <img
          src={image || FALLBACK_ROOM_IMAGE}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(event) => {
            const target = event.currentTarget;
            if (target.src !== FALLBACK_ROOM_IMAGE) {
              target.src = FALLBACK_ROOM_IMAGE;
            }
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
        <div className="absolute -left-16 top-0 h-full w-24 bg-white/20 blur-xl rotate-12 transition-transform duration-700 group-hover:translate-x-80" />
        <div className="absolute top-3 right-3">
          <RoomStatusBadge 
            status={roomStatus} 
            pulse={status === 'Available'}
            className="shadow-lg backdrop-blur-md bg-opacity-90"
          />
        </div>
        <div className="absolute bottom-3 left-3 flex gap-2">
            {features.includes('wifi') && (
                <div className="p-1.5 bg-black/50 backdrop-blur-md rounded-md text-white"><Wifi className="h-3 w-3" /></div>
            )}
            {features.includes('screen') && (
                <div className="p-1.5 bg-black/50 backdrop-blur-md rounded-md text-white"><Monitor className="h-3 w-3" /></div>
            )}
        </div>
      </div>
      
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h4 className="text-lg font-bold text-gray-900">{name}</h4>
            <div className="flex items-center text-gray-500 text-xs mt-1">
              <Users className="h-3 w-3 mr-1" />
              <span>Max {capacity} people</span>
            </div>
          </div>
          <button
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
            onClick={(event) => event.stopPropagation()}
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between text-xs text-gray-500 mb-4">
           <div className="flex items-center">
             <Clock className="h-3 w-3 mr-1.5 text-brand-500" />
             <span>Next: {nextAvailable}</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export { RoomCard };
export default RoomCard;
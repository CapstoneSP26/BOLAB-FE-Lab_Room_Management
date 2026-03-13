import React from 'react';
import { Users, Wifi, Monitor, MoreVertical, Clock } from 'lucide-react';
import { Button } from '../../../components/Button';

interface RoomCardProps {
  name: string;
  capacity: number;
  status: 'Available' | 'Occupied' | 'Maintenance';
  nextAvailable: string;
  image: string;
  features: string[];
}

const RoomCard: React.FC<RoomCardProps> = ({ name, capacity, status, nextAvailable, image, features }) => {
  const statusStyles = {
    Available: 'bg-green-100 text-green-700 border-green-200',
    Occupied: 'bg-red-100 text-red-700 border-red-200',
    Maintenance: 'bg-orange-100 text-orange-700 border-orange-200',
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-card border border-gray-100 hover:shadow-card-hover transition-all duration-300 flex flex-col">
      <div className="relative h-40">
        <img src={image} alt={name} className="w-full h-full object-cover" />
        <div className="absolute top-3 right-3">
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${statusStyles[status]} shadow-sm backdrop-blur-md bg-opacity-90`}>
            {status}
          </span>
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
          <button className="text-gray-400 hover:text-gray-600">
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between text-xs text-gray-500 mb-4">
           <div className="flex items-center">
             <Clock className="h-3 w-3 mr-1.5 text-brand-500" />
             <span>Next: {nextAvailable}</span>
           </div>
        </div>

        <div className="mt-auto">
            <Button variant={status === 'Available' ? 'primary' : 'outline'} fullWidth size="sm" disabled={status !== 'Available'}>
                {status === 'Available' ? 'Book Now' : 'View Schedule'}
            </Button>
        </div>
      </div>
    </div>
  );
};

export { RoomCard };
export default RoomCard;
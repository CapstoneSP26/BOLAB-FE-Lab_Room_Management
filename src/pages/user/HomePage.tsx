import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User } from '../../types';
import { useBuildings } from '../../features/homepage';
import { BuildingCarousel3D } from '../../features/homepage/components/BuildingCarousel3D';
import { BookingDashboard } from '../../features/booking';
import { Loader2, Building2, Calendar } from 'lucide-react';

interface HomePageProps {
  user?: User; // Made optional to avoid router errors
  onLogout?: () => void;
}

// Mock data tạm thời cho buildings (sẽ xóa khi có API thật)
const MOCK_BUILDINGS = [
  {
    id: 'Alpha',
    name: 'Building Alpha',
    description: 'Engineering & High-Tech Labs',
    roomCount: 32,
    image: 'https://daihoc.fpt.edu.vn/wp-content/uploads/2021/05/20210512_giaiwa1.jpeg',
    color: 'bg-gradient-to-br from-orange-500 to-red-500',
  },
  {
    id: 'Gamma',
    name: 'Building Gamma',
    description: 'Multipurpose Area & Content Creation',
    roomCount: 28,
    image: 'https://vinaconex25.com.vn/wp-content/uploads/2020/06/2.jpg',
    color: 'bg-gradient-to-br from-blue-600 to-indigo-600',
  },
  {
    id: 'Delta',
    name: 'Building Delta',
    description: 'Research & Innovation Center',
    roomCount: 24,
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1200',
    color: 'bg-gradient-to-br from-purple-600 to-pink-600',
  },
];

// Renamed to HomePage and set default props
const HomePage: React.FC<HomePageProps> = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<'buildings' | 'bookings'>('bookings');

  // Fetch data using hooks (fallback to mock data when API not available)
  const { data: buildingsData, isLoading: buildingsLoading } = useBuildings();

  // Use mock data if API fails or no data
  const buildings = buildingsData?.data || MOCK_BUILDINGS;

  const handleSelectBuilding = (buildingId: string) => {
    // Navigate to building detail page
    navigate(`/building/${buildingId}`);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* View Toggle Buttons */}
      <div className="absolute top-6 left-8 z-[70] flex gap-2 bg-white/10 backdrop-blur-md 
                    rounded-full p-1 border border-white/20 shadow-xl">
        <button
          onClick={() => setActiveView('bookings')}
          className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300 ${activeView === 'bookings'
              ? 'bg-orange-500 text-white shadow-lg'
              : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
        >
          <Calendar className="h-4 w-4" />
          My Bookings
        </button>
        <button
          onClick={() => setActiveView('buildings')}
          className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300 ${activeView === 'buildings'
              ? 'bg-orange-500 text-white shadow-lg'
              : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
        >
          <Building2 className="h-4 w-4" />
          Explore Buildings
        </button>
      </div>

      {/* Buildings View */}
      <div
        className={`absolute inset-0 transition-all duration-500 ${activeView === 'buildings' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
      >
        {buildingsLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-12 w-12 animate-spin text-white" />
          </div>
        ) : (
          <BuildingCarousel3D
            buildings={buildings}
            onSelectBuilding={handleSelectBuilding}
          />
        )}
      </div>

      {/* Bookings View */}
      <div
        className={`absolute inset-0 transition-all duration-500 ${activeView === 'bookings' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
      >
        {/* Background Image with Overlay */}
        <div className="fixed inset-0 z-0">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: 'url(https://daihoc.fpt.edu.vn/wp-content/uploads/2021/05/20210512_giaiwa1.jpeg)',
            }}
          />
          {/* Dark Overlay for balanced readability */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-md" />

          {/* Subtle Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/40 via-transparent to-slate-900/40" />
        </div>

        <div className="relative z-10 h-screen pt-20 overflow-hidden">
          <BookingDashboard />
        </div>
      </div>
    </div>
  );
};

export default HomePage; // Default export cho lazy loading
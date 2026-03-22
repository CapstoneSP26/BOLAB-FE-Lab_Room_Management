import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User } from '../types';
import { useBuildings } from '../features/homepage';
import { BuildingCarousel3D } from '../features/homepage/components/BuildingCarousel3D';
import { BookingDashboard } from '../features/booking';
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
    <div className="min-h-screen relative overflow-hidden bg-[#f8f4ea]">
      <div className="pointer-events-none absolute -right-20 top-20 h-72 w-72 rounded-full border border-orange-300/70 bg-orange-100/65" />
      <div className="pointer-events-none absolute -left-16 bottom-10 h-56 w-56 rounded-full border border-sky-300/70 bg-sky-100/60" />

      {/* View Toggle Buttons */}
      <div className="absolute top-6 left-8 z-[70] flex gap-2 bg-[#fff4e8] rounded-full p-1 border border-orange-200 shadow-sm">
        <button
          onClick={() => setActiveView('bookings')}
          className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300 ${
            activeView === 'bookings'
              ? 'bg-orange-500 text-white shadow-sm'
              : 'text-slate-700 hover:text-slate-900 hover:bg-white/90'
          }`}
        >
          <Calendar className="h-4 w-4" />
          My Bookings
        </button>
        <button
          onClick={() => setActiveView('buildings')}
          className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300 ${
            activeView === 'buildings'
              ? 'bg-blue-500 text-white shadow-sm'
              : 'text-slate-700 hover:text-slate-900 hover:bg-white/90'
          }`}
        >
          <Building2 className="h-4 w-4" />
          Explore Buildings
        </button>
      </div>

      {/* Buildings View */}
      <div
        className={`absolute inset-0 transition-all duration-500 ${
          activeView === 'buildings' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {buildingsLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-12 w-12 animate-spin text-slate-500" />
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
        className={`absolute inset-0 transition-all duration-500 ${
          activeView === 'bookings' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(rgba(180, 83, 9, 0.12) 0.7px, transparent 0.7px), repeating-linear-gradient(135deg, rgba(2, 132, 199, 0.06) 0, rgba(2, 132, 199, 0.06) 1px, transparent 1px, transparent 24px)',
            backgroundSize: '18px 18px, 100% 100%',
            opacity: 0.4,
          }}
        />
        <div className="relative z-10 h-screen pt-20 overflow-hidden bg-[#f8f4ea]">
          <BookingDashboard />
        </div>
      </div>
    </div>
  );
};

export default HomePage; // Default export cho lazy loading
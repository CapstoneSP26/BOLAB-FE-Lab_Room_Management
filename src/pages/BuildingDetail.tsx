import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { User } from '../types';
import { useBuildingContext } from '../context/BuildingContext';
// import Sidebar removed
import RoomCard from '../features/homepage/components/RoomCard';
import {
  MOCK_BUILDING_DETAIL_BUILDINGS as MOCK_BUILDINGS,
  MOCK_BUILDING_DETAIL_ROOMS as MOCK_ROOMS,
} from '../features/room-booking/mocks/roomBookingMockData';
import { 
  Search, 
  ChevronLeft, 
  MapPin, 
  Building2,
  LayoutGrid,
  List,
  ChevronRight
} from 'lucide-react';

interface BuildingDetailProps {
  user?: User;
  onLogout?: () => void;
}

const BuildingDetail: React.FC<BuildingDetailProps> = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const { setActiveBuildingImage } = useBuildingContext();

  // Update building image when building is selected
  useEffect(() => {
    if (id) {
      const building = MOCK_BUILDINGS.find(b => b.id === id);
      if (building) {
        setActiveBuildingImage(building.image);
      }
    }
  }, [id, setActiveBuildingImage]);

  // Filter rooms based on selected building and search keyword
  const filteredRooms = useMemo(() => {
    return MOCK_ROOMS.filter(room => 
      room.building === id &&
      room.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [id, searchQuery]);

  // Pagination logic
  const totalPages = Math.ceil(filteredRooms.length / itemsPerPage);
  const paginatedRooms = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredRooms.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredRooms, currentPage]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const currentBuilding = MOCK_BUILDINGS.find(b => b.id === id);

  const handleOpenRoomDetails = (room: (typeof MOCK_ROOMS)[number]) => {
    navigate(`/lab-room/${room.id}`, {
      state: {
        room: {
          ...room,
          id: String(room.id),
        },
      },
    });
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background matching building image */}
      <div className="fixed inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
          style={{ 
            backgroundImage: currentBuilding ? `url(${currentBuilding.image})` : 'none',
            filter: 'blur(15px) brightness(0.8)',
          }}
        />
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/30" />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-transparent to-black/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header Section */}
        <section className="text-white pt-12 pb-24 px-6 lg:px-20">
          <div className="max-w-7xl mx-auto">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-300 hover:text-white mb-10 transition-colors group px-4 py-2 rounded-lg hover:bg-white/10"
            >
              <ChevronLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" /> 
              <span className="font-medium">Back to Overview</span>
            </button>
            
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500 text-white text-[11px] font-black uppercase tracking-[0.14em] border-2 border-emerald-300 shadow-[0_8px_22px_rgba(16,185,129,0.45)]">
                    <span className="relative inline-flex h-2.5 w-2.5">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-white/70 animate-ping"></span>
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white"></span>
                    </span>
                    Active Building
                  </div>
                  <div className="flex items-center gap-1.5 text-white text-sm font-semibold bg-black/35 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/20 shadow-md">
                    <MapPin className="h-3.5 w-3.5" /> FPT University Da Nang
                  </div>
                </div>
                <h1 className="text-7xl font-black tracking-tighter mb-2 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                  {currentBuilding?.name || `Building ${id}`}
                </h1>
                <p className="text-gray-300 text-lg">
                  {currentBuilding?.description || 'Smart room management and booking'}
                </p>
              </div>
              
              <div className="w-full lg:max-w-xl relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Search room name, ID, or equipment..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-2xl py-5 pl-14 pr-6 text-lg placeholder:text-gray-400 focus:bg-white focus:text-black focus:ring-4 focus:ring-brand-500/30 focus:border-brand-500 transition-all outline-none backdrop-blur-md shadow-xl text-white"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Room List */}
        <main className="flex-1 px-6 lg:px-20 pb-20 -mt-12">
          <div className="max-w-7xl mx-auto relative">
            <div className="pointer-events-none absolute -top-10 -left-10 h-44 w-44 rounded-full bg-orange-300/25 blur-3xl animate-pulse" />
            <div className="pointer-events-none absolute top-20 -right-10 h-56 w-56 rounded-full bg-cyan-200/25 blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }} />
            {/* Glassmorphism Container */}
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-white/50 animate-fade-in">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                    <Building2 className="h-8 w-8 text-brand-600" />
                    Resource List
                  </h2>
                  <div className="inline-flex items-center gap-2.5 rounded-xl border border-slate-300 bg-slate-100 px-4 py-2 shadow-sm">
                    <span className="inline-flex h-2.5 w-2.5 rounded-full bg-slate-500"></span>
                    <span className="text-xs font-bold uppercase tracking-wide text-slate-600">Total Rooms</span>
                    <span className="text-lg font-black text-slate-800 leading-none">
                      {filteredRooms.length}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-3 rounded-xl transition-colors ${
                      viewMode === 'grid' 
                        ? 'bg-brand-600 text-white shadow-lg' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <LayoutGrid className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={() => setViewMode('list')}
                    className={`p-3 rounded-xl transition-colors ${
                      viewMode === 'list' 
                        ? 'bg-brand-600 text-white shadow-lg' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <List className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Room Grid/List */}
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
                : "flex flex-col gap-4"
              }>
                {filteredRooms.length === 0 ? (
                  <div className={`${viewMode === 'grid' ? 'col-span-3' : ''} flex flex-col items-center justify-center py-20 text-gray-500`}>
                    <Building2 className="h-16 w-16 mb-4 text-gray-300" />
                    <p className="text-lg font-medium">No rooms found</p>
                    <p className="text-sm">Try adjusting your search criteria</p>
                  </div>
                ) : (
                  paginatedRooms.map((room, idx) => (
                    <div 
                      key={room.id} 
                      className={`transition-all duration-300 animate-fade-in ${
                        viewMode === 'grid' 
                          ? 'hover:scale-[1.02]' 
                          : 'rounded-2xl p-4 border border-transparent hover:border-orange-100 hover:shadow-xl hover:bg-gradient-to-r hover:from-orange-50/50 hover:to-white hover:-translate-y-0.5'
                      }`}
                      style={{ animationDelay: `${idx * 70}ms`, animationDuration: '500ms' }}
                    >
                      {viewMode === 'grid' ? (
                        <RoomCard 
                          name={room.name}
                          capacity={room.capacity}
                          status={room.status as 'Available' | 'Occupied' | 'Maintenance'}
                          image={room.image}
                          nextAvailable={room.nextAvailable || "14:00 PM"}
                          features={room.features || ['wifi', 'screen']}
                          onActionClick={() => handleOpenRoomDetails(room)}
                        />
                      ) : (
                        <div
                          className="flex gap-6 items-center cursor-pointer"
                          onClick={() => handleOpenRoomDetails(room)}
                        >
                          <img 
                            src={room.image} 
                            alt={room.name} 
                            className="w-32 h-32 object-cover rounded-xl transition-transform duration-300 hover:scale-105"
                          />
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{room.name}</h3>
                            <div className="flex gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Building2 className="h-4 w-4" />
                                Capacity: {room.capacity}
                              </span>
                              <span className={`px-3 py-1 rounded-full font-medium ${
                                room.status === 'Available' 
                                  ? 'bg-green-100 text-green-700' 
                                  : room.status === 'Occupied' 
                                  ? 'bg-red-100 text-red-700' 
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {room.status}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500 mb-2">Next Available</p>
                            <p className="text-lg font-bold text-brand-600">{room.nextAvailable}</p>
                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                handleOpenRoomDetails(room);
                              }}
                              className="mt-3 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold cursor-pointer transition-all duration-200 hover:scale-105"
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Pagination */}
              {filteredRooms.length > itemsPerPage && (
                <div className="flex items-center justify-between mt-8 pt-8 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredRooms.length)} of {filteredRooms.length} rooms
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </button>
                    <div className="flex gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-10 h-10 rounded-xl transition-colors ${
                            currentPage === page
                              ? 'bg-brand-600 text-white shadow-lg'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default BuildingDetail;
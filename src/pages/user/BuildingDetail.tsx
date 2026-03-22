import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { User } from '../../types';
import { useBuildingContext } from '../../context/BuildingContext';
// import Sidebar removed
import RoomCard from '../../features/homepage/components/RoomCard';
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

// Sample data consistent with building selection logic
const MOCK_ROOMS = [
  // Building Alpha - Engineering & High-Tech Labs
  { id: 1, name: "Quantum Lab A", building: "Alpha", capacity: 12, status: "Available", image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=400", features: ['wifi', 'screen'], nextAvailable: "14:00 PM" },
  { id: 2, name: "AI Innovation Hub", building: "Alpha", capacity: 25, status: "Occupied", image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=400", features: ['wifi', 'screen'], nextAvailable: "16:00 PM" },
  { id: 5, name: "Neural Networks Lab", building: "Alpha", capacity: 20, status: "Available", image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=400", features: ['wifi', 'screen'], nextAvailable: "Now" },
  { id: 6, name: "Cyber Security Center", building: "Alpha", capacity: 18, status: "Available", image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=400", features: ['wifi', 'screen'], nextAvailable: "Now" },
  { id: 7, name: "IoT Workshop", building: "Alpha", capacity: 16, status: "Occupied", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=400", features: ['wifi', 'screen'], nextAvailable: "15:30 PM" },
  { id: 8, name: "Data Science Lab", building: "Alpha", capacity: 22, status: "Available", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=400", features: ['wifi', 'screen'], nextAvailable: "Now" },
  { id: 13, name: "Test Lab", building: "Alpha", capacity: 22, status: "Available", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=400", features: ['wifi', 'screen'], nextAvailable: "Now" },
  // Building Gamma - Multipurpose Area & Content Creation
  { id: 3, name: "Robotics Center", building: "Gamma", capacity: 30, status: "Available", image: "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&q=80&w=400", features: ['wifi', 'screen'], nextAvailable: "13:00 PM" },
  { id: 4, name: "Digital Arts Studio", building: "Gamma", capacity: 15, status: "Maintenance", image: "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=400", features: ['wifi'], nextAvailable: "Tomorrow" },
  { id: 9, name: "3D Printing Lab", building: "Gamma", capacity: 14, status: "Available", image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&q=80&w=400", features: ['wifi', 'screen'], nextAvailable: "Now" },
  { id: 10, name: "VR/AR Studio", building: "Gamma", capacity: 12, status: "Occupied", image: "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?auto=format&fit=crop&q=80&w=400", features: ['wifi', 'screen'], nextAvailable: "17:00 PM" },

  // Building Delta - Research & Innovation Center
  { id: 11, name: "Blockchain Lab", building: "Delta", capacity: 20, status: "Available", image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=400", features: ['wifi', 'screen'], nextAvailable: "Now" },
  { id: 12, name: "Quantum Computing", building: "Delta", capacity: 8, status: "Occupied", image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=400", features: ['wifi', 'screen'], nextAvailable: "18:00 PM" },
];

const MOCK_BUILDINGS = [
  {
    id: 'Alpha',
    name: 'Building Alpha',
    description: 'Engineering & High-Tech Labs',
    image: 'https://daihoc.fpt.edu.vn/wp-content/uploads/2021/05/20210512_giaiwa1.jpeg',
  },
  {
    id: 'Gamma',
    name: 'Building Gamma',
    description: 'Multipurpose Area & Content Creation',
    image: 'https://vinaconex25.com.vn/wp-content/uploads/2020/06/2.jpg',
  },
  {
    id: 'Delta',
    name: 'Building Delta',
    description: 'Research & Innovation Center',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1200',
  },
];

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
                  <div className="px-4 py-2 rounded-full bg-gradient-to-r from-brand-500 to-brand-600 text-[10px] font-black uppercase tracking-[0.2em] shadow-lg">
                    Active Building
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-300 text-sm font-medium bg-white/5 px-3 py-1.5 rounded-full backdrop-blur-sm">
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
          <div className="max-w-7xl mx-auto">
            {/* Glassmorphism Container */}
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-white/50">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                    <Building2 className="h-8 w-8 text-brand-600" />
                    Resource List
                  </h2>
                  <span className="px-3 py-1 bg-brand-100 text-brand-700 rounded-full text-sm font-bold">
                    {filteredRooms.length} rooms
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-3 rounded-xl transition-colors ${viewMode === 'grid'
                        ? 'bg-brand-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    <LayoutGrid className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-3 rounded-xl transition-colors ${viewMode === 'list'
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
                      className={`transition-all duration-300 animate-in fade-in ${viewMode === 'grid'
                          ? 'hover:scale-[1.02] slide-in-from-right'
                          : 'hover:shadow-xl hover:bg-gray-50 rounded-2xl p-4'
                        }`}
                      style={{ animationDelay: `${idx * 100}ms`, animationDuration: '500ms' }}
                    >
                      {viewMode === 'grid' ? (
                        <RoomCard
                          name={room.name}
                          capacity={room.capacity}
                          status={room.status as 'Available' | 'Occupied' | 'Maintenance'}
                          image={room.image}
                          nextAvailable={room.nextAvailable || "14:00 PM"}
                          features={room.features || ['wifi', 'screen']}
                        />
                      ) : (
                        <div className="flex gap-6 items-center">
                          <img
                            src={room.image}
                            alt={room.name}
                            className="w-32 h-32 object-cover rounded-xl"
                          />
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{room.name}</h3>
                            <div className="flex gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Building2 className="h-4 w-4" />
                                Capacity: {room.capacity}
                              </span>
                              <span className={`px-3 py-1 rounded-full font-medium ${room.status === 'Available'
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
                          className={`w-10 h-10 rounded-xl transition-colors ${currentPage === page
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
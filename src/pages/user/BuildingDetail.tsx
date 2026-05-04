import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { User } from '../../types';
import { useBuildingContext } from '../../context/BuildingContext';
import { useBreadcrumb } from '../../context/BreadcrumbContext';
import RoomCard from '../../features/labroom/components/RoomCard';
import { labroomApi } from '../../features/labroom/api/labroom.api';
import { buildingApi, type BuildingResponse } from '../../features/building';
import { addCacheBuster } from '../../utils/imageCache';

import {
  Search,
  ChevronLeft,
  MapPin,
  Building2,
  LayoutGrid,
  List,
  ChevronRight,
  AlertCircle,
  Loader
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

const BuildingDetail: React.FC<BuildingDetailProps> = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [building, setBuilding] = useState<BuildingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [rooms, setRooms] = useState<(typeof MOCK_ROOMS)[number][]>([]);
  const [totalRoomsCount, setTotalRoomsCount] = useState(0);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const itemsPerPage = 6;
  const { setActiveBuildingImage } = useBuildingContext();
  const { setBuildingName, setRoomName } = useBreadcrumb();

  // Fetch building data từ backend
  useEffect(() => {
    const fetchBuilding = async () => {
      try {
        setLoading(true);
        setError(null);
        if (id) {
          // Decode URL parameter in case it's encoded
          const buildingNameDecoded = decodeURIComponent(id);
          const data = await buildingApi.getBuildingByName(buildingNameDecoded);
          setBuilding(data as BuildingResponse);
          // Update breadcrumb context with building name
          setBuildingName(buildingNameDecoded);
          // Reset room name when changing building
          setRoomName('');
          // Update context với hình ảnh tòa nhà
          if (data.buildingImageUrl) {
            setActiveBuildingImage(addCacheBuster(data.buildingImageUrl));
          }
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : `Không thể tải thông tin tòa nhà "${id}"`
        );
        console.error('Error fetching building:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBuilding();
  }, [id, setActiveBuildingImage, setBuildingName, setRoomName]);

  useEffect(() => {
    const fetchRooms = async () => {
      if (!building?.id) return;
      try {
        setRoomsLoading(true);
        const response = await labroomApi.getRooms({
          buildingId: building.id,
          includeImages: true,
          includeBuilding: true,
          pageNumber: 1,
          pageSize: 100,
        });

        setTotalRoomsCount(response.totalCount || response.items.length);

        const mappedRooms = response.items
          .filter((room) => room.buildingId === building.id)
          .map((room) => ({
            id: room.id,
            name: room.roomName || room.roomNo,
            building: room.buildingName,
            capacity: room.capacity,
            status: room.isActive ? 'Available' : 'Maintenance',
            image: room.images?.[0]?.url || 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=400',
            features: ['wifi', 'screen'],
            nextAvailable: 'Now',
          }));

        setRooms(mappedRooms);
      } catch (err) {
        console.error('Error fetching rooms:', err);
        setRooms([]);
        setTotalRoomsCount(0);
      } finally {
        setRoomsLoading(false);
      }
    };

    fetchRooms();
  }, [building?.id]);

  // Filter rooms based on search keyword
  const filteredRooms = useMemo(() => {
    return rooms.filter((room) =>
      room.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [rooms, searchQuery]);

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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-12 w-12 text-brand-600 animate-spin mx-auto mb-4" />
          <p className="text-lg text-gray-700">Đang tải thông tin tòa nhà...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !building) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
            <h2 className="text-2xl font-bold text-gray-900">Lỗi</h2>
          </div>
          <p className="text-gray-700 mb-6">{error || `Tòa nhà "${id}" không tồn tại`}</p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl transition-colors"
          >
            Quay lại trang chủ
          </button>
        </div>
      </div>
    );
  }

  const currentBuilding = building;

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
            backgroundImage: `url(${addCacheBuster(currentBuilding.buildingImageUrl)})`,
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
              <span className="font-medium">Quay lại tổng quan</span>
            </button>

            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="px-4 py-2 rounded-full bg-gradient-to-r from-brand-500 to-brand-600 text-[10px] font-black uppercase tracking-[0.2em] shadow-lg">
                    Tòa nhà đang chọn
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-300 text-sm font-medium bg-white/5 px-3 py-1.5 rounded-full backdrop-blur-sm">
                    <MapPin className="h-3.5 w-3.5" />
                    {currentBuilding.campusName || 'FPT University Da Nang'}
                  </div>
                </div>
                <h1 className="text-7xl font-black tracking-tighter mb-2 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                  {currentBuilding.buildingName}
                </h1>
                <p className="text-gray-300 text-lg">
                  {currentBuilding.description}
                </p>
              </div>

              <div className="w-full lg:max-w-xl relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Tìm kiếm tên phòng, ID hoặc thiết bị..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/95 border border-slate-200 rounded-2xl py-5 pl-14 pr-6 text-lg placeholder:text-slate-400 focus:bg-white focus:text-slate-900 focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none shadow-xl text-slate-800"
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
            <div className="bg-white/97 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-slate-200 animate-fade-in">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                    <Building2 className="h-8 w-8 text-brand-600" />
                    Danh sách phòng
                  </h2>
                  <span className="px-3 py-1 bg-brand-100 text-brand-700 rounded-full text-sm font-bold">
                    {totalRoomsCount} phòng
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-3 rounded-xl transition-all ${viewMode === 'grid'
                      ? 'bg-brand-600 text-brand-100 shadow-xl scale-105'
                      : 'bg-white text-brand-600'
                      }`}
                  >
                    <LayoutGrid className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-3 rounded-xl transition-all ${viewMode === 'list'
                      ? 'bg-brand-600 text-brand-100 shadow-xl scale-105'
                      : 'bg-white text-brand-600'
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
                {roomsLoading ? (
                  <div className={`${viewMode === 'grid' ? 'col-span-3' : ''} flex flex-col items-center justify-center py-20 text-gray-500`}>
                    <Loader className="h-10 w-10 mb-4 text-gray-400 animate-spin" />
                    <p className="text-lg font-medium">Đang tải danh sách phòng...</p>
                  </div>
                ) : filteredRooms.length === 0 ? (
                  <div className={`${viewMode === 'grid' ? 'col-span-3' : ''} flex flex-col items-center justify-center py-20 text-gray-500`}>
                    <Building2 className="h-16 w-16 mb-4 text-gray-300" />
                    <p className="text-lg font-medium">Không tìm thấy phòng</p>
                    <p className="text-sm">Hãy thử điều chỉnh tiêu chí tìm kiếm</p>
                  </div>
                ) : (
                  paginatedRooms.map((room, idx) => (
                    <div
                      key={room.id}
                      className={`transition-all duration-300 animate-fade-in ${viewMode === 'grid'
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
                          className="flex gap-6 items-center cursor-pointer bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all"
                          onClick={() => handleOpenRoomDetails(room)}
                        >
                          <img
                            src={room.image}
                            alt={room.name}
                            className="w-32 h-32 object-cover rounded-xl border border-slate-200 transition-transform duration-300 hover:scale-105"
                          />
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-slate-900 mb-2">{room.name}</h3>
                            <div className="flex gap-4 text-sm text-slate-600">
                              <span className="flex items-center gap-1">
                                <Building2 className="h-4 w-4" />
                                Sức chứa: {room.capacity}
                              </span>
                              <span className={`px-3 py-1 rounded-full font-semibold ${room.status === 'Available'
                                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                : room.status === 'Occupied'
                                  ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                  : 'bg-amber-100 text-amber-700 border border-amber-200'
                                }`}>
                                {room.status === 'Available' ? 'Trống' : room.status === 'Occupied' ? 'Đang sử dụng' : 'Bảo trì'}
                              </span>
                            </div>
                          </div>
                          <div className="text-right min-w-[130px]">
                            <p className="text-sm text-slate-500 mb-1">Rảnh lúc</p>
                            <p className="text-xl font-extrabold text-brand-700">{room.nextAvailable}</p>
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
                    Hiển thị {((currentPage - 1) * itemsPerPage) + 1} đến {Math.min(currentPage * itemsPerPage, filteredRooms.length)} trong {filteredRooms.length} phòng
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Trước
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
                      Sau
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
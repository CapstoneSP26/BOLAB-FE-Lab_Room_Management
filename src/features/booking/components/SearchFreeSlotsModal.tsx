import React from 'react';
import { CalendarDays, Clock, MapPin, X, Building2 } from 'lucide-react';
import { BuildingSelector } from '../../building/components/BuildingSelector';
import { RoomSelector } from '../../labroom/components/RoomSelector';
import { useLabRooms } from '../../labroom/hooks/useLabRooms';
import type { BuildingDto } from '../../building/types/building.type';

type FreeSlotItem = {
  roomId?: number;
  buildingId?: number;
  roomName?: string;
  buildingName?: string;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
};

interface SearchFreeSlotsModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchError: string | null;
  searchLoading: boolean;
  searchStartDay: string;
  searchEndDay: string;
  searchStartTime: string;
  searchEndTime: string;
  searchDuration: string;
  onChangeStartDay: (value: string) => void;
  onChangeEndDay: (value: string) => void;
  onChangeStartTime: (value: string) => void;
  onChangeEndTime: (value: string) => void;
  onChangeDuration: (value: string) => void;
  onSearch: () => void;
  searchResults: FreeSlotItem[];
  selectedSearchSlot: FreeSlotItem | null;
  onSelectSlot: (slot: FreeSlotItem) => void;
  onConfirmSelection: () => void;
  buildings: BuildingDto[];
  buildingsLoading: boolean;
  initialBuildingId?: string;
  initialRoomId?: string;
}

const SkeletonLine: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse rounded-lg bg-gray-200 ${className}`} />
);

const SearchResultSkeleton: React.FC = () => (
  <div className="space-y-3 border-t border-gray-200 pt-4">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <SkeletonLine className="h-4 w-40" />
        <SkeletonLine className="h-3 w-56" />
      </div>
      <SkeletonLine className="h-8 w-20 rounded-full" />
    </div>

    <div className="space-y-2">
      {[0, 1, 2].map((item) => (
        <div key={item} className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2 flex-1">
              <SkeletonLine className="h-4 w-52" />
              <div className="flex gap-3">
                <SkeletonLine className="h-3 w-28" />
                <SkeletonLine className="h-3 w-32" />
              </div>
            </div>
            <SkeletonLine className="h-6 w-16 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const SearchFreeSlotsModal: React.FC<SearchFreeSlotsModalProps> = ({
  isOpen,
  onClose,
  searchError,
  searchLoading,
  searchStartDay,
  searchEndDay,
  searchStartTime,
  searchEndTime,
  searchDuration,
  onChangeStartDay,
  onChangeEndDay,
  onChangeStartTime,
  onChangeEndTime,
  onChangeDuration,
  onSearch,
  searchResults,
  selectedSearchSlot,
  onSelectSlot,
  onConfirmSelection,
  buildings,
  buildingsLoading,
  initialBuildingId,
  initialRoomId,
}) => {
  const [searchBuildingId, setSearchBuildingId] = React.useState(initialBuildingId ?? '');
  const [highlightedSlot, setHighlightedSlot] = React.useState<FreeSlotItem | null>(null);

  React.useEffect(() => {
    if (!highlightedSlot) return;
    const timer = setTimeout(() => {
      setHighlightedSlot(null);
    }, 10000); // 10 seconds
    return () => clearTimeout(timer);
  }, [highlightedSlot]);

  const { data: pagedRooms, isLoading: roomsLoading } = useLabRooms({
    buildingId: Number(searchBuildingId),
    includeBuilding: true,
  });
  const rooms = React.useMemo(() => pagedRooms?.items ?? [], [pagedRooms]);
  const [searchRoomId, setSearchRoomId] = React.useState(initialRoomId ?? '');

  React.useEffect(() => {
    setSearchBuildingId(initialBuildingId ?? '');
  }, [initialBuildingId, isOpen]);

  React.useEffect(() => {
    setSearchRoomId(initialRoomId ?? '');
  }, [initialRoomId, isOpen]);

  const filteredRooms = React.useMemo(() => {
    if (!searchBuildingId) return rooms;
    return rooms.filter((room) => String(room.buildingId) === searchBuildingId);
  }, [rooms, searchBuildingId]);

  const handleBuildingSelect = (id: string) => {
    setSearchBuildingId(id);
    setSearchRoomId('');
  };

  const handleRoomSelect = (id: string) => {
    setSearchRoomId(id);
  };

  const canSearch = Boolean(searchStartDay && searchEndDay);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-scale-in max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-xl font-bold">Tìm khoảng trống</h3>
            <p className="text-sm text-white/90">Nhập khoảng ngày và giờ để tìm slot trống</p>
          </div>
          <button onClick={onClose} className="text-white/90 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          {searchError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {searchError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Start Day *</label>
              <input type="date" value={searchStartDay} onChange={(e) => onChangeStartDay(e.target.value)} className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">End Day *</label>
              <input type="date" value={searchEndDay} onChange={(e) => onChangeEndDay(e.target.value)} className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Start Time</label>
              <input type="time" value={searchStartTime} onChange={(e) => onChangeStartTime(e.target.value)} className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">End Time</label>
              <div className="w-full px-4 py-3 border rounded-lg bg-gray-50 text-gray-700 font-semibold flex items-center">
                11:00
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Duration</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  value={searchDuration}
                  onChange={(e) => {
                    let value = e.target.value;
                    // Only allow digits
                    value = value.replace(/\D/g, '');
                    
                    // Limit to 4 digits max
                    if (value.length > 4) {
                      value = value.slice(0, 4);
                    }
                    
                    // Auto-format with : after 2 digits
                    if (value.length <= 2) {
                      onChangeDuration(value);
                    } else if (value.length === 3) {
                      onChangeDuration(`${value.slice(0, 2)}:${value[2]}`);
                    } else if (value.length === 4) {
                      onChangeDuration(`${value.slice(0, 2)}:${value.slice(2, 4)}`);
                    }
                  }}
                  onBlur={(e) => {
                    let value = e.target.value.trim();
                    
                    if (!value) {
                      onChangeDuration('');
                      return;
                    }
                    
                    // Extract only digits
                    let digits = value.replace(/\D/g, '');
                    
                    if (!digits) {
                      onChangeDuration('');
                      return;
                    }
                    
                    let hours = '00';
                    let minutes = '00';
                    
                    if (digits.length === 1) {
                      // 1 digit: interpret as minutes (e.g., "5" -> "00:05")
                      minutes = digits.padStart(2, '0');
                    } else if (digits.length === 2) {
                      const num = parseInt(digits);
                      if (num >= 24) {
                        // Interpret as minutes (e.g., "95" would be invalid, but "50" -> "00:50")
                        if (num >= 60) {
                          onChangeDuration('');
                          return;
                        }
                        minutes = digits;
                      } else {
                        // Interpret as hours (e.g., "13" -> "13:00")
                        hours = digits;
                      }
                    } else if (digits.length === 3) {
                      // HMM format (e.g., "130" -> "01:30")
                      hours = '0' + digits[0];
                      minutes = digits.slice(1, 3);
                    } else if (digits.length === 4) {
                      // HHMM format (e.g., "0950" -> "09:50")
                      hours = digits.slice(0, 2);
                      minutes = digits.slice(2, 4);
                    }
                    
                    // Final validation
                    const h = parseInt(hours);
                    const m = parseInt(minutes);
                    
                    if (h < 24 && m < 60) {
                      onChangeDuration(`${hours}:${minutes}`);
                    } else {
                      onChangeDuration('');
                    }
                  }}
                  placeholder="--:--"
                  maxLength={5}
                  className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 text-center font-semibold"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!searchDuration || !searchDuration.includes(':')) {
                      onChangeDuration('00:15');
                    } else {
                      const [h, m] = searchDuration.split(':').map(Number);
                      let newMinutes = m + 15;
                      let newHours = h;
                      
                      if (newMinutes >= 60) {
                        newHours += Math.floor(newMinutes / 60);
                        newMinutes = newMinutes % 60;
                      }
                      
                      if (newHours < 24) {
                        onChangeDuration(`${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`);
                      }
                    }
                  }}
                  className="px-3 py-3 border rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-600 font-semibold transition-colors"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (searchDuration && searchDuration.includes(':')) {
                      const [h, m] = searchDuration.split(':').map(Number);
                      let newMinutes = m - 15;
                      let newHours = h;
                      
                      if (newMinutes < 0) {
                        newHours -= 1;
                        newMinutes += 60;
                      }
                      
                      if (newHours >= 0) {
                        onChangeDuration(`${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`);
                      }
                    }
                  }}
                  className="px-3 py-3 border rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-600 font-semibold transition-colors"
                >
                  −
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-200">
            <BuildingSelector
              buildings={buildings}
              isLoading={buildingsLoading}
              selectedId={searchBuildingId}
              onSelect={handleBuildingSelect}
            />
            <RoomSelector
              rooms={filteredRooms}
              isLoading={roomsLoading}
              selectedRoomId={searchRoomId}
              onSelect={handleRoomSelect}
              selectedBuildingId={searchBuildingId}
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={onSearch}
              disabled={searchLoading || !canSearch}
              className="px-4 py-2 rounded-lg bg-orange-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-700 transition-colors"
            >
              {searchLoading ? 'Đang tìm...' : 'Tìm slot trống'}
            </button>
          </div>

          {searchLoading ? (
            <SearchResultSkeleton />
          ) : searchResults.length > 0 ? (
            <div className="space-y-3 border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Kết quả tìm thấy</p>
                  <p className="text-xs text-gray-500">Chọn một slot để mở sang trang booking</p>
                </div>
                <span className="text-xs font-semibold text-orange-700 bg-orange-50 border border-orange-200 px-3 py-1 rounded-full">
                  {searchResults.length} slots
                </span>
              </div>

              <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                {searchResults.map((slot, index) => {
                  const isSelected = highlightedSlot === slot;
                  return (
                    <button
                      key={`${slot.roomId}-${slot.startDate}-${slot.startTime}-${index}`}
                      type="button"
                      onClick={() => {
                        onSelectSlot(slot);
                        setHighlightedSlot(slot);
                      }}
                      className={`w-full text-left rounded-xl border p-4 transition-all ${isSelected ? 'border-orange-400 bg-orange-50 shadow-sm' : 'border-gray-200 bg-white hover:border-orange-300 hover:bg-orange-50/40'}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                            <MapPin className="w-4 h-4 text-orange-500" />
                            <span>{slot.roomName || `Room ${slot.roomId}`}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Building2 className="w-3.5 h-3.5" />
                            <span>{slot.buildingName || `Building ${slot.buildingId ?? '—'}`}</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-600 flex-wrap">
                            <span className="inline-flex items-center gap-1"><CalendarDays className="w-4 h-4" />{slot.startDate}</span>
                            <span className="inline-flex items-center gap-1"><Clock className="w-4 h-4" />{slot.startTime} - {slot.endTime}</span>
                          </div>
                        </div>
                        <div className={`mt-1 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${isSelected ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                          {isSelected ? 'Đã chọn' : 'Chọn'}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500 border-t border-gray-200 pt-4">
              Chưa có kết quả. Hãy bấm tìm để xem danh sách slot trống.
            </div>
          )}

          <div className="flex justify-between items-center pt-2 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              Chọn khoảng ngày trước, sau đó bấm tìm để xem các slot trống.
            </div>
            <div className="flex gap-3">
              <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">Hủy</button>
              <button
                onClick={onConfirmSelection}
                disabled={!selectedSearchSlot}
                className="px-4 py-2 rounded-lg bg-orange-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-700 transition-colors"
              >
                Mở slot đã chọn
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

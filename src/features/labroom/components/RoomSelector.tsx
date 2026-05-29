import React, { useMemo } from 'react';
import { Building2, Loader2, Users, Layers, Cpu } from 'lucide-react';
import type { LabRoomDto } from '../types/room.type';

interface RoomSelectorProps {
  rooms: LabRoomDto[];
  isLoading: boolean;
  selectedRoomId?: string;
  onSelect: (id: string) => void;
  selectedBuildingId?: string; // Dùng để lock/unlock select
}

export const RoomSelector: React.FC<RoomSelectorProps> = ({
  rooms,
  isLoading,
  selectedRoomId,
  onSelect,
  selectedBuildingId,
}) => {
  // 1. Tìm thông tin phòng đang được chọn để hiện Detail Card
  // Backend trả về Id là number, nhưng value của select là string, nên dùng == hoặc ép kiểu
  const selectedRoom = useMemo(() =>
    rooms.find((r) => r.id === Number(selectedRoomId)),
    [rooms, selectedRoomId]
  );

  return (
    <div className="space-y-5">
      {/* --- PHẦN SELECT PHÒNG --- */}
      <div className="space-y-3">
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest flex items-center gap-2">
          <span className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 text-[10px] font-black shadow-sm">
            02
          </span>
          Chọn phòng Lab
        </label>

        {isLoading ? (
          <div className="flex items-center gap-3 text-gray-500 bg-gray-50 rounded-xl p-4 border-2 border-dashed border-gray-200">
            <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
            <span className="text-sm font-medium">Đang tải danh sách...</span>
          </div>
        ) : (
          <div className="relative group">
            <Building2 className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors z-10 pointer-events-none ${selectedRoomId ? 'text-orange-500' : 'text-gray-400 group-hover:text-orange-400'
              }`} />

            <select
              value={selectedRoomId}
              onChange={(e) => onSelect(e.target.value)}
              disabled={!selectedBuildingId} // Chỉ cho chọn khi đã chọn Building ở bước 1
              className="block w-full rounded-xl border-2 border-gray-300 shadow-sm focus:border-orange-400 focus:ring-4 focus:ring-orange-100 text-sm py-3.5 pl-11 pr-10 bg-white hover:border-orange-300 disabled:opacity-50 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all appearance-none cursor-pointer font-semibold text-gray-700"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ea580c' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: "right 0.75rem center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "1.2em 1.2em",
              }}
            >
              <option value="">-- Chọn phòng thực hành --</option>
              {rooms.filter((room) => room.isActive !== false).map((room) => (
                <option key={room.id} value={room.id}>
                  {room.roomName} {room.roomNo ? `[${room.roomNo}]` : ''}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* --- THẺ CHI TIẾT PHÒNG (DETAIL CARD) --- */}
      {selectedRoom && (
        <div className="overflow-hidden bg-orange-50/50 border border-orange-200 rounded-2xl p-4 shadow-inner animate-in fade-in zoom-in-95 duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-500 rounded-lg shadow-orange-200 shadow-lg">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-black text-gray-900 leading-none">{selectedRoom.roomName}</h3>
              <p className="text-[10px] text-orange-600 font-bold uppercase mt-1 tracking-wider">
                {selectedRoom.roomNo} • {selectedRoom.location || 'No Location'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white p-2.5 rounded-xl border border-orange-100 shadow-sm">
              <div className="flex items-center gap-1.5 text-gray-500 text-[10px] font-bold uppercase mb-1">
                <Users className="w-3 h-3" /> Sức chứa
              </div>
              <div className="text-sm font-black text-gray-900">{selectedRoom.capacity} SV</div>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-orange-100 shadow-sm">
              <div className="flex items-center gap-1.5 text-gray-500 text-[10px] font-bold uppercase mb-1">
                <Layers className="w-3 h-3" /> Tòa nhà
              </div>
              <div className="text-sm font-black text-gray-900 truncate">{selectedRoom.buildingName}</div>
            </div>
          </div>

          {/* Hiển thị Equipment Status */}
          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-orange-100 rounded-xl mb-4 shadow-sm">
            <Cpu className={`w-4 h-4 ${selectedRoom.hasEquipment ? 'text-green-500' : 'text-gray-300'}`} />
            <span className="text-[11px] font-bold text-gray-600">
              Thiết bị: {selectedRoom.hasEquipment ? 'Sẵn sàng' : 'Không có'}
            </span>
          </div>

          {/* Description (nếu có) */}
          {selectedRoom.description && (
            <div className="pt-3 border-t border-orange-200">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Mô tả:</span>
              <p className="text-[11px] text-gray-600 italic leading-relaxed">
                {selectedRoom.description}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
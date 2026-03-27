import React from 'react';
import { Building2, Loader2 } from 'lucide-react';
import type { BuildingDto } from '../types/building.type';

interface BuildingSelectorProps {
  buildings: BuildingDto[];
  isLoading: boolean;
  selectedId?: string;
  onSelect: (id: string) => void;
}

export const BuildingSelector: React.FC<BuildingSelectorProps> = ({
  buildings,
  isLoading,
  selectedId,
  onSelect,
}) => {
  return (
    <div className="space-y-3">
      {/* Label với Badge số 1 đồng bộ với số 2 của RoomSelector */}
      <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest flex items-center gap-2">
        <span className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 text-[10px] font-black shadow-sm">
          01
        </span>
        Chọn tòa nhà
      </label>

      {isLoading ? (
        <div className="flex items-center gap-3 text-gray-500 bg-gray-50 rounded-xl p-4 border-2 border-dashed border-gray-200">
          <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
          <span className="text-sm font-medium">Đang tải tòa nhà...</span>
        </div>
      ) : (
        <div className="relative group">
          <Building2 className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors z-10 pointer-events-none ${selectedId ? 'text-orange-500' : 'text-gray-400 group-hover:text-orange-400'
            }`} />

          <select
            value={selectedId}
            onChange={(e) => onSelect(e.target.value)}
            className="block w-full rounded-xl border-2 border-gray-300 shadow-sm focus:border-orange-400 focus:ring-4 focus:ring-orange-100 text-sm py-3.5 pl-11 pr-10 bg-white hover:border-orange-300 transition-all appearance-none cursor-pointer font-semibold text-gray-700"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ea580c' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: "right 0.75rem center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "1.2em 1.2em",
            }}
          >
            <option value="" className="text-gray-500">
              -- Chọn tòa nhà... --
            </option>
            {buildings.map((building) => (
              <option
                key={building.id}
                value={building.id}
                className="font-medium"
              >
                {building.buildingName}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};
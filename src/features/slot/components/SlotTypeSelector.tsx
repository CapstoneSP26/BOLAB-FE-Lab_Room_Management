import React from 'react';
import { Timer, LayoutGrid } from 'lucide-react';
import { useSlotStore } from '../../../store/slotStore';
import { FLEXIBLE_ID } from '../constants/slot.constant';

interface SlotTypeSelectorProps {
  selectedId: number;
  onSelect: (id: number) => void;
  isFlexibleAllowed?: boolean;
}

export const SlotTypeSelector: React.FC<SlotTypeSelectorProps> = ({
  selectedId,
  onSelect,
  isFlexibleAllowed = true,
}) => {
  // Lấy danh sách SlotType từ Zustand Store
  const { slotTypes } = useSlotStore();

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
        {isFlexibleAllowed && (
          <button
            onClick={() => onSelect(FLEXIBLE_ID)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium transition-all ${selectedId === FLEXIBLE_ID
              ? 'bg-white text-blue-700 shadow-sm border border-blue-200'
              : 'text-gray-600 hover:text-gray-900 hover:bg-white/70'
              }`}
          >
            <Timer className="w-4 h-4" />
            <span>Flexible</span>
          </button>)
        }

        {slotTypes.map((type) => {
          const isActive = selectedId === type.id;
          return (
            <button
              onClick={() => onSelect(type.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium transition-all ${isActive
                ? 'bg-white text-blue-700 shadow-sm border border-blue-200'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/70'
                }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>{type.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  );
};
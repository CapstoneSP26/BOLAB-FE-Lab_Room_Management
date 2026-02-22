import React, { useState } from 'react';
import { Clock, Calendar, Users, CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import type { TimeSlot } from '../types';
import { formatDate } from '../../../utils/formatDate';

interface AvailableSlotListProps {
  slots: TimeSlot[];
  selectedSlotIds: string[];
  onSelectSlot: (slotId: string) => void;
  onBookSelected?: () => void;
  onFilterChange?: (filters: { date: string; startTime: string; endTime: string }) => void;
  multiSelect?: boolean;
  loading?: boolean;
}

/**
 * 📋 Modern Available Room Slot List
 * Selection-based booking with beautiful card design and time range filter
 */
export const AvailableSlotList: React.FC<AvailableSlotListProps> = ({
  slots,
  selectedSlotIds,
  onSelectSlot,
  onBookSelected,
  onFilterChange,
  multiSelect = false,
  loading = false,
}) => {
  const [filterDate, setFilterDate] = useState<string>('');
  const [filterStartTime, setFilterStartTime] = useState<string>('');
  const [filterEndTime, setFilterEndTime] = useState<string>('');

  const handleApplyFilter = () => {
    if (onFilterChange && filterDate && filterStartTime && filterEndTime) {
      onFilterChange({
        date: filterDate,
        startTime: filterStartTime,
        endTime: filterEndTime,
      });
    }
  };

  const handleClearFilter = () => {
    setFilterDate('');
    setFilterStartTime('');
    setFilterEndTime('');
    if (onFilterChange) {
      onFilterChange({ date: '', startTime: '', endTime: '' });
    }
  };
  const getStatusConfig = (status: TimeSlot['status']) => {
    switch (status) {
      case 'Available':
        return {
          color: 'from-green-50 to-green-100',
          border: 'border-green-300',
          text: 'text-green-700',
          badge: 'bg-green-500',
          icon: <CheckCircle2 className="w-4 h-4" />,
        };
      case 'Booked':
        return {
          color: 'from-orange-50 to-orange-100',
          border: 'border-orange-300',
          text: 'text-orange-700',
          badge: 'bg-orange-500',
          icon: <XCircle className="w-4 h-4" />,
        };
      case 'Pending':
        return {
          color: 'from-yellow-50 to-yellow-100',
          border: 'border-yellow-300',
          text: 'text-yellow-700',
          badge: 'bg-yellow-500',
          icon: <AlertCircle className="w-4 h-4" />,
        };
      case 'Maintenance':
        return {
          color: 'from-gray-50 to-gray-100',
          border: 'border-gray-300',
          text: 'text-gray-700',
          badge: 'bg-gray-500',
          icon: <AlertCircle className="w-4 h-4" />,
        };
      default:
        return {
          color: 'from-gray-50 to-gray-100',
          border: 'border-gray-300',
          text: 'text-gray-700',
          badge: 'bg-gray-500',
          icon: null,
        };
    }
  };

  const isSlotSelectable = (slot: TimeSlot) => slot.status === 'Available';
  const isSlotSelected = (slotId: string) => selectedSlotIds.includes(slotId);

  const handleSlotClick = (slot: TimeSlot) => {
    if (!isSlotSelectable(slot)) return;
    onSelectSlot(slot.id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-500 mx-auto mb-4 animate-spin" />
          <p className="text-lg font-medium text-gray-700">Loading available slots...</p>
          <p className="text-sm text-gray-500 mt-1">Please wait</p>
        </div>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300">
        <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Slots Available</h3>
        <p className="text-gray-600">Try selecting a different time range or room.</p>
      </div>
    );
  }

  const availableCount = slots.filter(s => s.status === 'Available').length;

  return (
    <div className="space-y-6">
      {/* Filter Panel */}
      <div className="bg-gradient-to-br from-white to-orange-50 rounded-2xl shadow-md border-2 border-orange-200 p-6">
        <div className="mb-5">
          <h3 className="text-lg font-bold text-gray-900">Find Available Slots</h3>
          <p className="text-sm text-gray-600 mt-1">Filter by specific date and time range</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Date Input */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide flex items-center gap-2">
              <Calendar className="w-4 h-4 text-orange-600" />
              Date
            </label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all font-medium text-sm hover:border-orange-300 bg-white shadow-sm"
            />
          </div>

          {/* Start Time Input */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-600" />
              Start Time
            </label>
            <input
              type="time"
              value={filterStartTime}
              onChange={(e) => setFilterStartTime(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all font-medium text-sm hover:border-orange-300 bg-white shadow-sm"
            />
          </div>

          {/* End Time Input */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-600" />
              End Time
            </label>
            <input
              type="time"
              value={filterEndTime}
              onChange={(e) => setFilterEndTime(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all font-medium text-sm hover:border-orange-300 bg-white shadow-sm"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col justify-end gap-2">
            <button
              onClick={handleApplyFilter}
              disabled={!filterDate || !filterStartTime || !filterEndTime}
              className="px-5 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white font-bold rounded-lg hover:shadow-lg hover:from-orange-700 hover:to-orange-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none transition-all shadow-md text-sm"
            >
              🔍 Search
            </button>
            <button
              onClick={handleClearFilter}
              className="px-5 py-3 bg-white text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-all border-2 border-gray-300 hover:border-gray-400 text-sm shadow-sm"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Header Stats */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Time Slots
            </h3>
            <p className="text-gray-600">
              <span className="font-bold text-green-600">{availableCount}</span> available out of {slots.length} total
            </p>
          </div>
          
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span className="text-sm font-medium text-gray-700">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-orange-500"></div>
              <span className="text-sm font-medium text-gray-700">Booked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
              <span className="text-sm font-medium text-gray-700">Pending</span>
            </div>
          </div>
        </div>
      </div>

      {/* Slots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar pb-6">
        {slots.map((slot) => {
          const selectable = isSlotSelectable(slot);
          const selected = isSlotSelected(slot.id);
          const config = getStatusConfig(slot.status);

          return (
            <div
              key={slot.id}
              onClick={() => handleSlotClick(slot)}
              className={`
                relative border-2 rounded-xl p-5 transition-all duration-200
                bg-gradient-to-br ${config.color}
                ${config.border}
                ${
                  selectable
                    ? 'cursor-pointer hover:shadow-xl hover:border-orange-400 hover:bg-gradient-to-br hover:from-orange-50 hover:to-orange-100'
                    : 'cursor-not-allowed opacity-60'
                }
                ${
                  selected
                    ? ''
                    : ''
                }
              `}
            >
              {/* Status Badge */}
              <div className="absolute top-3 right-3">
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${config.badge} text-white text-xs font-bold uppercase shadow-md`}>
                  {config.icon}
                  <span>{slot.status}</span>
                </div>
              </div>

              {/* Selection Indicator - Center checkmark */}
              {selected && selectable && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                  <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center shadow-lg">
                    <CheckCircle2 className="w-8 h-8 text-white" />
                  </div>
                </div>
              )}

              {/* Slot Content */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <Calendar className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Date</p>
                    <p className="text-sm font-bold text-gray-900">
                      {formatDate(new Date(slot.date), 'MMM DD, YYYY')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <Clock className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Time</p>
                    <p className="text-sm font-bold text-gray-900">
                      {slot.startTime} - {slot.endTime}
                    </p>
                  </div>
                </div>

                {slot.bookedBy && (
                  <div className="flex items-center gap-3 pt-2 border-t border-gray-300">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <Users className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Booked by</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {slot.bookedBy}
                        {slot.groupName && <span className="text-gray-600"> • {slot.groupName}</span>}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selection Summary & Book Button */}
      {multiSelect && selectedSlotIds.length > 0 && onBookSelected && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4">
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-orange-400 p-6 animate-fade-in">
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                  <CheckCircle2 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">
                    {selectedSlotIds.length} slot{selectedSlotIds.length > 1 ? 's' : ''} selected
                  </p>
                  <p className="text-sm text-gray-600">
                    Click "Book Now" to confirm your selection
                  </p>
                </div>
              </div>
              <button
                onClick={onBookSelected}
                className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2 whitespace-nowrap"
              >
                <Calendar className="w-5 h-5" />
                Book Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

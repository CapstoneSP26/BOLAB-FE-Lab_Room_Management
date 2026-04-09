import React, { useState, useEffect } from 'react';
import { Search, Repeat, Info } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { AvailableSlotList } from './AvailableSlotList';
import type { TimeSlot } from '../../slot/types/slot.types';
import type { LabRoomDto } from '../../labroom/types/room.type';

interface ListBookingProps {
  selectedRoom: LabRoomDto | null;
  availableSlots: TimeSlot[];
  onSubmitBooking: (data: {
    slotIds: string[];
    repeatWeekly: boolean;
    weeklyUntil?: string;
  }) => void;
  loading?: boolean;
  slotsLoading?: boolean;
}

/**
 * 📋 Component 2: List-based Booking Layout
 * Slot list view for quick time range selection
 */
export const ListBooking: React.FC<ListBookingProps> = ({
  selectedRoom,
  availableSlots,
  onSubmitBooking,
  loading = false,
  slotsLoading = false,
}) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('18:00');
  const [selectedSlotIds, setSelectedSlotIds] = useState<string[]>([]);
  const [repeatWeekly, setRepeatWeekly] = useState(false);
  const [repeatUntil, setRepeatUntil] = useState('');
  const [showBookingOptions, setShowBookingOptions] = useState(false);

  // Set default dates (today and 7 days from now)
  useEffect(() => {
    const today = new Date();
    const weekLater = new Date(today);
    weekLater.setDate(weekLater.getDate() + 7);

    setStartDate(today.toISOString().split('T')[0]);
    setEndDate(weekLater.toISOString().split('T')[0]);
  }, []);

  // Filter slots based on time range
  const filteredSlots = availableSlots.filter(slot => {
    if (!startTime || !endTime) return true;
    return slot.startTime >= startTime && slot.endTime <= endTime;
  });

  const handleSelectSlot = (slotId: string) => {
    setSelectedSlotIds(prev => {
      if (prev.includes(slotId)) {
        return prev.filter(id => id !== slotId);
      }
      return [...prev, slotId];
    });
  };

  // Show booking options after slot selection
  useEffect(() => {
    setShowBookingOptions(selectedSlotIds.length > 0);
  }, [selectedSlotIds]);

  const canSubmit = selectedSlotIds.length > 0 && selectedRoom;

  const handleSubmit = () => {
    if (!canSubmit) return;

    onSubmitBooking({
      slotIds: selectedSlotIds,
      repeatWeekly,
      weeklyUntil: repeatWeekly ? repeatUntil : undefined,
    });

    // Reset form
    setSelectedSlotIds([]);
    setRepeatWeekly(false);
    setRepeatUntil('');
  };

  return (
    <div className="space-y-6">
      {/* Time Range Filter */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Search className="w-5 h-5 text-brand-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filter Time Range</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />

          <Input
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate}
          />

          <Input
            label="Start Time"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />

          <Input
            label="End Time"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            min={startTime}
          />
        </div>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Tip:</strong> Select multiple free slots for batch booking. All selected slots will be submitted in one request.
          </p>
        </div>
      </div>

      {/* Available Slots List */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        {!selectedRoom ? (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Lab Room</h3>
            <p className="text-sm text-gray-600">
              Choose a lab room from the dropdown above to view available time slots.
            </p>
          </div>
        ) : (
          <AvailableSlotList
            slots={filteredSlots}
            selectedSlotIds={selectedSlotIds}
            onSelectSlot={handleSelectSlot}
            multiSelect={true}
            loading={slotsLoading}
          />
        )}
      </div>

      {/* Booking Options - Shows after slot selection */}
      {showBookingOptions && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6 animate-slide-down">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-3">
            Booking Options
          </h3>

          {/* Repeat Weekly Option */}
          <div>
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={repeatWeekly}
                onChange={(e) => setRepeatWeekly(e.target.checked)}
                className="mt-1 w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Repeat className="w-5 h-5 text-brand-600" />
                  <span className="font-medium text-gray-900">Repeat Weekly</span>
                  <span className="text-xs text-gray-500">(Optional)</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Book these slots every week until a specified date. Great for recurring classes.
                </p>
              </div>
            </label>

            {repeatWeekly && (
              <div className="mt-4 pl-7">
                <Input
                  label="Repeat Until"
                  type="date"
                  value={repeatUntil}
                  onChange={(e) => setRepeatUntil(e.target.value)}
                  min={endDate}
                  className="max-w-xs"
                  placeholder="Select end date for recurring bookings"
                />
              </div>
            )}
          </div>



          {/* Selected Slots Summary */}
          <div className="p-4 bg-brand-50 border-2 border-brand-200 rounded-lg">
            <h4 className="font-semibold text-brand-900 mb-2">Booking Summary</h4>
            <ul className="text-sm text-brand-800 space-y-1">
              <li>• <strong>{selectedSlotIds.length}</strong> time slot{selectedSlotIds.length > 1 ? 's' : ''} selected</li>
              <li>• Room: <strong>{selectedRoom?.roomName}</strong></li>
              {repeatWeekly && <li>• Repeating weekly {repeatUntil ? `until ${repeatUntil}` : ''}</li>}
            </ul>
          </div>

          {/* Info Notice */}
          <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <Info className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Pending Approval</p>
              <p>All booking requests require approval from the lab manager. You'll be notified via email once your request is reviewed.</p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t">
            <Button
              variant="primary"
              fullWidth
              size="lg"
              onClick={handleSubmit}
              disabled={!canSubmit}
              isLoading={loading}
            >
              {loading ? 'Submitting Request...' : `Submit Booking Request (${selectedSlotIds.length} slot${selectedSlotIds.length > 1 ? 's' : ''})`}
            </Button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

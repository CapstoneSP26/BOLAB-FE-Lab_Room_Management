import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Clock, Repeat, Users, Info } from 'lucide-react';
import { Button } from '../../../components/Button';
import { Input } from '../../../components/Input';
import type { LabRoom, StudentGroup, TimeSlot } from '../types';
import { formatDate } from '../../../utils/formatDate';

interface CalendarBookingProps {
  selectedRoom: LabRoom | null;
  studentGroups: StudentGroup[];
  availableSlots: TimeSlot[];
  onSubmitBooking: (data: {
    date: string;
    startTime: string;
    endTime: string;
    repeatWeekly: boolean;
    weeklyUntil?: string;
    groupId?: string;
  }) => void;
  loading?: boolean;
}

/**
 * 🧑‍🏫 Component 1: Calendar-based Booking Layout
 * Calendar view for selecting date and time slots
 */
export const CalendarBooking: React.FC<CalendarBookingProps> = ({
  selectedRoom,
  studentGroups,
  availableSlots,
  onSubmitBooking,
  loading = false,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTimeRange, setSelectedTimeRange] = useState<{ start: string; end: string } | null>(null);
  const [repeatWeekly, setRepeatWeekly] = useState(false);
  const [repeatUntil, setRepeatUntil] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    const days = [];
    const current = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  }, [currentDate]);

  // Time slots for calendar (8:00 AM to 6:00 PM)
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 8; hour < 18; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return slots;
  }, []);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateClick = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    setSelectedDate(dateStr);
    setSelectedTimeRange(null);
  };

  const handleTimeSlotClick = (time: string) => {
    if (!selectedDate) return;

    if (!selectedTimeRange) {
      // First click - set start time
      setSelectedTimeRange({ start: time, end: '' });
    } else if (!selectedTimeRange.end) {
      // Second click - set end time
      if (time > selectedTimeRange.start) {
        setSelectedTimeRange({ ...selectedTimeRange, end: time });
      } else {
        setSelectedTimeRange({ start: time, end: '' });
      }
    } else {
      // Third click - reset
      setSelectedTimeRange({ start: time, end: '' });
    }
  };

  const getSlotStatus = (date: Date, time: string): 'available' | 'booked' | 'pending' => {
    const dateStr = date.toISOString().split('T')[0];
    const slot = availableSlots.find(
      s => s.date === dateStr && s.startTime <= time && s.endTime > time
    );
    
    if (!slot) return 'available';
    return slot.status === 'Available' ? 'available' : 
           slot.status === 'Pending' ? 'pending' : 'booked';
  };

  const isDateToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isDateInCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const canSubmit = selectedDate && selectedTimeRange?.start && selectedTimeRange?.end && selectedRoom;

  const handleSubmit = () => {
    if (!canSubmit || !selectedTimeRange) return;

    onSubmitBooking({
      date: selectedDate,
      startTime: selectedTimeRange.start,
      endTime: selectedTimeRange.end,
      repeatWeekly,
      weeklyUntil: repeatWeekly ? repeatUntil : undefined,
      groupId: selectedGroupId || undefined,
    });
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          <div className="flex gap-2">
            <button
              onClick={handlePrevMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs font-semibold text-gray-600 py-2">
              {day}
            </div>
          ))}
          {calendarDays.map((date, idx) => {
            const dateStr = date.toISOString().split('T')[0];
            const isSelected = selectedDate === dateStr;
            const isToday = isDateToday(date);
            const inMonth = isDateInCurrentMonth(date);

            return (
              <button
                key={idx}
                onClick={() => handleDateClick(date)}
                className={`
                  aspect-square p-2 text-sm rounded-lg transition-all
                  ${!inMonth ? 'text-gray-400' : 'text-gray-900'}
                  ${isToday ? 'font-bold ring-2 ring-brand-500' : ''}
                  ${isSelected ? 'bg-brand-500 text-white' : 'hover:bg-gray-100'}
                `}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
      </div>

      {/* Time Selection - Shows when date is selected */}
      {selectedDate && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-4">
            Select Time Range - {formatDate(selectedDate, 'MMM DD, YYYY')}
          </h4>
          
          <div className="grid grid-cols-6 gap-2 max-h-96 overflow-y-auto">
            {timeSlots.map(time => {
              const status = getSlotStatus(new Date(selectedDate), time);
              const isInRange = selectedTimeRange?.start && selectedTimeRange?.end &&
                time >= selectedTimeRange.start && time < selectedTimeRange.end;
              const isStart = time === selectedTimeRange?.start;
              const isEnd = time === selectedTimeRange?.end;

              return (
                <button
                  key={time}
                  onClick={() => handleTimeSlotClick(time)}
                  disabled={status !== 'available'}
                  className={`
                    px-3 py-2 text-xs rounded-lg font-medium transition-all
                    ${status === 'booked' ? 'bg-red-100 text-red-700 cursor-not-allowed' : ''}
                    ${status === 'pending' ? 'bg-yellow-100 text-yellow-700 cursor-not-allowed' : ''}
                    ${status === 'available' && !isInRange ? 'bg-gray-100 hover:bg-brand-100 text-gray-700' : ''}
                    ${isInRange ? 'bg-brand-500 text-white' : ''}
                    ${isStart || isEnd ? 'ring-2 ring-brand-700' : ''}
                  `}
                >
                  {time}
                </button>
              );
            })}
          </div>

          {selectedTimeRange?.start && selectedTimeRange?.end && (
            <div className="mt-4 p-3 bg-brand-50 border border-brand-200 rounded-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-brand-600" />
              <span className="text-sm font-medium text-brand-900">
                Selected: {selectedTimeRange.start} - {selectedTimeRange.end}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Booking Options */}
      {selectedTimeRange?.start && selectedTimeRange?.end && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
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
                  Automatically book the same time slot every week until a specified date.
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
                  min={selectedDate}
                  className="max-w-xs"
                />
              </div>
            )}
          </div>

          {/* Student Group Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-brand-600" />
                <span>Student Group</span>
                <span className="text-xs text-gray-500 font-normal">(Optional)</span>
              </div>
            </label>
            <select
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
            >
              <option value="">No group selected</option>
              {studentGroups.map(group => (
                <option key={group.id} value={group.id}>
                  {group.name} - {group.courseCode} ({group.studentCount} students)
                </option>
              ))}
            </select>
          </div>

          {/* Info Notice */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Booking Request</p>
              <p>Your booking will be sent for approval. You'll receive a notification once it's reviewed by the lab manager.</p>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            variant="primary"
            fullWidth
            size="lg"
            onClick={handleSubmit}
            disabled={!canSubmit}
            isLoading={loading}
          >
            {loading ? 'Submitting...' : 'Submit Booking Request'}
          </Button>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { X, Calendar, Users, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../../../components/Button';
import type { StudentGroup } from '../types';
import { formatDate } from '../../../utils/formatDate';

interface BookingConfirmPanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  startTime: string;
  endTime: string;
  roomName: string;
  studentGroups: StudentGroup[];
  onConfirm: (data: {
    groupId?: string;
    repeatWeekly: boolean;
    repeatWeeksCount?: number;
  }) => void;
  loading?: boolean;
}

/**
 * 📋 Modern Booking Confirmation Panel
 * Clean, friendly design inspired by modern booking systems
 */
export const BookingConfirmPanel: React.FC<BookingConfirmPanelProps> = ({
  isOpen,
  onClose,
  selectedDate,
  startTime,
  endTime,
  roomName,
  studentGroups,
  onConfirm,
  loading = false,
}) => {
  const [repeatWeekly, setRepeatWeekly] = useState(false);
  const [repeatWeeksCount, setRepeatWeeksCount] = useState(4);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm({
      groupId: selectedGroupId || undefined,
      repeatWeekly,
      repeatWeeksCount: repeatWeekly ? repeatWeeksCount : undefined,
    });

    // Reset form
    setRepeatWeekly(false);
    setRepeatWeeksCount(4);
    setSelectedGroupId('');
  };

  // Calculate repeated dates for preview
  const getRepeatedDates = (): string[] => {
    if (!repeatWeekly) return [];
    
    const dates: string[] = [];
    const baseDate = new Date(selectedDate);
    
    for (let i = 1; i <= repeatWeeksCount; i++) {
      const nextDate = new Date(baseDate);
      nextDate.setDate(baseDate.getDate() + i * 7);
      dates.push(nextDate.toISOString().split('T')[0]);
    }
    
    return dates;
  };

  const repeatedDates = getRepeatedDates();

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-white bg-opacity-20 z-40 transition-opacity backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal Panel - Centered */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="px-8 py-6 border-b border-gray-100">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Booking Details</h2>
                <p className="text-sm text-gray-500 mt-1">Review and confirm your booking</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
            {/* Booking Info Card */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-orange-600" />
                <h3 className="font-semibold text-gray-900">Selected Time Slot</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Date</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatDate(new Date(selectedDate), 'MMM DD, YYYY')}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Time</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {startTime} - {endTime}
                  </p>
                </div>
              </div>
              
              <div className="mt-4 bg-white rounded-lg p-4">
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Room</p>
                <p className="text-lg font-semibold text-orange-600">{roomName}</p>
              </div>
            </div>

            {/* Student Group Selection */}
            <div>
              <label className="flex items-center gap-2 mb-3">
                <Users className="w-5 h-5 text-gray-600" />
                <span className="font-semibold text-gray-900">Select Student Group</span>
                <span className="text-sm text-gray-500">(Optional)</span>
              </label>
              
              <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                {studentGroups.map(group => (
                  <label
                    key={group.id}
                    className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedGroupId === group.id
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-orange-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="studentGroup"
                        value={group.id}
                        checked={selectedGroupId === group.id}
                        onChange={(e) => setSelectedGroupId(e.target.value)}
                        className="w-5 h-5 text-orange-600 focus:ring-orange-500"
                      />
                      <div>
                        <p className="font-semibold text-gray-900">{group.name}</p>
                        <p className="text-sm text-gray-500">
                          {group.courseCode} • {group.studentCount} students
                        </p>
                      </div>
                    </div>
                    {selectedGroupId === group.id && (
                      <CheckCircle2 className="w-5 h-5 text-orange-600" />
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Repeat Weekly Option */}
            <div className="border-t border-gray-200 pt-6">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={repeatWeekly}
                    onChange={(e) => setRepeatWeekly(e.target.checked)}
                    className="w-5 h-5 text-orange-600 focus:ring-orange-500 rounded"
                  />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                    Repeat Weekly
                  </p>
                  <p className="text-sm text-gray-500">
                    Book the same time slot for multiple weeks
                  </p>
                </div>
              </label>

              {repeatWeekly && (
                <div className="mt-4 ml-8 space-y-4 animate-fade-in">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of weeks: <span className="text-orange-600 font-bold">{repeatWeeksCount}</span>
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="16"
                      value={repeatWeeksCount}
                      onChange={(e) => setRepeatWeeksCount(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>1 week</span>
                      <span>16 weeks</span>
                    </div>
                  </div>

                  {/* Preview of repeated dates */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-blue-900 mb-2">
                          {repeatWeeksCount + 1} bookings will be created
                        </p>
                        <div className="space-y-1 text-sm text-blue-800 max-h-32 overflow-y-auto">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                            {formatDate(new Date(selectedDate), 'MMM DD, YYYY')} (Today)
                          </div>
                          {repeatedDates.map((date, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                              {formatDate(new Date(date), 'MMM DD, YYYY')}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
            <div className="flex gap-3">
              <Button
                onClick={onClose}
                variant="outline"
                fullWidth
                className="py-3"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                variant="primary"
                fullWidth
                isLoading={loading}
                className="py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
              >
                {loading ? 'Saving...' : 'Confirm Booking'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import type { Booking } from '../types';

interface BookingCalendarProps {
  bookings: Booking[];
}

export const BookingCalendar: React.FC<BookingCalendarProps> = ({ bookings }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Get calendar days for current month
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days: (Date | null)[] = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  }, [currentDate]);

  // Group bookings by date
  const bookingsByDate = useMemo(() => {
    const grouped = new Map<string, Booking[]>();
    
    bookings.forEach(booking => {
      const dateKey = new Date(booking.date).toDateString();
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(booking);
    });
    
    return grouped;
  }, [bookings]);

  // Get bookings for selected date
  const selectedDateBookings = useMemo(() => {
    if (!selectedDate) return [];
    return bookingsByDate.get(selectedDate.toDateString()) || [];
  }, [selectedDate, bookingsByDate]);

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date | null) => {
    if (!date || !selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const getBookingsForDate = (date: Date | null) => {
    if (!date) return [];
    return bookingsByDate.get(date.toDateString()) || [];
  };

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'cancelled':
        return 'bg-red-500';
      case 'completed':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="relative">
      {/* Calendar Grid */}
      <div className="bg-white/15 backdrop-blur-xl rounded-xl p-6 border border-white/30 shadow-2xl">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white drop-shadow-md">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={goToToday}
              className="px-3 py-1 text-sm rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-all shadow-lg hover:shadow-orange-500/50"
            >
              Today
            </button>
            <button
              onClick={goToPreviousMonth}
              className="p-2 rounded-lg bg-white/15 hover:bg-white/25 border border-white/20 transition-all"
            >
              <ChevronLeft className="h-5 w-5 text-white" />
            </button>
            <button
              onClick={goToNextMonth}
              className="p-2 rounded-lg bg-white/15 hover:bg-white/25 border border-white/20 transition-all"
            >
              <ChevronRight className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>

        {/* Day Names */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {dayNames.map(day => (
            <div key={day} className="text-center text-sm font-bold text-white/90 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((date, index) => {
            const dayBookings = getBookingsForDate(date);
            const hasBookings = dayBookings.length > 0;
            
            return (
              <div
                key={index}
                onClick={() => date && hasBookings && setSelectedDate(date)}
                className={`
                  min-h-[80px] p-2 rounded-lg border transition-all
                  ${!date ? 'bg-transparent border-transparent' : ''}
                  ${date && !hasBookings ? 'bg-white/8 border-white/15 hover:bg-white/12' : ''}
                  ${hasBookings ? 'bg-white/15 border-orange-500/40 hover:bg-white/20 cursor-pointer shadow-md hover:shadow-lg' : ''}
                  ${isToday(date) ? 'ring-2 ring-orange-400 shadow-lg shadow-orange-500/30' : ''}
                  ${isSelected(date) ? 'bg-orange-500/25 border-orange-400' : ''}
                `}
              >
                {date && (
                  <>
                    <div className={`text-sm font-bold mb-1 ${isToday(date) ? 'text-orange-400 drop-shadow-md' : 'text-white drop-shadow-sm'}`}>
                      {date.getDate()}
                    </div>
                    <div className="space-y-1">
                      {dayBookings.slice(0, 2).map((booking, idx) => (
                        <div
                          key={idx}
                          className="text-xs px-1.5 py-0.5 rounded bg-gradient-to-r from-orange-500 to-orange-600 text-white truncate font-medium shadow-sm"
                          title={`${booking.roomName} - ${booking.startTime}`}
                        >
                          {booking.startTime} {booking.roomName}
                        </div>
                      ))}
                      {dayBookings.length > 2 && (
                        <div className="text-xs text-white/60 px-1">
                          +{dayBookings.length - 2} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Popup Modal for Selected Date */}
      {selectedDate && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in"
            onClick={() => setSelectedDate(null)}
          />
          
          {/* Modal */}
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl max-h-[80vh] animate-slide-in-bottom">
            <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl border-2 border-orange-500/50 shadow-2xl shadow-orange-500/20 overflow-hidden">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <CalendarIcon className="h-6 w-6 mr-3" />
                  {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long',
                    month: 'long', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </h3>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="text-white/90 hover:text-white transition-colors p-1 hover:bg-white/20 rounded-lg"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                {selectedDateBookings.length > 0 ? (
                  <div className="space-y-3">
                    <div className="text-white/70 text-sm mb-4">
                      {selectedDateBookings.length} booking{selectedDateBookings.length > 1 ? 's' : ''} scheduled
                    </div>
                    {selectedDateBookings.map((booking, index) => (
                      <div
                        key={booking.id}
                        className="bg-white/15 backdrop-blur-md rounded-xl p-4 border border-white/30 hover:bg-white/20 hover:border-orange-500/60 hover:shadow-lg transition-all group"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="text-white font-semibold text-base group-hover:text-orange-300 transition-colors">
                              {booking.roomName}
                            </h4>
                            <p className="text-white/70 text-sm mt-1">{booking.buildingName}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-white/80 text-sm mb-2">
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-medium">{booking.startTime} - {booking.endTime}</span>
                          </div>
                          <div className="text-white/50">•</div>
                          <div className="text-white/60">#{booking.id}</div>
                        </div>
                        
                        {booking.purpose && (
                          <div className="mt-3 pt-3 border-t border-white/10">
                            <p className="text-white/70 text-sm leading-relaxed">{booking.purpose}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-white/60">
                    <CalendarIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No bookings on this date</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

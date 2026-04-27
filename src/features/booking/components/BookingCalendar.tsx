import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import type { Booking } from '../types/booking.type';

interface BookingCalendarProps {
  bookings: Booking[];
  currentUserId?: string;
  currentUserEmail?: string;
  currentUserName?: string;
  currentUserCode?: string;
}

export const BookingCalendar: React.FC<BookingCalendarProps> = ({
  bookings,
  currentUserId,
  currentUserEmail,
  currentUserName,
  currentUserCode,
}) => {
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

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getBookingSource = (booking: Booking): 'AO_BOOK' | 'LECTURER_BOOK' => {
    if (booking.bookingSource) {
      return booking.bookingSource;
    }

    const sourceHint = booking.scheduleType?.toLowerCase() || '';
    if (sourceHint.includes('ao')) {
      return 'AO_BOOK';
    }

    return 'LECTURER_BOOK';
  };

  const getBookingSourceConfig = (booking: Booking) => {
    const source = getBookingSource(booking);

    if (source === 'AO_BOOK') {
      return {
        badgeClass: 'bg-sky-100 text-sky-700',
        label: 'AO Book',
      };
    }

    return {
      badgeClass: 'bg-violet-100 text-violet-700',
      label: 'Lecturer Book',
    };
  };

  const normalizeText = (value: unknown) => String(value ?? '').trim().toLowerCase();

  const isCurrentLecturerBooking = (booking: Booking): boolean => {
    const candidates = [
      booking.userName,
      booking.lecturerName,
      booking.purpose,
      booking.scheduleType,
    ];

    const bookingUserId = normalizeText((booking as Booking & { userId?: string | number }).userId);
    const bookingUserCode = normalizeText((booking as Booking & { userCode?: string }).userCode);
    const bookingUserEmail = normalizeText((booking as Booking & { userEmail?: string }).userEmail);
    const bookingCreatedBy = normalizeText((booking as Booking & { createdBy?: string | number }).createdBy);
    const bookingCreatedByName = normalizeText((booking as Booking & { createdByName?: string }).createdByName);

    if (currentUserId && bookingUserId && normalizeText(currentUserId) === bookingUserId) return true;
    if (currentUserCode && bookingUserCode && normalizeText(currentUserCode) === bookingUserCode) return true;
    if (currentUserEmail && bookingUserEmail && normalizeText(currentUserEmail) === bookingUserEmail) return true;
    if (currentUserId && bookingCreatedBy && normalizeText(currentUserId) === bookingCreatedBy) return true;

    const currentName = normalizeText(currentUserName);
    if (currentName) {
      if (normalizeText(booking.userName) === currentName) return true;
      if (normalizeText(booking.lecturerName) === currentName) return true;
      if (normalizeText(bookingCreatedByName) === currentName) return true;
      if (candidates.some((candidate) => normalizeText(candidate) === currentName)) return true;
    }

    return false;
  };

  const getStatusConfig = (status: Booking['status']) => {
    if (status === 'Approved') {
      return {
        text: 'Approved',
        className: 'bg-emerald-100 text-emerald-700',
      };
    }

    if (status === 'PendingApproval') {
      return {
        text: 'Pending',
        className: 'bg-amber-100 text-amber-700',
      };
    }

    if (status === 'Rejected') {
      return {
        text: 'Rejected',
        className: 'bg-rose-100 text-rose-700',
      };
    }

    return {
      text: status,
      className: 'bg-slate-100 text-slate-700',
    };
  };

  const getBookerName = (booking: Booking): string => {
    return booking.userName || booking.lecturerName || 'N/A';
  };

  const isBookingActive = (booking: Booking): boolean => {
    if (booking.status !== 'Approved') {
      return false;
    }

    const [startHour, startMinute] = booking.startTime.split(':').map(Number);
    const [endHour, endMinute] = booking.endTime.split(':').map(Number);

    const bookingDate = new Date(booking.date);
    const startDate = new Date(bookingDate);
    const endDate = new Date(bookingDate);
    startDate.setHours(startHour, startMinute, 0, 0);
    endDate.setHours(endHour, endMinute, 0, 0);

    // Handle overnight schedules (e.g. 23:00 - 01:00).
    if (endDate <= startDate) {
      endDate.setDate(endDate.getDate() + 1);
    }

    const now = new Date();
    return now >= startDate && now <= endDate;
  };

  return (
    <div className="relative">
      {/* Calendar Grid */}
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-200 shadow-sm">
        <div className="mb-5 h-1.5 w-20 rounded-full bg-blue-500" />
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">
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
              className="p-2 rounded-lg bg-slate-50 hover:bg-white border border-slate-300 transition-all"
            >
              <ChevronLeft className="h-5 w-5 text-slate-700" />
            </button>
            <button
              onClick={goToNextMonth}
              className="p-2 rounded-lg bg-slate-50 hover:bg-white border border-slate-300 transition-all"
            >
              <ChevronRight className="h-5 w-5 text-slate-700" />
            </button>
          </div>
        </div>

        {/* Day Names */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {dayNames.map(day => (
            <div key={day} className="text-center text-sm font-bold text-slate-600 py-2">
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
                  ${date && !hasBookings ? 'bg-slate-50 border-slate-200 hover:bg-slate-100' : ''}
                  ${hasBookings ? 'bg-orange-50 border-orange-200 hover:bg-orange-100 cursor-pointer shadow-sm hover:shadow-orange-200/70' : ''}
                  ${isToday(date) ? 'ring-2 ring-orange-400' : ''}
                  ${isSelected(date) ? 'bg-orange-100 border-orange-300' : ''}
                `}
              >
                {date && (
                  <>
                    <div className={`text-sm font-bold mb-1 ${isToday(date) ? 'text-orange-600' : 'text-slate-700'}`}>
                      {date.getDate()}
                    </div>
                    <div className="space-y-1">
                      {dayBookings.slice(0, 2).map((booking, idx) => (
                        (() => {
                          const sourceConfig = getBookingSourceConfig(booking);
                          const active = isBookingActive(booking);
                          const isMine = isCurrentLecturerBooking(booking);
                          const mineClass = isMine
                            ? 'ring-2 ring-emerald-400 bg-emerald-100 text-emerald-900'
                            : '';
                          return (
                            <div
                              key={idx}
                              className={`text-xs px-1.5 py-0.5 rounded truncate font-medium ${sourceConfig.badgeClass} ${mineClass}`}
                              title={`${booking.startTime} ${booking.roomName}`}
                            >
                              {active ? '● ' : ''}
                              {booking.startTime} {booking.roomName}
                            </div>
                          );
                        })()
                      ))}
                      {dayBookings.length > 2 && (
                        <div className="text-xs text-slate-500 px-1">
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
            className="fixed inset-0 bg-black/30 z-50 animate-fade-in"
            onClick={() => setSelectedDate(null)}
          />

          {/* Modal */}
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl max-h-[80vh] animate-slide-in-bottom">
            <div className="bg-slate-50 rounded-2xl border border-slate-300 shadow-xl overflow-hidden">
              {/* Modal Header */}
              <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900 flex items-center">
                  <CalendarIcon className="h-6 w-6 mr-3 text-amber-500" />
                  {selectedDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </h3>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="text-slate-500 hover:text-slate-700 transition-colors p-1 hover:bg-slate-100 rounded-lg"
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
                    <div className="text-slate-500 text-sm mb-4">
                      {selectedDateBookings.length} booking{selectedDateBookings.length > 1 ? 's' : ''} scheduled
                    </div>
                    {selectedDateBookings.map((booking) => (
                      (() => {
                        const sourceConfig = getBookingSourceConfig(booking);
                        const statusConfig = getStatusConfig(booking.status);
                        const active = isBookingActive(booking);
                        const isMine = isCurrentLecturerBooking(booking);
                        const cardClass = isMine
                          ? 'bg-emerald-50 border-emerald-300 hover:bg-emerald-100'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100';

                        return (
                          <div
                            key={booking.id}
                            className={`${cardClass} rounded-xl p-4 border transition-all group`}
                          >
                            <div className="flex items-start justify-between mb-3 gap-3">
                              <div className="flex-1">
                                <h4 className="text-slate-900 font-semibold text-base group-hover:text-orange-600 transition-colors">
                                  {booking.roomName}
                                </h4>
                                <p className="text-slate-600 text-sm mt-1">{booking.buildingName}</p>
                              </div>
                              <div className="flex items-center gap-2 flex-wrap justify-end">
                                {active && (
                                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500 text-white">
                                    Active
                                  </span>
                                )}
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${sourceConfig.badgeClass}`}>
                                  {sourceConfig.label}
                                </span>
                                {isMine && (
                                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500 text-white">
                                    My booking
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-4 text-slate-600 text-sm mb-3">
                              <div className="flex items-center">
                                <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="font-medium">{booking.startTime} - {booking.endTime}</span>
                              </div>
                              <div className="text-slate-300">•</div>
                              <div className="text-slate-500">#{booking.id}</div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                              <div className="bg-slate-100 rounded-lg px-2.5 py-2 text-slate-900 border border-slate-300">
                                <p className="text-slate-500 mb-0.5">User</p>
                                <p className="font-semibold">{getBookerName(booking)}</p>
                              </div>
                              <div className="bg-slate-100 rounded-lg px-2.5 py-2 text-slate-900 border border-slate-300">
                                <p className="text-slate-500 mb-0.5">Schedule Type</p>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${sourceConfig.badgeClass}`}>
                                  {sourceConfig.label}
                                </span>
                              </div>
                              <div className="bg-slate-100 rounded-lg px-2.5 py-2 text-slate-900 border border-slate-300">
                                <p className="text-slate-500 mb-0.5">Status</p>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${statusConfig.className}`}>
                                  {statusConfig.text}
                                </span>
                              </div>
                              <div className="bg-slate-100 rounded-lg px-2.5 py-2 text-slate-900 border border-slate-300">
                                <p className="text-slate-500 mb-0.5">Student Count</p>
                                <p className="font-semibold">{booking.studentCount ?? 0}</p>
                              </div>
                            </div>

                            {booking.purpose && (
                              <div className="mt-3 pt-3 border-t border-slate-200">
                                <p className="text-slate-600 text-sm leading-relaxed">{booking.purpose}</p>
                              </div>
                            )}
                          </div>
                        );
                      })()
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-500">
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

import React, { useRef, useMemo, useState } from 'react';
import { useCalendarEvents } from '../../features/calendar/hooks/useCalendarEvents';
import { getWeekDaysByOffset } from '../../utils/date.util';
import { CalendarNavigation } from '../../features/calendar/components/CalendarNavigation';
import { CalendarDayHeader } from '../../features/calendar/components/CalendarDayHeader';
import { CALENDAR_CONFIG } from '../../features/calendar/constants/calendar.constants';
import { FlexibleGridView } from '../../features/calendar/components/FlexibleGridView';
import { getStartOfDayVNInUTC } from '../../utils/date.util';
import { addDays } from 'date-fns';
import { useParams } from 'react-router-dom';
import { useLabRoomDetail } from '../../features/labroom/hooks/useLabRooms';
import { CalenderIcon } from '../../components/icon';


/**
 * 🗓️ Weekly Calendar Grid Component (Google Calendar Style)
 * Click-and-drag to create bookings, resize blocks, visual conflict detection
 */
const CalendarTabletPage: React.FC = () => {
  const { labRoomId } = useParams();
  const [weekOffset, setWeekOffset] = useState(0);
  const { START_HOUR, END_HOUR } = CALENDAR_CONFIG;


  // Only fetch room details if user is authenticated
const { data } = useLabRoomDetail(Number(labRoomId));
  const { weekDays, weekStart, weekEnd } = useMemo(() => {
    const days = getWeekDaysByOffset(weekOffset);
    return {
      weekDays: days,
      weekStart: days[0],
      weekEnd: days[6],
    };
  }, [weekOffset]);

  const { events } = useCalendarEvents({
    calendarMode: "PUBLIC",
    labRoomId: Number(labRoomId),
    startDate: getStartOfDayVNInUTC(weekStart),
    endDate: getStartOfDayVNInUTC(addDays(weekEnd, 1))
  });

  const gridRef = useRef<HTMLDivElement>(null);

  // Generate time slots (7:00 AM - 10:00 PM, hourly display only)
  const timeSlots: string[] = [];
  for (let hour = START_HOUR; hour <= END_HOUR; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
  }
  return (
    /** * THAY ĐỔI: Thêm h-[calc(100vh-2rem)] hoặc h-full 
     * Đảm bảo phần tử bao ngoài (Layout) có chiều cao cố định.
     */
    <div className="flex flex-col items-center justify-start w-full h-screen px-8 py-6 md:px-10 md:py-12 pt-0">
      {/* Room Name - Outside calendar card */}
      <div className="absolute top-2 left-0 right-0 px-4 md:px-6 pointer-events-none">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg">
            <CalenderIcon className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-700 drop-shadow-lg">
            {data?.roomName || 'Lab Room'}
          </h1>
        </div>
        <div className="h-0.5 bg-gradient-to-r from-transparent via-blue-600 to-transparent"></div>
      </div>

      <div className="flex flex-col w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden" style={{ width: '950px', height: '600px', marginTop: '20px', marginBottom: 'auto' }}>

      {/* 1. Navigation Header */}
      <div className="flex-none items-center justify-between px-3 py-2 border-b border-gray-200 bg-white z-30">
        <CalendarNavigation
          weekStart={weekStart}
          weekEnd={weekEnd}
          weekOffset={weekOffset}
          onWeekChange={setWeekOffset}
          labRoomName={undefined}
        />
      </div>

      {/* 2. Container chính cho phần nội dung dưới Nav */}
      <div className='flex-1 flex min-h-0 overflow-hidden'>

        {/* Phần scroll ngang - Ngày (chỉ 1 scroll container) */}
        <div className='flex-1 overflow-y-auto overflow-x-auto bg-gray-50/30 custom-scrollbar' style={{ zoom: '0.85' }}>
          {/* 3. Day Header - Sticky trong scroll container */}
          <div className="sticky top-0 flex-none border-b border-gray-200 bg-white z-20">
            <div>
              <CalendarDayHeader weekDays={weekDays} />
            </div>
          </div>

          {/* 4. Grid */}
          <div
            ref={gridRef}
            className="relative select-none"
          >
            <FlexibleGridView
              timeSlots={timeSlots}
              weekDays={weekDays}
              events={events}
              minBookingLeadTime={0}
            />
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};
export default CalendarTabletPage;
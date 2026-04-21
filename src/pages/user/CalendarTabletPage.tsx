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
    <div className="flex flex-col h-full max-h-[100vh] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

      {/* 1. Navigation Header - Đứng yên */}
      <div className="flex-none items-center justify-between px-6 py-4 border-b-2 border-gray-200 bg-white z-30">
        <CalendarNavigation
          weekStart={weekStart}
          weekEnd={weekEnd}
          weekOffset={weekOffset}
          onWeekChange={setWeekOffset}
          labRoomName={data?.roomName}
        />
      </div>

      {/* 2. Container chính cho phần nội dung dưới Nav */}
      <div className='flex-1 flex flex-col min-h-0 overflow-hidden'>

        {/* 3. Day Header - Cố định (Không nằm trong vùng cuộn dọc) */}
        <div className="flex-none border-b border-gray-200 bg-white z-20">
          <div className="overflow-hidden"> {/* Để đồng bộ cuộn ngang nếu có */}
            <div style={{ minWidth: '1000px' }}>
              <CalendarDayHeader weekDays={weekDays} />
            </div>
          </div>
        </div>

        {/* 4. Vùng cuộn thực sự - Chỉ chứa Grid */}
        <div className="flex-1 overflow-y-auto overflow-x-auto bg-gray-50/30 custom-scrollbar">
          <div
            ref={gridRef}
            className="border-l relative select-none"
            style={{ minWidth: '1000px' }}
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
  );
};
export default CalendarTabletPage;
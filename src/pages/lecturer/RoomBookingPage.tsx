import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Calendar as CalendarIcon, List, Building2, Loader2, Info } from 'lucide-react';
import { WeeklyCalendarGrid } from '../../features/calendar/components/WeeklyCalendarGrid';
import { BookingConfirmPanel } from '../../features/booking/components/BookingConfirmPanel';
import { AvailableSlotList } from '../../features/booking/components/AvailableSlotList';
import { BookingConfirmationModal } from '../../features/booking/components/BookingConfirmationModal';
import {
  useLabRooms,
  useStudentGroups,
  useAvailableSlots,
  useCreateBooking,
} from '../../features/booking/hooks/useRoomBooking';
import {
  MOCK_BOOKING_BUILDINGS,
  MOCK_BOOKING_ROOMS,
  MOCK_STUDENT_GROUPS,
  getMockSlotsByRoomAndRange,
} from '../../features/booking/mocks/roomBookingMockData';
import { useToast } from '../../hooks/useToast';
import type { BookingSummary } from '../../features/booking/types/booking.type';

type BookingView = 'calendar' | 'list';

interface PendingBooking {
  date: string;
  startTime: string;
  endTime: string;
}

/**
 * 🗓️ Room Booking Page - Google Calendar Style
 * Left sidebar with room selector + view toggle
 * Main area with weekly calendar grid supporting drag-and-drop booking
 */
const RoomBookingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roomIdParam = searchParams.get('roomId');
  const appAlert = useToast();
  const [activeView, setActiveView] = useState<BookingView>('calendar');
  const [selectedBuilding, setSelectedBuilding] = useState<string>('');
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedSlotIds, setSelectedSlotIds] = useState<string[]>([]);
  const [showConfirmPanel, setShowConfirmPanel] = useState(false);
  const [pendingBooking, setPendingBooking] = useState<PendingBooking | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingSummary, setBookingSummary] = useState<BookingSummary | null>(null);

  const dateRange = {
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  };

  // Fetch data
  const { data: roomsData, isLoading: roomsLoading } = useLabRooms();
  const { data: groupsData } = useStudentGroups();
  const { data: slotsData, isLoading: slotsLoading } = useAvailableSlots({
    params: {
      roomId: selectedRoomId,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    },
    enabled: !!selectedRoomId,
  });

  const createBookingMutation = useCreateBooking({
    onSuccess: (response) => {
      setBookingSummary(response.summary);
      setShowConfirmation(true);
    },
    onError: (error) => {
      console.error('Booking failed:', error);
      appAlert.error('Booking failed', 'Failed to submit booking request. Please try again.');
    },
  });

  const rooms = roomsData?.rooms ?? [];
  const groups = groupsData?.groups ?? [];
  const slots = slotsData?.slots ?? [];

  // Use mock data as fallback
  const displayRooms = rooms.length > 0 ? rooms : MOCK_BOOKING_ROOMS;
  const displayGroups = groups.length > 0 ? groups : MOCK_STUDENT_GROUPS;
  const mockSlotsForSelectedRoom = selectedRoomId
    ? getMockSlotsByRoomAndRange(selectedRoomId, dateRange.startDate, dateRange.endDate)
    : [];
  const displaySlots = selectedRoomId
    ? slots.length > 0
      ? slots
      : mockSlotsForSelectedRoom
    : [];

  const selectedRoom = displayRooms.find(r => r.id === selectedRoomId) ?? null;

  useEffect(() => {
    if (!roomIdParam) {
      return;
    }

    const matchedRoom = displayRooms.find((room) => room.id === roomIdParam);
    if (!matchedRoom) {
      return;
    }

    setSelectedRoomId(matchedRoom.id);

    const matchedBuilding = MOCK_BOOKING_BUILDINGS.find((building) => building.name === matchedRoom.building);
    if (matchedBuilding) {
      setSelectedBuilding(matchedBuilding.id);
    }
  }, [roomIdParam, displayRooms]);

  // All buildings are available (campus is pre-determined for lecturer)
  const availableBuildings = MOCK_BOOKING_BUILDINGS;

  // Filter rooms based on selected building (using building name for now)
  const selectedBuildingName = MOCK_BOOKING_BUILDINGS.find(b => b.id === selectedBuilding)?.name;
  const availableRooms = displayRooms.filter(r =>
    selectedBuildingName ? r.building === selectedBuildingName : true
  );

  const handleBuildingChange = (buildingId: string) => {
    setSelectedBuilding(buildingId);
    setSelectedRoomId('');
  };

  // Handle drag-and-drop booking from calendar
  const handleCalendarDragComplete = (data: {
    date: string;
    startTime: string;
    endTime: string;
  }) => {
    setPendingBooking(data);
    setShowConfirmPanel(true);
  };

  // Handle confirm from side panel
  const handleConfirmBooking = (data: {
    groupId?: string;
    repeatWeekly: boolean;
    repeatWeeksCount?: number;
  }) => {
    if (!selectedRoomId || !pendingBooking) return;

    createBookingMutation.mutate({
      bookingData: {
        roomId: selectedRoomId,
        date: pendingBooking.date,
        startTime: pendingBooking.startTime,
        endTime: pendingBooking.endTime,
        repeatWeekly: data.repeatWeekly,
        weeklyUntil: data.repeatWeekly && data.repeatWeeksCount
          ? new Date(new Date(pendingBooking.date).getTime() + data.repeatWeeksCount * 7 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0]
          : undefined,
        groupId: data.groupId,
      },
    });
  };

  // Handle book selected slots from List View
  const handleBookSelectedSlots = () => {
    if (selectedSlotIds.length === 0) return;

    const firstSlot = displaySlots.find(s => s.id === selectedSlotIds[0]);
    if (!firstSlot) return;

    setPendingBooking({
      date: firstSlot.date,
      startTime: firstSlot.startTime,
      endTime: firstSlot.endTime,
    });
    setShowConfirmPanel(true);
  };

  const handleCloseConfirmation = () => {
    setShowConfirmation(false);
    setBookingSummary(null);
    setShowConfirmPanel(false);
    setPendingBooking(null);
  };

  const handleViewMyBookings = () => {
    handleCloseConfirmation();
    navigate('/my-bookings'); // TODO: Create this route
  };

  const handleCreateAnother = () => {
    handleCloseConfirmation();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-gray-50">
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Room Selector & View Toggle */}
        <div className="w-[420px] bg-white flex flex-col border-r-4 border-orange-300 overflow-y-auto shadow-[4px_0_12px_-2px_rgba(251,146,60,0.15)]">
          {/* Header */}
          <div className="px-6 py-5 bg-gradient-to-br from-orange-50 to-white border-b-2 border-orange-200">
            <h1 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
              <CalendarIcon className="w-6 h-6 text-orange-600" />
              Book a Lab
            </h1>
            <p className="text-sm text-gray-600">
              Select room and choose your time slot
            </p>
          </div>

          {/* Room Selection */}
          <div className="px-6 py-4 border-b border-gray-200 space-y-4">
            {/* Building Selection */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide flex items-center gap-2">
                <span className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 text-xs font-bold">1</span>
                Select Building
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-500 pointer-events-none z-10" />
                <select
                  value={selectedBuilding}
                  onChange={(e) => handleBuildingChange(e.target.value)}
                  className="block w-full rounded-lg border-2 border-gray-300 shadow-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-sm py-3 pl-11 pr-4 bg-white hover:border-orange-300 transition-all appearance-none cursor-pointer font-medium"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                >
                  <option value="" className="text-gray-500">Choose a building...</option>
                  {availableBuildings.map(building => (
                    <option key={building.id} value={building.id} className="font-medium">
                      {building.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Lab Room Selection */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide flex items-center gap-2">
                <span className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 text-xs font-bold">2</span>
                Select Lab Room
              </label>

              {roomsLoading ? (
                <div className="flex items-center gap-3 text-gray-600 bg-gray-50 rounded-lg p-4 border-2 border-gray-300">
                  <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
                  <span className="text-sm font-medium">Loading rooms...</span>
                </div>
              ) : (
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-500 pointer-events-none z-10" />
                  <select
                    value={selectedRoomId}
                    onChange={(e) => setSelectedRoomId(e.target.value)}
                    disabled={!selectedBuilding}
                    className="block w-full rounded-lg border-2 border-gray-300 shadow-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-sm py-3 pl-11 pr-4 bg-white hover:border-orange-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:hover:border-gray-300 transition-all appearance-none cursor-pointer font-medium"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                  >
                    <option value="" className="text-gray-500">Choose a lab room...</option>
                    {availableRooms.map(room => (
                      <option key={room.id} value={room.id} className="font-medium">
                        {room.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {selectedRoom && (
              <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="w-5 h-5 text-orange-600" />
                  <h3 className="font-bold text-gray-900 text-sm">{selectedRoom.name}</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Building:</span>
                    <span className="text-gray-900 font-medium">{selectedRoom.building}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Capacity:</span>
                    <span className="text-orange-600 font-semibold">{selectedRoom.capacity} students</span>
                  </div>
                  {selectedRoom.features && selectedRoom.features.length > 0 && (
                    <div className="pt-2 border-t border-orange-200">
                      <span className="text-gray-600 block mb-1.5 text-xs">Features:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedRoom.features.map((feature, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-white text-gray-700 rounded text-xs border border-gray-200">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* View Toggle */}
          <div className="px-6 py-4 border-b border-gray-200">
            <label className="block text-sm font-semibold text-gray-700 mb-2">View Mode</label>
            <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveView('calendar')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-all text-sm font-medium ${activeView === 'calendar'
                  ? 'bg-white text-orange-600 shadow-sm border border-orange-200'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <CalendarIcon className="w-4 h-4" />
                <span>Calendar</span>
              </button>
              <button
                onClick={() => setActiveView('list')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-all text-sm font-medium ${activeView === 'list'
                  ? 'bg-white text-orange-600 shadow-sm border border-orange-200'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <List className="w-4 h-4" />
                <span>List</span>
              </button>
            </div>
          </div>
          {/* TEST BUTTON - Remove in production */}
          <div className="px-6 py-4 border-t border-gray-200">
            <button
              onClick={() => {
                setBookingSummary({
                  id: 'TEST-123',
                  roomName: 'Lab A-101',
                  building: 'Alpha Building',
                  date: new Date().toISOString().split('T')[0],
                  startTime: '09:00',
                  endTime: '11:30',
                  repeatWeekly: false,
                  groupName: 'SE1846',
                  status: 'Pending',
                  createdAt: new Date().toISOString(),
                });
                setShowConfirmation(true);
              }}
              className="w-full px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors"
            >
              🧪 Test Confirmation Modal
            </button>
          </div>
          {/* Instructions - Integrated into sidebar */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-start gap-2 mb-3">
              <Info className="w-4 h-4 text-orange-600 mt-0.5" />
              <p className="font-semibold text-gray-900 text-sm">How to book</p>
            </div>
            <ol className="space-y-2 text-xs text-gray-700 pl-6 list-decimal">
              <li>Select campus, building & room</li>
              <li>Choose Calendar or List view</li>
              <li>Drag on calendar or pick time slot</li>
              <li>Confirm booking details</li>
            </ol>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {!selectedRoomId ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Select a Lab Room</h2>
                <p className="text-gray-600">Choose a lab room from the sidebar to view availability</p>
              </div>
            </div>
          ) : activeView === 'calendar' ? (
            <WeeklyCalendarGrid
              selectedRoomId={selectedRoomId}
              existingBookings={displaySlots}
              onCreateBooking={handleCalendarDragComplete}
              weekOffset={weekOffset}
              onWeekChange={setWeekOffset}
            />
          ) : (
            <div className="flex-1 overflow-auto p-8 bg-gradient-to-b from-white to-gray-50">
              <div className="max-w-6xl mx-auto">
                <AvailableSlotList
                  slots={displaySlots}
                  selectedSlotIds={selectedSlotIds}
                  onSelectSlot={(slotId) => {
                    setSelectedSlotIds(prev =>
                      prev.includes(slotId)
                        ? prev.filter(id => id !== slotId)
                        : [...prev, slotId]
                    );
                  }}
                  onBookSelected={handleBookSelectedSlots}
                  multiSelect={true}
                  loading={slotsLoading}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Booking Confirm Side Panel */}
      {pendingBooking && (
        <BookingConfirmPanel
          isOpen={showConfirmPanel}
          onClose={() => {
            setShowConfirmPanel(false);
            setPendingBooking(null);
          }}
          selectedDate={pendingBooking.date}
          startTime={pendingBooking.startTime}
          endTime={pendingBooking.endTime}
          roomName={selectedRoom?.name || ''}
          studentGroups={displayGroups}
          onConfirm={handleConfirmBooking}
          loading={createBookingMutation.isPending}
        />
      )}

      {/* Confirmation Modal */}
      <BookingConfirmationModal
        isOpen={showConfirmation}
        onClose={handleCloseConfirmation}
        bookingSummary={bookingSummary}
        onViewMyBookings={handleViewMyBookings}
        onCreateAnother={handleCreateAnother}
      />
    </div>
  );
};

export default RoomBookingPage;

import React, { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Calendar as CalendarIcon,
  List,
  Building2,
  Info,
} from "lucide-react";
import { BookingConfirmPanel } from "../../features/booking/components/BookingConfirmPanel";
import { AvailableSlotList } from "../../features/booking/components/AvailableSlotList";
import { BookingSuccessModal } from "../../features/booking/components/BookingSuccessModal";
import { useCreateBooking } from "../../features/booking/hooks/useCreateBooking";
import { useLabRooms } from "../../features/labroom/hooks/useLabRooms";
import { useToast } from "../../hooks/useToast";
import type { CreateBookingCommand, PendingBooking } from "../../features/booking/types/booking.type";
import { RoomSelector } from "../../features/labroom/components/RoomSelector";
import { useBuildings } from "../../features/building";
import { BuildingSelector } from "../../features/building/components/BuildingSelector";
import { FLEXIBLE_ID } from "../../features/slot/constants/slot.constant";
import { WeeklyCalendar } from "../../features/calendar/components/WeeklyCalendar";
import { usePurposeTypes } from "../../features/booking/hooks/usePurposeTypes";
import { useLabPolicies } from "../../features/labroom/hooks/useLabPolicies";
import { QueryClient, useQueryClient } from "@tanstack/react-query";

type BookingView = "calendar" | "list";

/**
 * 🗓️ Room Booking Page - Google Calendar Style
 * Left sidebar with room selector + view toggle
 * Main area with weekly calendar grid supporting drag-and-drop booking
 */
const RoomBookingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roomIdParam = searchParams.get("roomId") ?? "";
  const appAlert = useToast();
  const [activeView, setActiveView] = useState<BookingView>("calendar");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [successData, setSuccessData] = useState<{ date: string; timeSlot: string } | null>(null);
  const [lastBookingId, setLastBookingId] = useState<string>("");

  const [selectedBuildingId, setSelectedBuildingId] = useState<string>();
  const [selectedRoomId, setSelectedRoomId] = useState<string>(roomIdParam);
  const [selectedSlotTypeId, setSelectedSlotTypeId] = useState<number>(FLEXIBLE_ID);
  const [weekOffset, setWeekOffset] = useState(0);

  const [showConfirmPanel, setShowConfirmPanel] = useState(false);
  const [pendingBooking, setPendingBooking] = useState<PendingBooking | null>(null);

  const queryClient = useQueryClient();


  // Fetch Booking Purpose
  const { data: pagedPurposes, isLoading: purposesLoading } = usePurposeTypes();
  const purposes = useMemo(() => pagedPurposes?.items ?? [], [pagedPurposes]);

  // Fetch Buildings data
  const { data: pagedBuildings, isLoading: buildingsLoading } = useBuildings({
    params: {
      campusId: 1
    },
    enabled: true
  })
  const buildings = useMemo(() => pagedBuildings?.items ?? [], [pagedBuildings]);

  const handleBuildingChange = (buildingId: string) => {
    setSelectedBuildingId(buildingId);
    setSelectedRoomId("");
  };

  // Fetch Rooms data
  const { data: pagedRooms, isLoading: roomsLoading } = useLabRooms({
    buildingId: Number(selectedBuildingId),
    includeBuilding: true
  });
  const rooms = useMemo(() => pagedRooms?.items ?? [], [pagedRooms])
  const selectedRoom = useMemo(() => {
    return rooms.find(room => room.id === Number(selectedRoomId)) || null;
  }, [rooms, selectedRoomId]);

  const handleRoomChange = (labRoomId: string) => {
    setSelectedRoomId(labRoomId);
  };

  // Fetch Policies Data
  const { data: policies } = useLabPolicies(Number(selectedRoomId));

  // Create Booking Hook
  const { mutate: createBooking, isPending } = useCreateBooking();
  const handleFinalConfirm = (formData: any) => {
    if (!pendingBooking) return;

    const currentBookingInfo = {
      date: pendingBooking.date,
      timeSlot: `${pendingBooking.startTime} - ${pendingBooking.endTime}`
    };

    // Tại đây mới tạo Object theo đúng kiểu CreateBookingCommand
    const command: CreateBookingCommand = {
      labRoomId: Number(selectedRoomId),
      slotTypeId: pendingBooking.slotTypeId,
      purposeTypeId: formData.purposeId,
      startTime: new Date(`${pendingBooking.date}T${pendingBooking.startTime}:00`).toISOString(),
      endTime: new Date(`${pendingBooking.date}T${pendingBooking.endTime}:00`).toISOString(),
      studentCount: formData.studentCount,
      recurringCount: formData.weeks,
      reason: formData.reason,
      groupIds: []
    };

    createBooking(command, {
      onSuccess: (data) => {
        // 1. Lưu ID và thông tin vừa đặt
        appAlert.success("Đặt lịch thành công!", `Mã đặt chỗ của bạn là: ${data.id}`);
        setLastBookingId(data.id);
        setSuccessData(currentBookingInfo);

        setPendingBooking(null)
        setShowConfirmPanel(false);
        setShowSuccessModal(true);
        queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      },
      onError: (err) => {
        const message = err.message || "Không thể tạo lịch đặt. Vui lòng kiểm tra lại thời gian.";
        appAlert.error("Lỗi đặt lịch", message);
      }
    });
  };

  const handleCalendarDragComplete = (data: PendingBooking) => {
    setPendingBooking(data);
    setShowConfirmPanel(true);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-50">
      <div className="flex flex-col overflow-hidden">
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
            <BuildingSelector
              buildings={buildings}
              isLoading={buildingsLoading}
              selectedId={selectedBuildingId}
              onSelect={handleBuildingChange}
            />

            {/* Lab Room Selection */}
            <RoomSelector
              rooms={rooms}
              isLoading={roomsLoading}
              selectedRoomId={selectedRoomId}
              onSelect={handleRoomChange}
              selectedBuildingId={selectedBuildingId}
            />
          </div>

          {/* View Toggle */}
          <div className="px-6 py-4 border-b border-gray-200">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              View Mode
            </label>
            <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveView("calendar")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-all text-sm font-medium ${activeView === "calendar"
                  ? "bg-white text-orange-600 shadow-sm border border-orange-200"
                  : "text-gray-600 hover:text-gray-900"
                  }`}
              >
                <CalendarIcon className="w-4 h-4" />
                <span>Calendar</span>
              </button>
              <button
                onClick={() => setActiveView("list")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-all text-sm font-medium ${activeView === "list"
                  ? "bg-white text-orange-600 shadow-sm border border-orange-200"
                  : "text-gray-600 hover:text-gray-900"
                  }`}
              >
                <List className="w-4 h-4" />
                <span>List</span>
              </button>
            </div>
          </div>
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
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Select a Lab Room
              </h2>
              <p className="text-gray-600">
                Choose a lab room from the sidebar to view availability
              </p>
            </div>
          </div>
        ) : activeView === "calendar" ? (
          <WeeklyCalendar
            policies={policies}
            calendarMode='LAB_SPECIFIC'
            selectedRoomId={selectedRoomId}
            selectedSlotTypeId={selectedSlotTypeId}
            onSlotTypeChange={setSelectedSlotTypeId}
            onCreateBooking={handleCalendarDragComplete}
            weekOffset={weekOffset}
            onWeekChange={setWeekOffset}
          />
        ) : (
          // <div className="flex-1 overflow-auto p-8 bg-gradient-to-b from-white to-gray-50">
          //   <div className="max-w-6xl mx-auto">
          //     <AvailableSlotList
          //       slots={displaySlots}
          //       selectedSlotIds={selectedSlotIds}
          //       onSelectSlot={(slotId) => {
          //         setSelectedSlotIds((prev) =>
          //           prev.includes(slotId)
          //             ? prev.filter((id) => id !== slotId)
          //             : [...prev, slotId],
          //         );
          //       }}
          //       onBookSelected={handleBookSelectedSlots}
          //       multiSelect={true}
          //       loading={slotsLoading}
          //     />
          //   </div>
          // </div>
          null
        )}
      </div>
      {/* Panel xác nhận nhanh (Slide-in từ bên phải) */}
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
          roomName={selectedRoom?.roomName || ""}
          onConfirm={handleFinalConfirm}
          loading={isPending}
          purposes={purposes}
          purposesLoading={purposesLoading}
        />
      )}
      {/* Modal thành công cuối cùng */}
      <BookingSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        bookingId={lastBookingId}
        roomName={selectedRoom?.roomName || ""}
        date={successData?.date || ""}
        timeSlot={successData?.timeSlot || ""}
        onViewMyBookings={() => navigate("/my-bookings")}
        onCreateAnother={() => {
          setShowSuccessModal(false);
          // Reset các filter nếu muốn người dùng bắt đầu lại từ đầu
        }}
      />
    </div>

  );
};

export default RoomBookingPage;

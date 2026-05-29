import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Calendar as CalendarIcon, Building2, Info } from "lucide-react";
import { SearchFreeSlotsModal } from "../../features/booking/components/SearchFreeSlotsModal";
import { BookingConfirmPanel } from "../../features/booking/components/BookingConfirmPanel";
import { BookingSuccessModal } from "../../features/booking/components/BookingSuccessModal";
import { ExclusiveWarningModal } from "../../features/booking/components/ExclusiveWarningModal";
import { useCreateBooking } from "../../features/booking/hooks/useCreateBooking";
import { useLabRooms } from "../../features/labroom/hooks/useLabRooms";
import { useToast } from "../../hooks/useToast";
import type {
  CreateBookingCommand,
  PendingBooking,
} from "../../features/booking/types/booking.type";
import { RoomSelector } from "../../features/labroom/components/RoomSelector";
import { useBuildings } from "../../features/building";
import { BuildingSelector } from "../../features/building/components/BuildingSelector";
import { FLEXIBLE_ID } from "../../features/slot/constants/slot.constant";
import { WeeklyCalendar } from "../../features/calendar/components/WeeklyCalendar";
import { usePurposeTypes } from "../../features/booking/hooks/usePurposeTypes";
import { useLabPolicies } from "../../features/labroom/hooks/useLabPolicies";
import { PolicyType } from "../../features/labroom";
import { useSlotStore } from "../../store/slotStore";
import { useNotificationStore } from "../../features/notifications/store/notificationStore";
import { useSlotTypes } from "../../features/slot/hooks/useSlotType";
import { useAuthStore } from "../../store/useAuthStore";
import { parseISO, startOfWeek, differenceInCalendarWeeks, format } from "date-fns";
import axiosInstance from "../../api/axios";

type FreeSlotItem = {
  roomId?: number;
  buildingId?: number;
  roomName?: string;
  buildingName?: string;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
};

/**
 * 🗓️ Room Booking Page - Google Calendar Style
 * Left sidebar with room selector + view toggle
 * Main area with weekly calendar grid supporting drag-and-drop booking
 */
const RoomBookingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roomIdParam = searchParams.get("roomId") ?? "";
  const buildingIdParam = searchParams.get("buildingId") ?? "";
  const focusDateParam = searchParams.get("focusDate") ?? "";
  const focusStartParam = searchParams.get("focusStart") ?? "";
  const focusEndParam = searchParams.get("focusEnd") ?? "";
  const appAlert = useToast();
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [successData, setSuccessData] = useState<{
    date: string;
    timeSlot: string;
  } | null>(null);
  const [lastBookingId, setLastBookingId] = useState<string>("");
  const [warningMessage, setWarningMessage] = useState<string>();

  const [selectedBuildingId, setSelectedBuildingId] = useState<string>(buildingIdParam);
  const [selectedRoomId, setSelectedRoomId] = useState<string>(roomIdParam);
  const [selectedSlotTypeId, setSelectedSlotTypeId] =
    useState<number>(FLEXIBLE_ID);
  const [weekOffset, setWeekOffset] = useState(0);
  const [focusRange, setFocusRange] = useState<{
    date: string;
    startTime: string;
    endTime: string;
  } | null>(null);

  useEffect(() => {
    if (!focusDateParam) return;

    const focusDate = parseISO(focusDateParam);
    if (Number.isNaN(focusDate.getTime())) return;

    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const focusWeekStart = startOfWeek(focusDate, { weekStartsOn: 1 });
    const diffWeeks = differenceInCalendarWeeks(focusWeekStart, weekStart, { weekStartsOn: 1 });
    setWeekOffset(diffWeeks);
    setFocusRange({
      date: focusDateParam,
      startTime: focusStartParam,
      endTime: focusEndParam,
    });

    const timer = window.setTimeout(() => {
      setFocusRange(null);
    }, 10000);

    return () => window.clearTimeout(timer);
  }, [focusDateParam, focusStartParam, focusEndParam]);

  const [showConfirmPanel, setShowConfirmPanel] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<FreeSlotItem[]>([]);
  const [selectedSearchSlot, setSelectedSearchSlot] = useState<FreeSlotItem | null>(null);
  const [searchStartDay, setSearchStartDay] = useState<string>('');
  const [searchEndDay, setSearchEndDay] = useState<string>('');
  const [searchStartTime, setSearchStartTime] = useState<string>('');
  const [searchEndTime, setSearchEndTime] = useState<string>('');
  const [searchDuration, setSearchDuration] = useState<string>('');
  const [pendingBooking, setPendingBooking] = useState<PendingBooking | null>(
    null,
  );

  // States quản lý dữ liệu cho Modal cảnh báo riêng biệt
  const [showExclusiveModal, setShowExclusiveModal] = useState(false);
  const [tempFormData, setTempFormData] = useState<any>(null);

  // Fetch Current User
  const { user } = useAuthStore();

  // Fetch Slot Types for dropdown & calendar rendering
  const { } = useSlotTypes(1);
  const { slotTypes } = useSlotStore();
  const fetchLatestByBookingId = useNotificationStore((state) => state.fetchLatestByBookingId);

  // Fetch Booking Purpose
  const { data: pagedPurposes, isLoading: purposesLoading } = usePurposeTypes();
  const purposes = useMemo(() => {
    const sortedPurposes = pagedPurposes?.items.slice().sort((a, b) => a.id - b.id) ?? [];
    if (user?.roles.includes("Admin")) {
      return sortedPurposes;
    }
    const lecturerAllowedPurposes = sortedPurposes.filter(purpose => purpose.id != 3);
    return lecturerAllowedPurposes;
  }, [pagedPurposes, user]);

  // Fetch Buildings data
  const { data: pagedBuildings, isLoading: buildingsLoading } = useBuildings();
  const buildings = useMemo(
    () => pagedBuildings?.items ?? [],
    [pagedBuildings],
  );

  const handleBuildingChange = (buildingId: string) => {
    setSelectedBuildingId(buildingId);
    setSelectedRoomId("");
  };

  useEffect(() => {
    if (buildingIdParam) setSelectedBuildingId(buildingIdParam);
    if (roomIdParam) setSelectedRoomId(roomIdParam);
  }, [buildingIdParam, roomIdParam]);

  // Fetch Rooms data
  const { data: pagedRooms, isLoading: roomsLoading } = useLabRooms({
    buildingId: Number(selectedBuildingId),
    includeBuilding: true,
    isActive: true,
  });
  const rooms = useMemo(() => pagedRooms?.items ?? [], [pagedRooms]);

  useEffect(() => {
    if (!roomIdParam) return;

    const roomId = Number(roomIdParam);
    if (!Number.isFinite(roomId)) return;

    const matchedRoom = rooms.find((room) => room.id === roomId);
    if (!matchedRoom) return;

    if (matchedRoom.buildingId && String(matchedRoom.buildingId) !== selectedBuildingId) {
      setSelectedBuildingId(String(matchedRoom.buildingId));
      return;
    }

    if (selectedRoomId !== roomIdParam) {
      setSelectedRoomId(roomIdParam);
    }
  }, [rooms, roomIdParam, selectedBuildingId, selectedRoomId]);

  useEffect(() => {
    if (!selectedRoomId) return;
    if (selectedBuildingId) return;

    const matchedRoom = rooms.find((room) => room.id === Number(selectedRoomId));
    if (matchedRoom?.buildingId) {
      setSelectedBuildingId(String(matchedRoom.buildingId));
    }
  }, [rooms, selectedRoomId, selectedBuildingId]);

  const selectedRoom = useMemo(() => {
    return rooms.find((room) => room.id === Number(selectedRoomId)) || null;
  }, [rooms, selectedRoomId]);

  const handleRoomChange = (labRoomId: string) => {
    setSelectedRoomId(labRoomId);
  };

  const handleOpenSearchModal = () => {
    setSearchStartDay(focusDateParam || format(new Date(), 'yyyy-MM-dd'));
    setSearchEndDay(focusDateParam || format(new Date(), 'yyyy-MM-dd'));
    setSearchStartTime('07:00');
    setSearchEndTime('23:00');
    setSearchDuration('');
    setSearchError(null);
    setSearchResults([]);
    setSelectedSearchSlot(null);
    setShowSearchModal(true);
  };

  const handleSearchAndNavigate = async () => {
    if (!searchStartDay || !searchEndDay) {
      setSearchError('Start Day và End Day là bắt buộc.');
      return;
    }

    setSearchLoading(true);
    setSearchError(null);

    try {
      const params = new URLSearchParams();
      params.set('startDay', searchStartDay);
      params.set('endDay', searchEndDay);
      if (selectedBuildingId) params.set('buildingId', selectedBuildingId);
      if (selectedRoomId) params.set('labRoomId', selectedRoomId);
      if (searchStartTime) params.set('startTime', searchStartTime);
      if (searchEndTime) params.set('endTime', searchEndTime);
      if (searchDuration) {
        const durationValue = searchDuration.length === 5 ? `${searchDuration}:00` : searchDuration;
        params.set('duration', durationValue);
      }

      const { data } = await axiosInstance.get('/Schedules/searchSlots/free', { params });
      const slots = data?.data ?? data?.result?.data ?? data?.data?.data ?? data;
      const normalized = Array.isArray(slots)
        ? slots.map((slot: any) => ({
          roomId: slot.roomId,
          buildingId: slot.buildingId,
          roomName: slot.roomName,
          buildingName: slot.buildingName,
          startDate: slot.startDate,
          endDate: slot.endDate,
          startTime: slot.startTime?.slice(0, 5) ?? slot.startTime,
          endTime: slot.endTime?.slice(0, 5) ?? slot.endTime,
        }))
        : [];

      setSearchResults(normalized);
      setSelectedSearchSlot(normalized[0] ?? null);

      if (normalized.length === 0) {
        setSearchError('Không tìm thấy khoảng trống nào phù hợp.');
        return;
      }
    } catch (error: any) {
      setSearchError(error?.response?.data?.message || 'Không thể tìm khoảng trống.');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleConfirmSearchSelection = () => {
    if (!selectedSearchSlot) return;

    const targetRoomId = selectedSearchSlot.roomId ?? Number(selectedRoomId);
    const targetBuildingId = selectedSearchSlot.buildingId ?? Number(selectedBuildingId);
    const startDate = selectedSearchSlot.startDate;
    const startTime = selectedSearchSlot.startTime;
    const endTime = selectedSearchSlot.endTime;

    setShowSearchModal(false);
    navigate(
      `/book-room?buildingId=${targetBuildingId}&roomId=${targetRoomId}&focusDate=${startDate}&focusStart=${startTime}&focusEnd=${endTime}`,
    );
  };

  useEffect(() => {
    if (!focusDateParam || !focusStartParam || !focusEndParam) return;

    setFocusRange({
      date: focusDateParam,
      startTime: focusStartParam,
      endTime: focusEndParam,
    });

    const parsedDate = new Date(focusDateParam);
    if (Number.isNaN(parsedDate.getTime())) return;

    const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const targetWeekStart = startOfWeek(parsedDate, { weekStartsOn: 1 });
    const offset = differenceInCalendarWeeks(targetWeekStart, currentWeekStart, { weekStartsOn: 1 });
    setWeekOffset(offset);
  }, [focusDateParam, focusStartParam, focusEndParam]);

  // Fetch Policies Data
  const { data: policies } = useLabPolicies(Number(selectedRoomId));

  // Create Booking Hook
  const { mutate: createBooking, isPending } = useCreateBooking();

  const executeBookingCreation = (formData: any) => {
    if (!pendingBooking) return;

    const currentBookingInfo = {
      date: pendingBooking.date,
      timeSlot: `${pendingBooking.startTime} - ${pendingBooking.endTime}`,
    };

    const command: CreateBookingCommand = {
      labRoomId: Number(selectedRoomId),
      slotTypeId: pendingBooking.slotTypeId,
      purposeTypeId: Number(formData.purposeId),
      startTime: new Date(`${pendingBooking.date}T${pendingBooking.startTime}`).toISOString(),
      endTime: new Date(`${pendingBooking.date}T${pendingBooking.endTime}`).toISOString(),
      studentCount: formData.studentCount,
      recurringCount: formData.weeks,
      reason: formData.reason,
      groupIds: [],
    };

    createBooking(command, {
      onSuccess: async (data) => {
        appAlert.success("Đặt lịch thành công!", `Mã đặt chỗ của bạn là: ${data.id}`);
        setLastBookingId(data.id);
        setSuccessData(currentBookingInfo);
        setWarningMessage(data.warningMessage);

        setPendingBooking(null);
        setShowConfirmPanel(false);
        setShowExclusiveModal(false); // Đóng modal con
        setTempFormData(null);
        setShowSuccessModal(true);

        await fetchLatestByBookingId(data.id);
      },
      onError: (err: any) => {
        const backendMessage = err.response?.data?.error;
        appAlert.error("Lỗi đặt lịch", backendMessage || "Không thể tạo lịch đặt.");
      },
    });
  };

  // Đánh chặn khi nhấn xác nhận trên Panel
  const handleFinalConfirm = (formData: any) => {
    if (Number(formData.purposeId) === 3) {
      setTempFormData(formData);
      setShowExclusiveModal(true); // Mở Modal bảo mật
    } else {
      executeBookingCreation(formData);
    }
  };

  const handleCalendarDragComplete = (data: PendingBooking) => {
    setPendingBooking(data);
    setShowConfirmPanel(true);
  };

  useEffect(() => {
    if (policies) {
      const isFreeTimeAllowed = (policies?.[PolicyType.IsFreeTimeAllowed] ?? 'true') === 'true' ? true : false;
      if (isFreeTimeAllowed) {
        setSelectedSlotTypeId(FLEXIBLE_ID);
      }
      else if (slotTypes.length > 0) {
        setSelectedSlotTypeId(slotTypes[0].id);
      }
    }

  }, [policies, slotTypes]);

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-50">
      <div className="flex flex-col overflow-hidden h-full">
        {/* Left Sidebar - Room Selector & View Toggle */}
        <div className="w-[420px] bg-white flex flex-col h-full border-r-4 border-orange-300 overflow-y-auto shadow-[4px_0_12px_-2px_rgba(251,146,60,0.15)]">
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

          <button
            onClick={handleOpenSearchModal}
            className="mx-3 mt-4 px-4 py-3 rounded-xl border border-orange-300 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold shadow-md hover:shadow-lg hover:from-orange-600 hover:to-orange-700 transition-all"
          >
            Find Available Slot
          </button>

          {/* Instructions - Inside sidebar */}
          <div className="px-4 py-4 bg-cyan-50 border border-cyan-500 rounded-lg mx-3 my-4">
            <div className="flex items-start gap-2 mb-3">
              <Info className="w-4 h-4 text-cyan-600 mt-0.5" />
              <p className="font-semibold text-cyan-900 text-sm">How to book</p>
            </div>
            <ol className="space-y-2 text-xs text-cyan-800 pl-6 list-decimal">
              <li>Select campus, building & room</li>
              <li>Drag on calendar to pick time slot</li>
              <li>Confirm booking details</li>
            </ol>
          </div>
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
        ) : (
          <WeeklyCalendar
            policies={policies}
            calendarMode="LAB_SPECIFIC"
            selectedRoomId={selectedRoomId}
            selectedSlotTypeId={selectedSlotTypeId}
            onSlotTypeChange={setSelectedSlotTypeId}
            onCreateBooking={handleCalendarDragComplete}
            weekOffset={weekOffset}
            onWeekChange={setWeekOffset}
            slotTypes={slotTypes}
            highlightRange={focusRange || undefined}
          />
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
      <ExclusiveWarningModal
        isOpen={showExclusiveModal}
        isLoading={isPending}
        onClose={() => {
          setShowExclusiveModal(false);
          setTempFormData(null);
        }}
        onConfirm={() => executeBookingCreation(tempFormData)}
      />
      <SearchFreeSlotsModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        searchError={searchError}
        searchLoading={searchLoading}
        searchStartDay={searchStartDay}
        searchEndDay={searchEndDay}
        searchStartTime={searchStartTime}
        searchEndTime={searchEndTime}
        searchDuration={searchDuration}
        onChangeStartDay={setSearchStartDay}
        onChangeEndDay={setSearchEndDay}
        onChangeStartTime={setSearchStartTime}
        onChangeEndTime={setSearchEndTime}
        onChangeDuration={setSearchDuration}
        onSearch={handleSearchAndNavigate}
        searchResults={searchResults}
        selectedSearchSlot={selectedSearchSlot}
        onSelectSlot={setSelectedSearchSlot}
        onConfirmSelection={handleConfirmSearchSelection}
        buildings={buildings}
        buildingsLoading={buildingsLoading}
        initialBuildingId={selectedBuildingId}
        initialRoomId={selectedRoomId}
      />

      {/* Modal thành công cuối cùng */}
      <BookingSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        bookingId={lastBookingId}
        warningMessage={warningMessage}
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

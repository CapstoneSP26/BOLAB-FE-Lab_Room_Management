import { useCallback, useEffect, useMemo, useState } from "react";
import type { EventInput } from "@fullcalendar/core";

import { labroomApi } from "../../labroom/api/labroom.api";
import { buildingApi } from "../../building/api/buildingApi";
import { useSchedules } from "../../schedules/hooks/useSchedules";
import { getScheduleTypeValue } from "../../schedules/types/schedule.type";
import type { BuildingDto } from "../../building/types/building.type";
import type { LabRoomDto } from "../../labroom/types/room.type";
import {
  convertUTCStringToLocal,
} from "../../../utils/date.util";
import { getRole } from "../../../utils/role";
import { norm } from "../../../utils/status";
import { DEFAULT_LAB_CALENDAR_FILTERS } from "../constants/calendar.constants";
import type {
  LabCalendarEventProps,
  LabCalendarFilterState,
  LabCalendarSelectOption,
} from "../types/calendar.type";
import { buildLabel, normalizeText } from "../utils/labCalendar.util";
import { LabCalendarFilters } from "./LabCalendarFilters";
import { LabCalendarView } from "./LabCalendarView";
import ScheduleFormModal from "../../schedules/components/ScheduleFormModal";

const isInTimeRange = (startTime: string, range: string) => {
  if (range === "ALL") return true;

  const hour = new Date(startTime).getHours();
  if (range === "MORNING") return hour >= 6 && hour < 12;
  if (range === "AFTERNOON") return hour >= 12 && hour < 18;
  if (range === "EVENING") return hour >= 18 && hour < 23;

  return true;
};

export default function LabCalendar() {
  const userRole = getRole();
  const isAdmin = userRole === "ADMIN";

  const [lookupLoading, setLookupLoading] = useState(true);
  const [roomLookup, setRoomLookup] = useState<LabRoomDto[]>([]);
  const [buildingLookup, setBuildingLookup] = useState<BuildingDto[]>([]);
  const [filters, setFilters] = useState<LabCalendarFilterState>(
    DEFAULT_LAB_CALENDAR_FILTERS,
  );
  const [selectedSchedule] = useState<any | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const schedulesQuery = useSchedules(
    {
      pageNumber: 1,
      pageSize: 1000,
      sortBy: "startTime",
      isDescending: false,
      buildingId: filters.selectedBuilding === "ALL" ? undefined : Number(filters.selectedBuilding),
      labRoomId: filters.selectedRoom === "ALL" ? undefined : Number(filters.selectedRoom),
    },
    true,
  );

  const schedules = useMemo(() => {
    const rawItems = schedulesQuery.data?.items ?? [];
    if (isAdmin) return rawItems;

    // Nếu là Manager, chỉ hiển thị schedule thuộc các phòng mình quản lý
    const managedRoomNames = new Set(
      roomLookup.map((r) => normalizeText(r.roomName)),
    );
    return rawItems.filter((s) =>
      managedRoomNames.has(normalizeText(s.labRoomName)),
    );
  }, [schedulesQuery.data?.items, isAdmin, roomLookup]);

  const loading =
    schedulesQuery.isLoading || schedulesQuery.isFetching || lookupLoading;

  useEffect(() => {
    const loadLookups = async () => {
      setLookupLoading(true);
      try {
        const [roomsResponse, buildingsResponse] = await Promise.all([
          labroomApi.getRooms({
            pageNumber: 1,
            pageSize: 1000,
            includeBuilding: true,
            isDescending: false,
          }),
          buildingApi.getBuildings({
            pageNumber: 1,
            pageSize: 100,
          })
        ]);

        setRoomLookup(roomsResponse?.items ?? []);
        setBuildingLookup(buildingsResponse?.items ?? []);
      } catch {
        setRoomLookup([]);
        setBuildingLookup([]);
      } finally {
        setLookupLoading(false);
      }
    };

    void loadLookups();
  }, []);

  const roomMetaMap = useMemo(() => {
    return new Map(
      roomLookup.map((room) => [normalizeText(room.roomName), room] as const),
    );
  }, [roomLookup]);

  const buildingOptions = useMemo<BuildingDto[]>(() => {
    return buildingLookup;
  }, [buildingLookup]);

  const roomOptions = useMemo<LabRoomDto[]>(() => {
    if (filters.selectedBuilding === "ALL") return roomLookup;
    return roomLookup.filter(r => String(r.buildingId) === filters.selectedBuilding);
  }, [roomLookup, filters.selectedBuilding]);

  const statusOptions = useMemo<LabCalendarSelectOption[]>(() => {
    const statuses = Array.from(
      new Set(
        schedules
          .map((schedule) => buildLabel(schedule.status))
          .filter((status) => status !== "Unknown"),
      ),
    ).sort();

    return [
      { value: "ALL", label: "All Status" },
      ...statuses.map((status) => ({
        value: norm(status),
        label: status,
      })),
    ];
  }, [schedules]);

  const slotTypeOptions = useMemo<LabCalendarSelectOption[]>(() => {
    const slotTypes = Array.from(
      new Set(
        schedules
          .map((schedule) => buildLabel(getScheduleTypeValue(schedule)))
          .filter((type) => type !== "Unknown"),
      ),
    ).sort();

    return [
      { value: "ALL", label: "All Types" },
      ...slotTypes.map((type) => ({
        value: norm(type),
        label: type,
      })),
    ];
  }, [schedules]);

  const eventInputs = useMemo<EventInput[]>(() => {
    return schedules.map((schedule) => {
      const roomName = buildLabel(schedule.labRoomName);
      const roomMeta = roomMetaMap.get(normalizeText(roomName));
      const subjectCode = buildLabel(schedule.subjectCode);
      const lecturerName = buildLabel(schedule.lecturerName);

      return {
        id: schedule.id,
        title: `${subjectCode} - ${lecturerName}`,
        start: convertUTCStringToLocal(schedule.startTime),
        end: convertUTCStringToLocal(schedule.endTime),
        extendedProps: {
          schedule,
          status: buildLabel(schedule.status),
          roomName,
          buildingName: roomMeta?.buildingName || "Unknown building",
          roomId: roomMeta?.id,
          buildingId: roomMeta?.buildingId,
        } satisfies LabCalendarEventProps,
      };
    });
  }, [roomMetaMap, schedules]);

  const filteredEventInputs = useMemo(() => {
    return eventInputs.filter((event) => {
      const ext = event.extendedProps as LabCalendarEventProps;

      // Note: Building and Room filters are now handled by API, 
      // but we keep FE filtering as a safety layer for any edge cases
      // and for other filters like Time Range, Status, and Slot Type.

      if (
        filters.selectedBuilding !== "ALL" &&
        ext.buildingId !== undefined &&
        String(ext.buildingId) !== filters.selectedBuilding
      ) {
        return false;
      }

      if (
        filters.selectedRoom !== "ALL" &&
        ext.roomId !== undefined &&
        String(ext.roomId) !== filters.selectedRoom
      ) {
        return false;
      }

      if (!isInTimeRange(ext.schedule.startTime, filters.selectedTimeRange)) {
        return false;
      }

      if (
        filters.selectedStatus !== "ALL" &&
        norm(ext.status) !== filters.selectedStatus
      ) {
        return false;
      }

      if (
        filters.selectedSlotType !== "ALL" &&
        norm(getScheduleTypeValue(ext.schedule)) !== filters.selectedSlotType
      ) {
        return false;
      }

      return true;
    });
  }, [eventInputs, filters]);

  const filterStats = useMemo(
    () => ({
      total: eventInputs.length,
      filtered: filteredEventInputs.length,
    }),
    [eventInputs.length, filteredEventInputs.length],
  );

  const handleFilterChange = useCallback(
    (key: keyof LabCalendarFilterState, value: string) => {
      setFilters((current) => {
        const next = { ...current, [key]: value };
        if (key === "selectedBuilding") {
          next.selectedRoom = "ALL";
        }
        return next;
      });
    },
    [],
  );



  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_LAB_CALENDAR_FILTERS);
  }, []);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800/50">
      <LabCalendarFilters
        filters={filters}
        buildingOptions={buildingOptions}
        roomOptions={roomOptions}
        statusOptions={statusOptions}
        slotTypeOptions={slotTypeOptions}
        filterStats={filterStats}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
      />

      <LabCalendarView
        loading={loading}
        scheduleCount={schedules.length}
        events={filteredEventInputs}
        onEventClick={handleEventClick}
      />

      <ScheduleFormModal
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        schedule={selectedSchedule}
        mode="view"
        roomOptions={[]} // Not needed for view mode, but required by type
        onSubmit={async () => { }}
      />


    </div>
  );
}

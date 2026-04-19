import { useCallback, useEffect, useMemo, useState } from "react";
import type { EventInput } from "@fullcalendar/core";

import { labroomApi } from "../../labroom/api/labroom.api";
import { useSchedules } from "../../schedules/hooks/useSchedules";
import { getScheduleTypeValue } from "../../schedules/types/schedule.type";
import { convertUTCStringToLocal } from "../../../utils/date.util";
import { getRole } from "../../../utils/role";
import { norm } from "../../../utils/status";
import { DEFAULT_LAB_CALENDAR_FILTERS } from "../constants/calendar.constants";
import type {
  LabCalendarEventProps,
  LabCalendarFilterState,
  LabCalendarSelectOption,
  RoomLookupItem,
  ScheduleRoomOption,
} from "../types/calendar.type";
import { buildLabel, normalizeText } from "../utils/labCalendar.util";
import CsvImportModal from "./CSVImportModal";
import { LabCalendarFilters } from "./LabCalendarFilters";
import { LabCalendarHeader } from "./LabCalendarHeader";
import { LabCalendarView } from "./LabCalendarView";

const templateText =
  "LabRoomId,StartTime,EndTime,ScheduleType,ScheduleStatus\n" +
  "101,2026-02-24T08:00:00Z,2026-02-24T10:00:00Z,REGULAR,AVAILABLE\n";

const isInTimeRange = (startTime: string, range: string) => {
  if (range === "ALL") return true;

  const hour = new Date(startTime).getHours();
  if (range === "MORNING") return hour >= 6 && hour < 12;
  if (range === "AFTERNOON") return hour >= 12 && hour < 18;
  if (range === "EVENING") return hour >= 18 && hour < 23;

  return true;
};

export default function LabCalendar() {
  const isAdmin = getRole() === "ADMIN";
  const [csvOpen, setCsvOpen] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(true);
  const [roomLookup, setRoomLookup] = useState<RoomLookupItem[]>([]);
  const [filters, setFilters] = useState<LabCalendarFilterState>(
    DEFAULT_LAB_CALENDAR_FILTERS,
  );

  const schedulesQuery = useSchedules(
    {
      pageNumber: 1,
      pageSize: 1000,
      sortBy: "startTime",
      isDescending: false,
    },
    true,
  );

  const schedules = useMemo(
    () => schedulesQuery.data?.items ?? [],
    [schedulesQuery.data?.items],
  );
  const loading =
    schedulesQuery.isLoading || schedulesQuery.isFetching || lookupLoading;

  const reload = useCallback(async () => {
    await schedulesQuery.refetch();
  }, [schedulesQuery]);

  useEffect(() => {
    const loadRooms = async () => {
      setLookupLoading(true);
      try {
        const response = await labroomApi.getRooms({
          pageNumber: 1,
          pageSize: 1000,
          includeBuilding: true,
          isDescending: false,
        });

        setRoomLookup(
          Array.isArray(response?.items)
            ? response.items.map((room) => ({
              id: room.id,
              roomName: room.roomName,
              buildingName: room.buildingName,
            }))
            : [],
        );
      } catch {
        setRoomLookup([]);
      } finally {
        setLookupLoading(false);
      }
    };

    void loadRooms();
  }, []);

  const roomMetaMap = useMemo(() => {
    return new Map(
      roomLookup.map((room) => [normalizeText(room.roomName), room] as const),
    );
  }, [roomLookup]);

  const roomOptions = useMemo<ScheduleRoomOption[]>(() => {
    const options = new Map<string, ScheduleRoomOption>();

    schedules.forEach((schedule) => {
      const roomName = buildLabel(schedule.labRoomName);
      const matchedRoom = roomMetaMap.get(normalizeText(roomName));

      options.set(normalizeText(roomName), {
        roomName,
        buildingName: matchedRoom?.buildingName || "Unknown building",
        roomId: matchedRoom?.id,
      });
    });

    return [...options.values()].sort((left, right) =>
      left.roomName.localeCompare(right.roomName),
    );
  }, [roomMetaMap, schedules]);

  const availableBuildings = useMemo(() => {
    return Array.from(
      new Set(roomOptions.map((room) => room.buildingName)),
    ).sort();
  }, [roomOptions]);

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
        } satisfies LabCalendarEventProps,
      };
    });
  }, [roomMetaMap, schedules]);

  const filteredEventInputs = useMemo(() => {
    return eventInputs.filter((event) => {
      const ext = event.extendedProps as LabCalendarEventProps;

      if (
        filters.selectedBuilding !== "ALL" &&
        ext.buildingName !== filters.selectedBuilding
      ) {
        return false;
      }

      if (
        filters.selectedRoom !== "ALL" &&
        ext.roomName !== filters.selectedRoom
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
      setFilters((current) => ({
        ...current,
        [key]: value,
      }));
    },
    [],
  );

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_LAB_CALENDAR_FILTERS);
  }, []);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800/50">
      <LabCalendarHeader
        isAdmin={isAdmin}
        onImport={() => setCsvOpen(true)}
        onRefresh={() => void reload()}
      />

      <LabCalendarFilters
        filters={filters}
        availableBuildings={availableBuildings}
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
      />

      <CsvImportModal
        open={csvOpen}
        onClose={() => setCsvOpen(false)}
        onImport={async (file) => {
          await reload();
        }}
        templateFileName="schedule_template.csv"
        templateText={templateText}
      />
    </div>
  );
}

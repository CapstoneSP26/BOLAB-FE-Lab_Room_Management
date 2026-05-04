import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  DateSelectArg,
  EventClickArg,
  EventInput,
} from "@fullcalendar/core";
import type { DateClickArg } from "@fullcalendar/interaction";

import type {
  Schedule,
  ScheduleType,
  ScheduleStatus,
} from "../../calendar/types/calendar.type";
import { labSchedulerApi } from "../../calendar/api/labSchedulerApi";

import { getRole } from "../../../utils/role";

type Mode = "create" | "edit";

type Payload = {
  LabRoomId: number;
  BuildingName: string;
  StartTime: string;
  EndTime: string;
  ScheduleType: ScheduleType;
  ScheduleStatus: ScheduleStatus;
};

export function useScheduleData() {
  const role = getRole();
  const isAdmin = role === "ADMIN";

  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("create");
  const [selected, setSelected] = useState<Schedule | null>(null);
  const [initial, setInitial] = useState<{ start: string; end: string } | null>(
    null,
  );

  const onDateClick = useCallback(
    (arg: DateClickArg) => {
      if (!isAdmin) return;

      const start = arg.date instanceof Date ? arg.date : new Date(arg.dateStr);
      const end = new Date(start);
      end.setMinutes(end.getMinutes() + 60);

      setMode("create");
      setSelected(null);
      setInitial({ start: start.toISOString(), end: end.toISOString() });
      setOpen(true);
    },
    [isAdmin],
  );

  const close = useCallback(() => {
    setOpen(false);
    setSelected(null);
    setInitial(null);
  }, []);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const sch = await labSchedulerApi.list();
      setSchedules(sch ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const events = useMemo<EventInput[]>(() => {
    return (schedules ?? []).map((s) => ({
      id: s.Id,
      title: `Room ${s.LabRoomId}`,
      start: s.StartTime,
      end: s.EndTime,
      extendedProps: { schedule: s, status: s.ScheduleStatus },
    }));
  }, [schedules]);

  const onSelect = useCallback(
    (arg: DateSelectArg) => {
      if (!isAdmin) return;

      arg.view.calendar.unselect();

      setMode("create");
      setSelected(null);
      setInitial({
        start: arg.start.toISOString(),
        end: arg.end.toISOString(),
      });
      setOpen(true);
    },
    [isAdmin],
  );

  const onEventClick = useCallback(
    (arg: EventClickArg) => {
      if (!isAdmin) return;

      const s = arg.event.extendedProps?.schedule as Schedule | undefined;
      if (!s) return;

      setMode("edit");
      setSelected(s);
      setInitial(null);
      setOpen(true);
    },
    [isAdmin],
  );

  // Tạm để no-op vì API hiện tại không còn create/update/delete
  const create = useCallback(async (payload: Payload) => {
    void payload;
  }, []);

  const update = useCallback(async (id: string, payload: Payload) => {
    void id;
    void payload;
  }, []);

  const remove = useCallback(async (id: string) => {
    void id;
  }, []);

  return {
    role,
    isAdmin,
    loading,
    schedules,
    events,

    editModal: {
      open,
      mode,
      schedule: selected,
      initial,
      onClose: close,
      onCreate: create,
      onUpdate: update,
      onDelete: remove,
    },

    handlers: {
      reload,
      onSelect,
      onEventClick,
      onDateClick,
    },
  };
}

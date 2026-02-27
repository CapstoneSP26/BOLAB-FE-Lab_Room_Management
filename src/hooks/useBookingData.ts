import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  DateSelectArg,
  EventClickArg,
  EventInput,
} from "@fullcalendar/core";

import type {
  Schedule,
  ScheduleType,
} from "../services/labmanager/labScheduler.service";
import { labSchedulerService } from "../services/labmanager/labScheduler.service";

import { getRole } from "../utils/role";
import type { ScheduleStatus } from "../services/labmanager/scheduleBooking.service";
import type { DateClickArg } from "@fullcalendar/interaction";
type Mode = "create" | "edit";

type Payload = {
  LabRoomId: number;
  StartTime: string;
  EndTime: string;
  ScheduleType: ScheduleType;
  ScheduleStatus: ScheduleStatus;
};

export function useScheduleData() {
  // ✅ đừng freeze role bằng useMemo([]) nếu bạn còn đổi role để test
  const role = getRole();
  const isAdmin = role === "ADMIN";

  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  // modal state
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("create");
  const [selected, setSelected] = useState<Schedule | null>(null);
  const [initial, setInitial] = useState<{ start: string; end: string } | null>(
    null,
  );
  const onDateClick = useCallback(
    (arg: DateClickArg) => {
      if (!isAdmin) return;

      // Month view: arg.dateStr thường là YYYY-MM-DD
      // Week/Day view: arg.date là Date đầy đủ giờ
      const start = arg.date instanceof Date ? arg.date : new Date(arg.dateStr);

      // default duration 60 phút
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
      const sch = await labSchedulerService.listSchedules();
      setSchedules(sch);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  // map to calendar events
  const events = useMemo<EventInput[]>(() => {
    return schedules.map((s) => ({
      id: s.Id,
      title: `Room ${s.LabRoomId}`,
      start: s.StartTime,
      end: s.EndTime,
      extendedProps: { schedule: s, status: s.ScheduleStatus },
    }));
  }, [schedules]);

  // Admin select slot => create
  const onSelect = useCallback(
    (arg: DateSelectArg) => {
      if (!isAdmin) return;

      // ✅ bỏ selection highlight
      arg.view.calendar.unselect();

      setMode("create");
      setSelected(null);

      // ✅ dùng ISO từ Date object cho chắc (timezone / format ổn định hơn startStr)
      setInitial({
        start: arg.start.toISOString(),
        end: arg.end.toISOString(),
      });

      setOpen(true);
    },
    [isAdmin],
  );

  // Admin click event => edit
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

  const create = useCallback(
    async (payload: Payload) => {
      await labSchedulerService.createSchedule(payload);
      await reload();
    },
    [reload],
  );

  const update = useCallback(
    async (id: string, payload: Payload) => {
      await labSchedulerService.updateSchedule(id, payload);
      await reload();
    },
    [reload],
  );

  const remove = useCallback(
    async (id: string) => {
      await labSchedulerService.deleteSchedule(id);
      await reload();
    },
    [reload],
  );

  return {
    role,
    isAdmin,
    loading,
    schedules,
    events,

    // modal props for ScheduleEditModal
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

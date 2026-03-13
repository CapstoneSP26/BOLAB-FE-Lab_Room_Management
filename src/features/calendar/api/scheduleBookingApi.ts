import type { Schedule, ScheduleType } from "./labSchedulerApi";

export type ScheduleStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | (string & {});

const KEY = "lab_schedules_v2";

function sleep(ms = 150) {
  return new Promise((r) => setTimeout(r, ms));
}

function readStorage(): Schedule[] {
  const raw = localStorage.getItem(KEY);
  if (!raw) {
    localStorage.setItem(KEY, JSON.stringify([]));
    return [];
  }
  try {
    return JSON.parse(raw) as Schedule[];
  } catch {
    localStorage.setItem(KEY, JSON.stringify([]));
    return [];
  }
}

function writeStorage(items: Schedule[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

function uid() {
  return "sch_" + Math.random().toString(16).slice(2) + "_" + Date.now();
}

export type CreateScheduleInput = {
  LabRoomId: number;
  BuildingName: string;
  StartTime: string; // ISO
  EndTime: string; // ISO
  ScheduleType: ScheduleType;
  ScheduleStatus: ScheduleStatus;
  FromAdmin: boolean;
};

export const scheduleService = {
  async list(): Promise<Schedule[]> {
    await sleep();
    return readStorage().filter((x) => !x.IsDeleted);
  },

  async create(input: CreateScheduleInput): Promise<Schedule> {
    await sleep();
    const items = readStorage();
    const now = new Date().toISOString();
    const next: Schedule = {
      Id: uid(),
      LecturerId: "",
      LabRoomId: input.LabRoomId,
      BuildingName: input.BuildingName,
      ScheduleType: input.ScheduleType,
      ScheduleStatus: input.ScheduleStatus,
      StartTime: input.StartTime,
      EndTime: input.EndTime,
      FromAdmin: input.FromAdmin,
      IsActive: true,
      IsDeleted: false,
      CreatedAt: now,
      UpdatedAt: now,
      CreatedBy: "ADMIN",
      UpdatedBy: "ADMIN",
    };
    items.unshift(next);
    writeStorage(items);
    return next;
  },

  async update(
    id: string,
    patch: Partial<CreateScheduleInput>,
  ): Promise<Schedule> {
    await sleep();
    const items = readStorage();
    const idx = items.findIndex((x) => x.Id === id);
    if (idx < 0) throw new Error("Schedule not found");

    const next: Schedule = {
      ...items[idx],
      ...patch,
      UpdatedAt: new Date().toISOString(),
      UpdatedBy: "ADMIN",
    };
    items[idx] = next;
    writeStorage(items);
    return next;
  },

  async remove(id: string): Promise<void> {
    await sleep();
    const items = readStorage();
    const idx = items.findIndex((x) => x.Id === id);
    if (idx < 0) return;
    items[idx] = {
      ...items[idx],
      IsDeleted: true,
      UpdatedAt: new Date().toISOString(),
    };
    writeStorage(items);
  },
};

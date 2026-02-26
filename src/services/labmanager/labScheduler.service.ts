import { addDays, toYmd } from "../../features/calendar/date";

export type ScheduleType = "OLD_SLOT" | "NEW_SLOT" | "OUT_SLOT" | (string & {});
export type ScheduleStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | (string & {});

export type Schedule = {
  Id: string;
  LecturerId: string;
  LabRoomId: number;

  ScheduleType: ScheduleType;
  ScheduleStatus: ScheduleStatus;
  BuildingName: string;
  StartTime: string;
  EndTime: string;

  CreatedAt: string;
  UpdatedAt: string;
  CreatedBy: string;
  UpdatedBy: string;

  IsActive: boolean;
  IsDeleted: boolean;
  FromAdmin: boolean;
};

const KEY = "lab_schedules_v2";

function sleep(ms = 150) {
  return new Promise((r) => setTimeout(r, ms));
}

function seedSchedules(): Schedule[] {
  const now = new Date();
  const d0 = toYmd(now);
  const d1 = toYmd(addDays(now, 1));
  const nowIso = new Date().toISOString();

  return [
    {
      Id: "b1",
      LecturerId: "lecturer-001",
      LabRoomId: 101,
      ScheduleType: "OLD_SLOT",
      ScheduleStatus: "PENDING",
      BuildingName: "Building A",
      StartTime: `${d0}T09:00`,
      EndTime: `${d0}T10:30`,
      CreatedAt: nowIso,
      UpdatedAt: nowIso,
      CreatedBy: "system",
      UpdatedBy: "system",
      IsActive: true,
      IsDeleted: false,
      FromAdmin: false,
    },
    {
      Id: "b2",
      LecturerId: "lecturer-002",
      LabRoomId: 202,
      ScheduleType: "NEW_SLOT",
      ScheduleStatus: "APPROVED",
      BuildingName: "Building B",
      StartTime: `${d1}T10:30`,
      EndTime: `${d1}T11:30`,
      CreatedAt: nowIso,
      UpdatedAt: nowIso,
      CreatedBy: "system",
      UpdatedBy: "system",
      IsActive: true,
      IsDeleted: false,
      FromAdmin: true,
    },
    {
      Id: "s3",
      LecturerId: "lecturer-003",
      LabRoomId: 101,
      ScheduleType: "OUT_SLOT",
      ScheduleStatus: "PENDING",
      BuildingName: "Building A",
      StartTime: `${d0}T13:00`,
      EndTime: `${d0}T14:30`,
      CreatedAt: nowIso,
      UpdatedAt: nowIso,
      CreatedBy: "system",
      UpdatedBy: "system",
      IsActive: true,
      IsDeleted: false,
      FromAdmin: false,
    },
  ];
}

function readStorage(): Schedule[] {
  const raw = localStorage.getItem(KEY);
  if (!raw) {
    const s = seedSchedules();
    localStorage.setItem(KEY, JSON.stringify(s));
    return s;
  }
  try {
    return JSON.parse(raw) as Schedule[];
  } catch {
    const s = seedSchedules();
    localStorage.setItem(KEY, JSON.stringify(s));
    return s;
  }
}

function writeStorage(items: Schedule[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

function genId() {
  return "s_" + Math.random().toString(36).slice(2, 10);
}

export const labSchedulerService = {
  async listSchedules(): Promise<Schedule[]> {
    await sleep();
    return readStorage();
  },

  async getScheduleById(id: string): Promise<Schedule> {
    await sleep();
    const all = readStorage();
    const found = all.find((x) => x.Id === id);
    if (!found) throw new Error("Schedule not found");
    return found;
  },

  async updateScheduleStatus(
    id: string,
    status: ScheduleStatus,
  ): Promise<Schedule> {
    await sleep();
    const items = readStorage();
    const idx = items.findIndex((s) => s.Id === id);
    if (idx < 0) throw new Error("Schedule not found");

    const next: Schedule = {
      ...items[idx],
      ScheduleStatus: status,
      UpdatedAt: new Date().toISOString(),
    };
    items[idx] = next;
    writeStorage(items);
    return next;
  },

  async createSchedule(data: {
    LabRoomId: number;
    StartTime: string;
    EndTime: string;
    BuildingName: string;
    ScheduleType: ScheduleType;
    ScheduleStatus: ScheduleStatus;
  }): Promise<Schedule> {
    await sleep();
    const items = readStorage();
    const nowIso = new Date().toISOString();

    const created: Schedule = {
      Id: genId(),
      LecturerId: "",
      LabRoomId: data.LabRoomId,
      StartTime: data.StartTime,
      EndTime: data.EndTime,
      ScheduleType: data.ScheduleType,
      ScheduleStatus: data.ScheduleStatus,
      BuildingName: data.BuildingName,
      CreatedAt: nowIso,
      UpdatedAt: nowIso,
      CreatedBy: "system",
      UpdatedBy: "system",
      IsActive: true,
      IsDeleted: false,
      FromAdmin: false,
    };

    items.unshift(created);
    writeStorage(items);
    return created;
  },

  async updateSchedule(
    id: string,
    data: {
      LabRoomId: number;
      StartTime: string;
      EndTime: string;
      ScheduleType: ScheduleType;
      BuildingName: string;
      ScheduleStatus: ScheduleStatus;
    },
  ): Promise<Schedule> {
    await sleep();
    const items = readStorage();
    const idx = items.findIndex((x) => x.Id === id);
    if (idx < 0) throw new Error("Schedule not found");

    const next: Schedule = {
      ...items[idx],
      ...data,
      UpdatedAt: new Date().toISOString(),
    };

    items[idx] = next;
    writeStorage(items);
    return next;
  },

  async deleteSchedule(id: string): Promise<void> {
    await sleep();
    const items = readStorage().filter((x) => x.Id !== id);
    writeStorage(items);
  },
};

import type { Schedule } from "./labScheduler.service";
import { labSchedulerService } from "./labScheduler.service";
import { addDays, toYmd } from "../../features/lab-management/calendar/date";

export type BookingStatus = "PENDING" | "APPROVED" | "REJECTED" | (string & {});

export type Booking = {
  Id: string;
  LabRoomId: number;
  BookedByUserId: string;
  StartTime: string;
  EndTime: string;

  group_size: number;
  PurposeTypeId: number;
  Reason: string;

  BookingStatus: BookingStatus;
  BookingType?: string | null;

  CreatedAt: string;
  UpdatedAt: string;
  CreatedBy: string;
  UpdatedBy: string;

  IsWeeklyRecurring: boolean;
  RecurringUntil?: string | null;
};

const KEY = "lab_bookings_v3";

function sleep(ms = 150) {
  return new Promise((r) => setTimeout(r, ms));
}

function seedBookings(): Booking[] {
  const now = new Date();
  const d0 = toYmd(now);
  const d1 = toYmd(addDays(now, 1));
  const nowIso = new Date().toISOString();

  return [
    {
      Id: "b1",
      LabRoomId: 101,
      BookedByUserId: "user-001",
      StartTime: `${d0}T09:00`,
      EndTime: `${d0}T10:30`,
      group_size: 5,
      PurposeTypeId: 1,
      Reason: "Lab practice",
      BookingStatus: "PENDING",
      BookingType: "NORMAL",
      CreatedAt: nowIso,
      UpdatedAt: nowIso,
      CreatedBy: "user-001",
      UpdatedBy: "user-001",
      IsWeeklyRecurring: false,
      RecurringUntil: null,
    },
    {
      Id: "b2",
      LabRoomId: 202,
      BookedByUserId: "user-002",
      StartTime: `${d1}T10:30`,
      EndTime: `${d1}T11:30`,
      group_size: 12,
      PurposeTypeId: 2,
      Reason: "Seminar",
      BookingStatus: "APPROVED",
      BookingType: "NORMAL",
      CreatedAt: nowIso,
      UpdatedAt: nowIso,
      CreatedBy: "user-002",
      UpdatedBy: "user-002",
      IsWeeklyRecurring: true,
      RecurringUntil: `${toYmd(addDays(now, 28))}T00:00`,
    },
  ];
}

function readStorage(): Booking[] {
  const raw = localStorage.getItem(KEY);
  if (!raw) {
    const s = seedBookings();
    localStorage.setItem(KEY, JSON.stringify(s));
    return s;
  }
  try {
    return JSON.parse(raw) as Booking[];
  } catch {
    const s = seedBookings();
    localStorage.setItem(KEY, JSON.stringify(s));
    return s;
  }
}

function writeStorage(items: Booking[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

const norm = (v: unknown) => String(v ?? "").toUpperCase();

function matchBookingForSchedule(
  bookings: Booking[],
  s: Schedule,
): Booking | null {
  const byId = bookings.find((b) => b.Id === s.Id);
  if (byId) return byId;

  const bySlot = bookings.find(
    (b) =>
      b.LabRoomId === s.LabRoomId &&
      b.StartTime === s.StartTime &&
      b.EndTime === s.EndTime,
  );
  return bySlot ?? null;
}

export const bookingRequestsService = {
  async listPending(): Promise<Booking[]> {
    await sleep();
    return readStorage().filter((b) => norm(b.BookingStatus) === "PENDING");
  },

  async listHistory(): Promise<Booking[]> {
    await sleep();
    return readStorage().filter((b) => {
      const st = norm(b.BookingStatus);
      return st === "APPROVED" || st === "REJECTED";
    });
  },

  async getById(id: string): Promise<Booking> {
    await sleep();
    const items = readStorage();
    const found = items.find((b) => b.Id === id);
    if (!found) throw new Error("Booking not found");
    return found;
  },

  async getByScheduleId(scheduleId: string): Promise<Booking | null> {
    await sleep();
    const [schedules, bookings] = await Promise.all([
      labSchedulerService.listSchedules(),
      Promise.resolve(readStorage()),
    ]);

    const sch = schedules.find((x) => x.Id === scheduleId);
    if (!sch) return null;

    return matchBookingForSchedule(bookings, sch);
  },

  async updateBookingStatus(
    id: string,
    status: BookingStatus,
  ): Promise<Booking> {
    await sleep();
    const items = readStorage();
    const idx = items.findIndex((b) => b.Id === id);
    if (idx < 0) throw new Error("Booking not found");

    const next: Booking = {
      ...items[idx],
      BookingStatus: status,
      UpdatedAt: new Date().toISOString(),
    };
    items[idx] = next;
    writeStorage(items);
    return next;
  },

  async approve(id: string): Promise<Booking> {
    return this.updateBookingStatus(id, "APPROVED");
  },

  async reject(id: string): Promise<Booking> {
    return this.updateBookingStatus(id, "REJECTED");
  },
};

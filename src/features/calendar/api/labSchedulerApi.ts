import type { Schedule } from "../type";

const KEY = "lab_schedules_v2";

function sleep(ms = 150) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

async function updateStatus(
  id: string,
  status: "APPROVED" | "REJECTED",
): Promise<Schedule> {
  await sleep();

  const items = readStorage();
  const idx = items.findIndex((x) => x.Id === id && !x.IsDeleted);
  if (idx < 0) throw new Error("Schedule not found");

  const next: Schedule = {
    ...items[idx],
    ScheduleStatus: status,
    UpdatedAt: new Date().toISOString(),
    UpdatedBy: "ADMIN",
  };

  items[idx] = next;
  writeStorage(items);

  return next;
}

export const labSchedulerApi = {
  async list(): Promise<Schedule[]> {
    await sleep();
    return readStorage().filter((x) => !x.IsDeleted);
  },

  async getById(id: string): Promise<Schedule | null> {
    await sleep();
    return readStorage().find((x) => x.Id === id && !x.IsDeleted) ?? null;
  },

  async approve(id: string): Promise<Schedule> {
    return updateStatus(id, "APPROVED");
  },

  async reject(id: string): Promise<Schedule> {
    return updateStatus(id, "REJECTED");
  },
};

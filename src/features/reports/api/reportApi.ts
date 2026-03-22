import type { Report, ReportImage, ReportType } from "../type.ts";

import {
  addIncidentFromReport,
  removeIncidentByReportId,
} from "../../incident-history/api/incidentHistoryApi.ts";
import { labSchedulerApi } from "../../calendar/api/labSchedulerApi.ts";

const KEY_REPORTS = "lab_reports_v1";
const KEY_IMAGES = "lab_report_images_v1";

function sleep(ms = 150) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function read<T>(key: string): T {
  const raw = localStorage.getItem(key);

  if (!raw) {
    const empty = [] as T;
    localStorage.setItem(key, JSON.stringify(empty));
    return empty;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    const empty = [] as T;
    localStorage.setItem(key, JSON.stringify(empty));
    return empty;
  }
}

function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

type ListFilters = {
  reportType?: ReportType | "ALL";
  resolved?: "ALL" | "RESOLVED" | "UNRESOLVED";
  q?: string;
  from?: string;
  to?: string;
};

async function getRoomIdFromSchedule(scheduleId: string | null | undefined) {
  if (!scheduleId) return 0;

  const schedules = await labSchedulerApi.list();
  const schedule = schedules.find((x) => x.Id === scheduleId);

  return schedule?.LabRoomId ?? 0;
}

export const reportApi = {
  async list(filters: ListFilters = {}): Promise<Report[]> {
    await sleep();

    const all = read<Report[]>(KEY_REPORTS);

    const reportType = filters.reportType ?? "ALL";
    const resolved = filters.resolved ?? "ALL";
    const q = (filters.q ?? "").trim().toLowerCase();
    const from = filters.from
      ? new Date(`${filters.from}T00:00:00`).getTime()
      : null;
    const to = filters.to ? new Date(`${filters.to}T23:59:59`).getTime() : null;

    return all
      .filter((r) =>
        reportType === "ALL" ? true : r.ReportType === reportType,
      )
      .filter((r) => {
        if (resolved === "ALL") return true;
        return resolved === "RESOLVED" ? r.IsResolved : !r.IsResolved;
      })
      .filter((r) => {
        if (!q) return true;

        const hay = [r.Id, r.UserId, r.ReportType, r.Description]
          .join(" ")
          .toLowerCase();

        return hay.includes(q);
      })
      .filter((r) => {
        const t = new Date(r.CreatedAt).getTime();
        if (from && t < from) return false;
        if (to && t > to) return false;
        return true;
      })
      .sort((a, b) => b.CreatedAt.localeCompare(a.CreatedAt));
  },

  async getById(id: string): Promise<Report | null> {
    await sleep();

    const all = read<Report[]>(KEY_REPORTS);
    return all.find((r) => r.Id === id) ?? null;
  },

  async listImages(reportId: string): Promise<ReportImage[]> {
    await sleep();

    const all = read<ReportImage[]>(KEY_IMAGES);
    return all.filter((x) => x.ReportId === reportId);
  },

  async setResolved(
    id: string,
    next: boolean,
    updatedBy = "u-admin-01",
  ): Promise<Report> {
    await sleep();

    const all = read<Report[]>(KEY_REPORTS);
    const idx = all.findIndex((r) => r.Id === id);

    if (idx < 0) throw new Error("Report not found");

    const updated: Report = {
      ...all[idx],
      IsResolved: next,
      UpdatedAt: new Date().toISOString(),
      UpdatedBy: updatedBy,
    };

    all[idx] = updated;
    write(KEY_REPORTS, all);

    if (next) {
      const labRoomId = await getRoomIdFromSchedule(updated.ScheduleId);

      await addIncidentFromReport({
        ReportId: updated.Id,
        LabRoomId: labRoomId,
        Title: String(updated.ReportType ?? "REPORT"),
        Description: updated.Description ?? "",
        Severity: "MEDIUM",
        ResolvedBy: updated.UpdatedBy ?? updatedBy,
        ResolvedAt: updated.UpdatedAt ?? new Date().toISOString(),
      });
    } else {
      await removeIncidentByReportId(updated.Id);
    }

    return updated;
  },
};

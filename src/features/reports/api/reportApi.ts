import type { Report, ReportImage, ReportType } from "../type.ts";

import { incidentHistoryService } from "../../incident-history/api/incidentHistoryApi.ts";
import { labSchedulerService } from "../../calendar/api/labSchedulerApi.ts";

const KEY_REPORTS = "lab_reports_v1";
const KEY_IMAGES = "lab_report_images_v1";

function sleep(ms = 150) {
  return new Promise((r) => setTimeout(r, ms));
}

function seedReports(): Report[] {
  const now = new Date();
  const iso = (d: Date) => d.toISOString();

  return [
    {
      Id: "r-001",
      ScheduleId: "s-001",
      UserId: "u-lect-01",
      ReportType: "INCIDENT",
      Description:
        "Projector not working in Room 101. Flickering and shuts down.",
      IsResolved: false,
      CreatedAt: iso(new Date(now.getTime() - 2 * 3600_000)),
      UpdatedAt: null,
      CreatedBy: "u-lect-01",
      UpdatedBy: null,
    },
    {
      Id: "r-002",
      ScheduleId: "s-002",
      UserId: "u-lect-02",
      ReportType: "LAB_ROOM",
      Description: "Air conditioner leaking water near the door.",
      IsResolved: true,
      CreatedAt: iso(new Date(now.getTime() - 24 * 3600_000)),
      UpdatedAt: iso(new Date(now.getTime() - 20 * 3600_000)),
      CreatedBy: "u-lect-02",
      UpdatedBy: "u-admin-01",
    },
  ];
}

function seedImages(): ReportImage[] {
  return [
    {
      Id: 1,
      ReportId: "r-001",
      ImageLink: "/images/demo/report1.jpg",
      Size: 210.5,
      FileType: "jpg",
    },
    {
      Id: 2,
      ReportId: "r-001",
      ImageLink: "/images/demo/report2.jpg",
      Size: 180.2,
      FileType: "jpg",
    },
  ];
}

function read<T>(key: string, seedFn: () => T): T {
  const raw = localStorage.getItem(key);
  if (!raw) {
    const s = seedFn();
    localStorage.setItem(key, JSON.stringify(s));
    return s;
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    const s = seedFn();
    localStorage.setItem(key, JSON.stringify(s));
    return s;
  }
}

function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

type ListFilters = {
  reportType?: ReportType | "ALL";
  resolved?: "ALL" | "RESOLVED" | "UNRESOLVED";
  q?: string;
  from?: string; // ISO date (yyyy-mm-dd) optional
  to?: string; // ISO date (yyyy-mm-dd) optional
};

/** ✅ lookup LabRoomId from ScheduleId */
async function getRoomIdFromSchedule(scheduleId: string | null | undefined) {
  if (!scheduleId) return 0;
  const schedules = await labSchedulerService.listSchedules();
  const s = schedules.find((x) => x.Id === scheduleId);
  return s?.LabRoomId ?? 0;
}

export const reportService = {
  async list(filters: ListFilters = {}): Promise<Report[]> {
    await sleep();
    const all = read<Report[]>(KEY_REPORTS, seedReports);

    const reportType = filters.reportType ?? "ALL";
    const resolved = filters.resolved ?? "ALL";
    const q = (filters.q ?? "").trim().toLowerCase();
    const from = filters.from
      ? new Date(filters.from + "T00:00:00").getTime()
      : null;
    const to = filters.to ? new Date(filters.to + "T23:59:59").getTime() : null;

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
    const all = read<Report[]>(KEY_REPORTS, seedReports);
    return all.find((r) => r.Id === id) ?? null;
  },

  async listImages(reportId: string): Promise<ReportImage[]> {
    await sleep();
    const all = read<ReportImage[]>(KEY_IMAGES, seedImages);
    return all.filter((x) => x.ReportId === reportId);
  },

  /**
   * ✅ Resolve/Mark pending
   * - next=true  => update report + create incident (linked by schedule->room)
   * - next=false => update report (optional: remove incident, nếu bạn muốn)
   */
  async setResolved(
    id: string,
    next: boolean,
    updatedBy = "u-admin-01",
  ): Promise<Report> {
    await sleep();
    const all = read<Report[]>(KEY_REPORTS, seedReports);
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

    // ✅ sync incident history
    if (next) {
      const labRoomId = await getRoomIdFromSchedule(updated.ScheduleId);

      await incidentHistoryService.addFromReport({
        ReportId: updated.Id,
        LabRoomId: labRoomId,
        Title: String(updated.ReportType ?? "REPORT"),
        Description: updated.Description ?? "",
        Severity: "MEDIUM",
        ResolvedBy: updated.UpdatedBy ?? updatedBy,
        ResolvedAt: updated.UpdatedAt ?? new Date().toISOString(),
      });
    } else {
      if (typeof incidentHistoryService.removeByReportId === "function") {
        await incidentHistoryService.removeByReportId(updated.Id);
      }
    }

    return updated;
  },
};

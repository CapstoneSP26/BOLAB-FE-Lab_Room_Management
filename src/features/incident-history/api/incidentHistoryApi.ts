export type IncidentStatus = "OPEN" | "CLOSED" | "RESOLVED" | string;
export type IncidentSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | string;

export type Incident = {
  Id: string;
  ReportId: string;

  LabRoomId: number;
  Title: string;
  Description: string;

  Severity: IncidentSeverity;
  Status: IncidentStatus;

  ResolvedAt?: string;
  ResolvedBy?: string;

  CreatedAt: string;
};

const KEY = "lab_incidents_v1";

function sleep(ms = 150) {
  return new Promise((r) => setTimeout(r, ms));
}

function readStorage(): Incident[] {
  const raw = localStorage.getItem(KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Incident[];
  } catch {
    return [];
  }
}

function writeStorage(items: Incident[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export const incidentHistoryService = {
  async list(): Promise<Incident[]> {
    await sleep();
    return readStorage().sort((a, b) =>
      (b.CreatedAt ?? "").localeCompare(a.CreatedAt ?? ""),
    );
  },

  async getById(id: string): Promise<Incident | null> {
    await sleep();
    return readStorage().find((x) => x.Id === id) ?? null;
  },

  async addFromReport(input: {
    ReportId: string;
    LabRoomId: number;
    Title: string;
    Description: string;
    Severity?: IncidentSeverity;
    ResolvedBy?: string;
    ResolvedAt?: string;
  }): Promise<Incident> {
    await sleep();
    const items = readStorage();

    const existed = items.find((x) => x.ReportId === input.ReportId);
    if (existed) return existed;

    const nowIso = new Date().toISOString();
    const incident: Incident = {
      Id: crypto.randomUUID(),
      ReportId: input.ReportId,
      LabRoomId: input.LabRoomId,
      Title: input.Title,
      Description: input.Description,
      Severity: input.Severity ?? "MEDIUM",
      Status: "RESOLVED",
      ResolvedAt: input.ResolvedAt ?? nowIso,
      ResolvedBy: input.ResolvedBy ?? "system",
      CreatedAt: input.ResolvedAt ?? nowIso,
    };

    items.unshift(incident);
    writeStorage(items);
    return incident;
  },
  async removeByReportId(reportId: string): Promise<void> {
    await sleep();
    const items = readStorage().filter((x) => x.ReportId !== reportId);
    writeStorage(items);
  },
};

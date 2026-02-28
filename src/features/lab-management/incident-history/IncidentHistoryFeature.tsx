import { useEffect, useMemo, useState } from "react";
import type { Incident } from "../../../services/labmanager/incidentHistory.service";
import { incidentHistoryService } from "../../../services/labmanager/incidentHistory.service";
import IncidentFilters, {
  type IncidentSortKey,
  type IncidentStatusFilter,
} from "./components/IncidentFilter";
import IncidentHistoryTable from "./components/IncidentHistoryTable";
import IncidentModal from "./components/IncidentModal";

export default function IncidentHistoryFeature() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Incident[]>([]);

  const [q, setQ] = useState("");
  const [roomId, setRoomId] = useState<number | "ALL">("ALL");
  const [status, setStatus] = useState<IncidentStatusFilter>("ALL");
  const [sort, setSort] = useState<IncidentSortKey>("Newest");

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Incident | null>(null);

  const closeModal = () => {
    setOpen(false);
    setSelected(null);
  };

  const reload = async () => {
    setLoading(true);
    try {
      const data = await incidentHistoryService.list();
      setItems(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  const roomOptions = useMemo(() => {
    const set = new Set<number>();
    items.forEach((x) => set.add(x.LabRoomId));
    return Array.from(set).sort((a, b) => a - b);
  }, [items]);

  const rows = useMemo(() => {
    const normalizedQ = q.trim().toLowerCase();
    let arr = [...items];

    if (roomId !== "ALL") arr = arr.filter((x) => x.LabRoomId === roomId);

    if (status !== "ALL") {
      const st = String(status).toUpperCase();
      arr = arr.filter((x) => String(x.Status).toUpperCase() === st);
    }

    if (normalizedQ) {
      arr = arr.filter((x) => {
        const hay = [
          x.Id,
          x.ReportId,
          String(x.LabRoomId),
          x.Title,
          x.Description,
          String(x.Severity),
          String(x.Status),
          x.ResolvedBy ?? "",
        ]
          .join(" ")
          .toLowerCase();
        return hay.includes(normalizedQ);
      });
    }

    if (sort === "Newest") {
      arr.sort((a, b) => (b.CreatedAt ?? "").localeCompare(a.CreatedAt ?? ""));
    } else if (sort === "Oldest") {
      arr.sort((a, b) => (a.CreatedAt ?? "").localeCompare(b.CreatedAt ?? ""));
    } else {
      arr.sort((a, b) => a.LabRoomId - b.LabRoomId);
    }

    return arr;
  }, [items, q, roomId, status, sort]);

  return (
    <>
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Incident History
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Resolved reports are archived here.
          </p>
        </div>

        <div className="inline-flex items-center gap-2">
          <span className="rounded-full bg-gray-500/10 px-3 py-1 text-sm font-semibold text-gray-700 dark:text-gray-200">
            Total: {rows.length}
          </span>
        </div>
      </div>

      <IncidentFilters
        q={q}
        onQ={setQ}
        roomId={roomId}
        onRoomId={setRoomId}
        status={status}
        onStatus={setStatus}
        sort={sort}
        onSort={setSort}
        roomOptions={roomOptions}
        onClear={() => {
          setQ("");
          setRoomId("ALL");
          setStatus("ALL");
          setSort("Newest");
        }}
      />

      <IncidentHistoryTable
        loading={loading}
        rows={rows}
        onView={(x) => {
          setSelected(x);
          setOpen(true);
        }}
      />

      <IncidentModal open={open} incident={selected} onClose={closeModal} />
    </>
  );
}

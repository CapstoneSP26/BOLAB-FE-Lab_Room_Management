export function toYmd(d: Date) {
  return d.toISOString().split("T")[0];
}

export function addDays(d: Date, days: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

export function formatTimeRange(start?: Date | null, end?: Date | null) {
  if (!start || !end) return "";

  const fmt = (d: Date) => {
    const h = d.getHours();
    const m = d.getMinutes();
    if (m === 0) return `${h}h`;
    return `${h}h${String(m).padStart(2, "0")}`;
  };

  return `${fmt(start)} - ${fmt(end)}`;
}

export const norm = (s: unknown) => String(s ?? "").toUpperCase();

export function statusClass(status: unknown) {
  const s = norm(status);
  if (s === "PENDING")
    return "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-700";
  if (s === "REJECTED")
    return "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700";
  return "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-700";
}

export function statusDot(status: unknown) {
  const s = norm(status);
  if (s === "PENDING") return "bg-amber-500";
  if (s === "REJECTED") return "bg-red-500";
  return "bg-emerald-500";
}

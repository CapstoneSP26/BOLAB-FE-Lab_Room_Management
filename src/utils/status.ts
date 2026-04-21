export const norm = (s: unknown) => String(s ?? "").toUpperCase();

export function statusClass(status: unknown) {
  const s = norm(status);
  if (s === "PENDING" || s === "1")
    return "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-700";
  if (s === "REJECTED" || s === "3")
    return "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700";
  if (s === "APPROVED" || s === "ACCEPTED" || s === "2")
    return "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-700";
  return "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-700";
}

export function statusDot(status: unknown) {
  const s = norm(status);
  if (s === "PENDING" || s === "1") return "bg-amber-500";
  if (s === "REJECTED" || s === "3") return "bg-red-500";
  if (s === "APPROVED" || s === "ACCEPTED" || s === "2") return "bg-emerald-500";
  return "bg-gray-500";
}

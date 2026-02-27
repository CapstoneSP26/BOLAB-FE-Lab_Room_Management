export type Role = "ADMIN" | "LAB_MANAGER" | "LECTURER" | "STUDENT";

export const normalizeRole = (v: unknown): Role => {
  const s = String(v ?? "")
    .trim()
    .toUpperCase();

  if (s === "LABMANAGER" || s === "LAB-MANAGER" || s === "LAB_MANAGER")
    return "LAB_MANAGER";

  if (s === "ADMIN") return "ADMIN";
  if (s === "LECTURER") return "LECTURER";
  return "STUDENT";
};

export const getRole = (): Role => normalizeRole(localStorage.getItem("role"));

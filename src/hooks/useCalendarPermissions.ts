export type Role = "ADMIN" | "LAB_MANAGER" | "LECTURER" | "STUDENT";

const getRole = (): Role =>
  (localStorage.getItem("role") as Role) || "LAB_MANAGER";

export function useCalendarPermissions() {
  const role = getRole();
  return {
    role,
    canCreateBooking: role === "ADMIN",
  };
}

export const ACCEPTED_EXTENSIONS = [".xlsx", ".xls", ".csv"];
export const MAX_FILE_SIZE_MB = 10;

export const USER_COLUMNS = [
  "FullName",
  "Email",
  "UserCode",
  "CampusCode",
  "RoleNames",
] as const;

export const columnLabels = {
  id: "ID",
  FullName: "Full Name",
  Email: "Email",
  UserCode: "User Code",
  CampusCode: "Campus Code",
  RoleNames: "Role Names",
} as const;

export const columnWidths = {
  id: "0px",
  FullName: "180px",
  Email: "220px",
  UserCode: "150px",
  CampusCode: "150px",
  RoleNames: "150px",
} as const;

// Common user roles in the system
export const allowedRoles = new Set([
  "Lecturer",
  "Manager",
  "Admin",
  "Student",
  "Lecturer,Manager"
]);

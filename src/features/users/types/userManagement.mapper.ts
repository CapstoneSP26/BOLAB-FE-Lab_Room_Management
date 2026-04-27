import type {
  CreateUserRequest,
  GetUsersResponse,
  UpdateUserRequest,
  UserFormValues,
  UserListItem,
  UserRole,
} from "./userManagement.type";

type MaybeRecord = Record<string, unknown>;

const asRecord = (value: unknown): MaybeRecord =>
  value && typeof value === "object" ? (value as MaybeRecord) : {};

const getString = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === "string" && value.trim() !== "") {
      return value.trim();
    }
  }

  return "";
};

const getOptionalString = (...values: unknown[]) => {
  const value = getString(...values);
  return value || undefined;
};

const getBoolean = (value: unknown, fallback = false) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value !== 0;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "active", "activated", "enable", "enabled"].includes(normalized)) {
      return true;
    }
    if (["false", "0", "inactive", "deactivated", "disabled"].includes(normalized)) {
      return false;
    }
  }

  return fallback;
};

const getNumber = (value: unknown, fallback: number) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
};

const ROLE_CONFIG: Record<UserRole, { id: number; labels: string[] }> = {
  ADMIN: { id: 1, labels: ["ADMIN", "1", "admin"] },
  LAB_MANAGER: { id: 2, labels: ["labmanager", "2", "lab_manager", "manager"] },
  LECTURER: { id: 3, labels: ["lectuer", "3", "lecturer"] },
  STUDENT: { id: 4, labels: ["STUDENT", "4", "student"] },
};

export const normalizeUserRole = (value: unknown): UserRole => {
  if (value && typeof value === "object") {
    const r = value as Record<string, unknown>;
    return normalizeUserRole(
      r.name ?? r.roleName ?? r.value ?? r.title ?? r.RoleName ?? r.Role,
    );
  }

  const s = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  for (const [role, config] of Object.entries(ROLE_CONFIG)) {
    if (
      config.labels.some((l) => l.toLowerCase() === s) ||
      role.toLowerCase() === s
    ) {
      return role as UserRole;
    }
  }

  return "STUDENT";
};

export const mapRoleToBackendId = (role: UserRole): number =>
  ROLE_CONFIG[role]?.id ?? 4;

const normalizeUserRoles = (value: unknown): UserRole[] => {
  if (Array.isArray(value) && value.length > 0) {
    return value.map(normalizeUserRole);
  }

  if (value) {
    return [normalizeUserRole(value)];
  }

  return ["STUDENT"];
};

const unwrapPayload = (value: unknown): unknown => {
  const record = asRecord(value);

  if ("data" in record && record.data !== undefined) {
    return unwrapPayload(record.data);
  }

  return value;
};

export const mapUserDtoToUserListItem = (dto: unknown): UserListItem => {
  const record = asRecord(dto);
  const roles = normalizeUserRoles(
    record.roles ??
      record.Roles ??
      record.role ??
      record.Role ??
      record.userRoles ??
      record.UserRoles ??
      record.primaryRole ??
      record.PrimaryRole,
  );

  return {
    id: String(record.userId || record.id || ""),
    userCode: getString(record.userCode, record.UserCode, record.code, record.Code),
    fullName: getString(
      record.fullName,
      record.FullName,
      record.name,
      record.Name,
    ),
    email: getString(record.email, record.Email),
    roles,
    primaryRole: roles[0] ?? "STUDENT",
    createdAt: getString(record.createdAt, record.CreatedAt),
    updatedAt:
      getOptionalString(record.updatedAt, record.UpdatedAt) ?? null,
    isActive: getBoolean(
      record.isActive ?? record.IsActive ?? record.status ?? record.Status,
      true,
    ),
    isDeleted: getBoolean(record.isDeleted ?? record.IsDeleted, false),
  };
};

export const normalizeUsersPagedResponse = (
  raw: unknown,
): GetUsersResponse => {
  const payload = unwrapPayload(raw);

  if (Array.isArray(payload)) {
    const items = payload.map(mapUserDtoToUserListItem);
    return {
      items,
      pageNumber: 1,
      totalPages: 1,
      totalCount: items.length,
      pageSize: items.length || 10,
      hasPreviousPage: false,
      hasNextPage: false,
    };
  }

  const record = asRecord(payload);
  const rawItems =
    record.items ??
    record.Items ??
    record.results ??
    record.Results ??
    record.records ??
    record.Records ??
    [];

  const items = Array.isArray(rawItems)
    ? rawItems.map(mapUserDtoToUserListItem)
    : [];

  const totalCount = getNumber(
    record.totalCount ??
      record.TotalCount ??
      record.total ??
      record.Total ??
      record.count ??
      record.Count,
    items.length,
  );
  const pageSize = Math.max(
    1,
    getNumber(record.pageSize ?? record.PageSize ?? record.limit ?? record.Limit, items.length || 10),
  );
  const pageNumber = Math.max(
    1,
    getNumber(
      record.pageNumber ?? record.PageNumber ?? record.page ?? record.Page,
      1,
    ),
  );
  const totalPages = Math.max(
    1,
    getNumber(
      record.totalPages ?? record.TotalPages,
      Math.ceil(totalCount / pageSize) || 1,
    ),
  );

  return {
    items,
    pageNumber,
    totalPages,
    totalCount,
    pageSize,
    hasPreviousPage:
      getBoolean(record.hasPreviousPage ?? record.HasPreviousPage, pageNumber > 1),
    hasNextPage:
      getBoolean(
        record.hasNextPage ?? record.HasNextPage,
        pageNumber < totalPages,
      ),
  };
};

export const mapUserFormValuesToCreateRequest = (
  values: UserFormValues,
): CreateUserRequest => ({
  fullName: values.fullName.trim(),
  email: values.email.trim(),
  userCode: values.userCode.trim() || undefined,
  roles: values.roles,
  password: values.password,
  isActive: values.isActive,
});

export const mapUserFormValuesToUpdateRequest = (
  values: UserFormValues,
): UpdateUserRequest => ({
  fullName: values.fullName.trim(),
  email: values.email.trim(),
  userCode: values.userCode.trim() || undefined,
  roles: values.roles,
  password: values.password.trim() || undefined,
  isActive: values.isActive,
});

export const getDefaultUserFormValues = (
  user?: UserListItem | null,
): UserFormValues => ({
  fullName: user?.fullName ?? "",
  email: user?.email ?? "",
  userCode: user?.userCode ?? "",
  roles: user?.roles ?? ["LECTURER"],
  password: "",
  isActive: user?.isActive ?? true,
});

export const getRoleLabel = (role: UserRole) => {
  switch (role) {
    case "ADMIN":
      return "Admin";
    case "LAB_MANAGER":
      return "Lab Manager";
    case "LECTURER":
      return "Lecturer";
    case "STUDENT":
      return "Student";
    default:
      return role;
  }
};

export const getUserStatusLabel = (isActive: boolean) =>
  isActive ? "Active" : "De-activated";

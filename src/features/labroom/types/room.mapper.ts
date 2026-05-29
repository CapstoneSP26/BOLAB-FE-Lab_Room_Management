import type { PagedResponse } from "../../../types/pagination.types";
import type {
  CreateLabRoomRequest,
  LabImageDto,
  LabOwnerDto,
  LabRoomDto,
  LabRoomFormValues,
  UpdateLabRoomRequest,
} from "./room.type";
import type { LabRoomPolicy, LabRoomPolicyUpdatePayload } from "./policy.type";
import { PolicyType } from "./policy.type";
import { isPolicyType, normalizePolicyKeyFromApi } from "../utils/policy.util";

type MaybeRecord = Record<string, unknown>;

const asRecord = (value: unknown): MaybeRecord =>
  value && typeof value === "object" ? (value as MaybeRecord) : {};

const unwrapPayload = (value: unknown): unknown => {
  const record = asRecord(value);

  if ("data" in record && record.data !== undefined) {
    return unwrapPayload(record.data);
  }

  return value;
};

const getString = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === "string" && value.trim() !== "") {
      return value.trim();
    }

    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
  }

  return "";
};

const getOptionalString = (...values: unknown[]) => {
  const value = getString(...values);
  return value || undefined;
};

const getNumber = (value: unknown, fallback: number) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
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
    if (
      ["true", "1", "active", "activated", "enable", "enabled"].includes(
        normalized,
      )
    ) {
      return true;
    }

    if (
      ["false", "0", "inactive", "deactivated", "disabled"].includes(normalized)
    ) {
      return false;
    }
  }

  return fallback;
};

const mapLabImageDto = (dto: unknown): LabImageDto => {
  const record = asRecord(dto);

  return {
    id: getString(record.id, record.Id),
    url: getString(record.url, record.Url, record.imageUrl, record.ImageUrl),
    isPrimary: getBoolean(record.isPrimary ?? record.IsPrimary, false),
  };
};

const mapLabOwnerDto = (dto: unknown): LabOwnerDto => {
  const record = asRecord(dto);
  return {
    id: getString(record.id, record.Id),
    email: getString(record.email, record.Email),
    fullName: getString(record.fullName, record.FullName, record.name, record.Name),
    userCode: getString(record.userCode, record.UserCode, record.code, record.Code),
    avatarUrl: getOptionalString(record.avatarUrl, record.AvatarUrl) ?? null,
    campusId: typeof record.campusId === "number" ? record.campusId : undefined,
    isActive: typeof record.isActive === "boolean" ? record.isActive : null,
    roleIds: Array.isArray(record.roleIds) ? (record.roleIds as string[]) : undefined,
    roles: Array.isArray(record.roles) ? (record.roles as string[]) : undefined,
  };
};

export const mapLabRoomDto = (dto: unknown): LabRoomDto => {
  const record = asRecord(dto);
  const rawImages = record.images ?? record.Images;

  return {
    id: getNumber(record.id ?? record.Id ?? record.roomId ?? record.RoomId, 0),
    roomName: getString(
      record.roomName,
      record.RoomName,
      record.name,
      record.Name,
    ),
    roomNo: getString(
      record.roomNo,
      record.RoomNo,
      record.code,
      record.Code,
      record.roomCode,
      record.RoomCode,
    ),
    location: getOptionalString(record.location, record.Location),
    capacity: getNumber(record.capacity ?? record.Capacity, 0),
    hasEquipment: getBoolean(record.hasEquipment ?? record.HasEquipment, false),
    description: getOptionalString(record.description, record.Description),
    buildingId: getNumber(
      record.buildingId ?? record.BuildingId ?? asRecord(record.building).id,
      0,
    ),
    buildingName: getString(
      record.buildingName,
      record.BuildingName,
      asRecord(record.building).buildingName,
      asRecord(record.building).BuildingName,
      asRecord(record.building).name,
      asRecord(record.building).Name,
    ),
    labOwnerId: getOptionalString(
      record.labOwnerId,
      record.LabOwnerId,
      // flat fallback nếu labOwner là object
      asRecord(record.labOwner).id,
      asRecord(record.labOwner).Id,
    ) ?? null,
    labOwner: (() => {
      // Ưu tiên nested object labOwner/LabOwner/owner từ API
      const raw = record.labOwner ?? record.LabOwner ?? record.owner;
      if (raw && typeof raw === "object") {
        return mapLabOwnerDto(raw);
      }
      // Fallback: build từ flat fields mà một số API list endpoint trả về
      const id = getString(record.labOwnerId, record.LabOwnerId);
      const fullName = getString(
        record.labOwnerName,
        record.LabOwnerName,
        record.ownerName,
        record.OwnerName,
        record.managerName,
        record.ManagerName,
      );
      const email = getString(
        record.labOwnerEmail,
        record.LabOwnerEmail,
        record.ownerEmail,
      );
      const userCode = getString(
        record.labOwnerCode,
        record.LabOwnerCode,
        record.ownerCode,
      );
      return { id, fullName, email, userCode };
    })(),
    images: Array.isArray(rawImages) ? rawImages.map(mapLabImageDto) : [],
    isActive: getBoolean(
      record.isActive ?? record.IsActive ?? record.status ?? record.Status,
      true,
    ),
    isDeleted: getBoolean(record.isDeleted ?? record.IsDeleted, false),
    createdAt: getOptionalString(record.createdAt, record.CreatedAt) ?? null,
    updatedAt: getOptionalString(record.updatedAt, record.UpdatedAt) ?? null,
  };
};

export const normalizeLabRoomsPagedResponse = (
  raw: unknown,
): PagedResponse<LabRoomDto> => {
  const payload = unwrapPayload(raw);

  if (Array.isArray(payload)) {
    const items = payload.map(mapLabRoomDto);
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

  const items = Array.isArray(rawItems) ? rawItems.map(mapLabRoomDto) : [];
  const totalCount = getNumber(
    record.totalCount ?? record.TotalCount ?? record.count ?? record.Count,
    items.length,
  );
  const pageSize = Math.max(
    1,
    getNumber(
      record.pageSize ?? record.PageSize ?? record.limit ?? record.Limit,
      items.length || 10,
    ),
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
    hasPreviousPage: getBoolean(
      record.hasPreviousPage ?? record.HasPreviousPage,
      pageNumber > 1,
    ),
    hasNextPage: getBoolean(
      record.hasNextPage ?? record.HasNextPage,
      pageNumber < totalPages,
    ),
  };
};

export const normalizeLabRoomPolicies = (raw: unknown): LabRoomPolicy[] => {
  const payload = unwrapPayload(raw);

  if (!Array.isArray(payload)) {
    return [];
  }

  return payload.map((item) => {
    const record = asRecord(item);
    const rawKey =
      record.policyKey ??
      record.PolicyKey ??
      record.policyKeyName ??
      record.PolicyKeyName;
    const keyStr = getString(
      record.policyKey,
      record.PolicyKey,
      record.policyKeyName,
      record.PolicyKeyName,
    );
    const policyKey =
      normalizePolicyKeyFromApi(rawKey) ??
      (isPolicyType(keyStr) ? keyStr : PolicyType.IsFreeTimeAllowed);

    return {
      labRoomId: getNumber(record.labRoomId ?? record.LabRoomId, 0),
      policyKey,
      policyKeyName:
        getString(record.policyKeyName, record.PolicyKeyName) || policyKey,
      policyValue: getString(
        record.policyValue,
        record.PolicyValue,
        record.value,
        record.Value,
      ),
      isActive: getBoolean(record.isActive ?? record.IsActive, true),
      createdAt: getOptionalString(record.createdAt, record.CreatedAt),
      updatedAt: getOptionalString(record.updatedAt, record.UpdatedAt) ?? null,
      createdBy: getOptionalString(record.createdBy, record.CreatedBy) ?? null,
      updatedBy: getOptionalString(record.updatedBy, record.UpdatedBy) ?? null,
    };
  });
};

export const mapLabRoomPayload = (
  payload: CreateLabRoomRequest | UpdateLabRoomRequest,
) => {
  const formData = new FormData();
  formData.append("RoomName", payload.roomName.trim());
  formData.append("RoomNo", payload.roomNo.trim());
  if (payload.location?.trim()) {
    formData.append("Location", payload.location.trim());
  }
  formData.append("Capacity", String(Number(payload.capacity)));
  formData.append("HasEquipment", String(payload.hasEquipment));
  if (payload.description?.trim()) {
    formData.append("Description", payload.description.trim());
  }
  formData.append("BuildingId", String(Number(payload.buildingId)));
  if (payload.labOwnerId) {
    formData.append("LabOwnerId", payload.labOwnerId);
  }
  formData.append("IsActive", String(payload.isActive ?? true));
  formData.append("IsImageUpdate", String(payload.IsImageUpdate ?? false));

  if (payload.Images instanceof File) {
    formData.append("Images", payload.Images);
  }

  return formData;
};

/** PUT policy: body contains updatable fields except labRoomId/policyKey (on URL). */
export const mapLabRoomPolicyUpdatePayload = (
  payload: LabRoomPolicyUpdatePayload,
) => ({
  ...(payload.policyValue !== undefined
    ? { policyValue: payload.policyValue.trim() }
    : {}),
  ...(payload.isActive !== undefined ? { isActive: payload.isActive } : {}),
});

export const getDefaultLabRoomFormValues = (
  room?: LabRoomDto | null,
): LabRoomFormValues => ({
  roomName: room?.roomName ?? "",
  roomNo: room?.roomNo ?? "",
  location: room?.location ?? "",
  capacity: room?.capacity ?? 40,
  hasEquipment: room?.hasEquipment ?? true,
  description: room?.description ?? "",
  buildingId: room?.buildingId ?? "",
  labOwnerId: room?.labOwnerId ?? room?.labOwner?.id ?? "",
  labOwner: room?.labOwner ?? null,
  isActive: room?.isActive ?? true,
  Images: null,
  IsImageUpdate: false,
});

export const getLabRoomStatusLabel = (isActive: boolean) =>
  isActive ? "Active" : "De-activated";

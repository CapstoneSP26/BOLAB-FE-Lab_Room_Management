/**
 * Backend enum values (BookLAB.Domain.Enums.PolicyType).
 * 5 is intentionally missing in backend enum definition.
 */
export const PolicyTypeValue = {
  IsFreeTimeAllowed: 1,
  MinBookingLeadTime: 2,
  MaxBookingAdvance: 3,
  CurfewTime: 4,
  MaxOutSlotDuration: 6,
  MaxConcurrentBookings: 7,
} as const;

/**
 * Raw DTO shape from backend RoomPolicy entity.
 * BE may serialize `policyKey` as number (enum value) or string (enum name)
 * depending on JSON serializer settings.
 */
export interface LabRoomPolicyDto {
  labRoomId: number;
  policyKey:
    | (typeof PolicyTypeValue)[keyof typeof PolicyTypeValue]
    | PolicyTypeEnum
    | number
    | string;
  policyValue: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string | null;
  createdBy: string; // Guid
  updatedBy?: string | null; // Guid?
}

/** Normalized policy model used by FE screens. */
export interface LabRoomPolicy {
  labRoomId: number;
  policyKey: PolicyTypeEnum;
  policyKeyName: string;
  policyValue: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
}

/**
 * PUT policy payload: allow updating everything except `labRoomId` and `policyKey`.
 * (Those two are fixed by URL params.)
 */
export type LabRoomPolicyUpdatePayload = Partial<
  Omit<LabRoomPolicy, "labRoomId" | "policyKey">
>;

export interface PolicyValidationResult {
  isValid: boolean;
  message?: string;
}

export const PolicyType = {
  IsFreeTimeAllowed: "IsFreeTimeAllowed",
  MinBookingLeadTime: "MinBookingLeadTime",
  MaxBookingAdvance: "MaxBookingAdvance",
  CurfewTime: "CurfewTime",
  MaxOutSlotDuration: "MaxOutSlotDuration",
  MaxConcurrentBookings: "MaxConcurrentBookings",
} as const;

export type PolicyTypeEnum =
  (typeof PolicyType)[keyof typeof PolicyType];

/** Map FE policy name -> BE enum value. */
export const PolicyTypeEnumValue: Record<PolicyTypeEnum, number> = {
  [PolicyType.IsFreeTimeAllowed]: PolicyTypeValue.IsFreeTimeAllowed,
  [PolicyType.MinBookingLeadTime]: PolicyTypeValue.MinBookingLeadTime,
  [PolicyType.MaxBookingAdvance]: PolicyTypeValue.MaxBookingAdvance,
  [PolicyType.CurfewTime]: PolicyTypeValue.CurfewTime,
  [PolicyType.MaxOutSlotDuration]: PolicyTypeValue.MaxOutSlotDuration,
  [PolicyType.MaxConcurrentBookings]: PolicyTypeValue.MaxConcurrentBookings,
};

/** Khớp entity BE RoomPolicy: LabRoomId, PolicyKey, PolicyValue, audit, IsActive */
export interface LabRoomPolicy {
  labRoomId: number;
  policyKey: PolicyTypeEnum;
  policyKeyName: string;
  policyValue: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
}

export interface LabRoomPolicyFormValues {
  policyKey: PolicyTypeEnum;
  policyValue: string;
}

export interface LabRoomPolicyMutationPayload {
  labRoomId?: number;
  policyKey: PolicyTypeEnum;
  policyValue: string;
}

/** PUT policy: chỉ cập nhật PolicyValue — không gửi lại policyKey / labRoomId trong body */
export interface LabRoomPolicyValuePayload {
  policyValue: string;
}

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

/** Giá trị enum PolicyType trên BE (BookLAB.Domain.Enums.PolicyType) */
export const PolicyTypeEnumValue: Record<PolicyTypeEnum, number> = {
  [PolicyType.IsFreeTimeAllowed]: 1,
  [PolicyType.MinBookingLeadTime]: 2,
  [PolicyType.MaxBookingAdvance]: 3,
  [PolicyType.CurfewTime]: 4,
  [PolicyType.MaxOutSlotDuration]: 6,
  [PolicyType.MaxConcurrentBookings]: 7,
};

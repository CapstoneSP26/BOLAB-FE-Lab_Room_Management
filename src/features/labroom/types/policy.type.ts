export interface LabRoomPolicy {
  policyKey: PolicyTypeEnum;
  policyKeyName: string;
  value: string;
}

export interface LabRoomPolicyFormValues {
  policyKey: PolicyTypeEnum;
  value: string;
}

export interface LabRoomPolicyMutationPayload {
  policyKey: PolicyTypeEnum;
  value: string;
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

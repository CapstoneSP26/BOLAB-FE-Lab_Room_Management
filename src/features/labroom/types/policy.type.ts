export type PolicyType = "IsFreeTimeAllowed"
  | "MinBookingLeadTime"
  | "MaxBookingAdvance"
  | "CurfewTime"
  | "MaxOutSlotDuration"
  | "MaxConcurrentBookings";

export interface LabRoomPolicy {
  policyKey: PolicyType;
  policyKeyName: string;
  value: string;
}

export interface PolicyValidationResult {
  isValid: boolean;
  message?: string;
}
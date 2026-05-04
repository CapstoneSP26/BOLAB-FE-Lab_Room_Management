import { PolicyType, type LabRoomPolicy } from "../types/policy.type";

export type PolicyMetaEntry = {
  label: string;
  placeholder: string;
  hint: string;
  icon: string;
  color: string;
  type: string;
};

export const POLICY_META: Record<
  (typeof PolicyType)[keyof typeof PolicyType],
  PolicyMetaEntry
> = {
  IsFreeTimeAllowed: {
    label: "Allow free time booking",
    placeholder: "true or false",
    hint: "Boolean rule to allow or block free-time booking.",
    icon: "🎯",
    color: "blue",
    type: "boolean",
  },
  MinBookingLeadTime: {
    label: "Minimum lead time",
    placeholder: "2",
    hint: "Number of hours required before booking starts.",
    icon: "⏰",
    color: "purple",
    type: "number"
  },
  MaxBookingAdvance: {
    label: "Maximum booking advance",
    placeholder: "14",
    hint: "Number of days users can book ahead.",
    icon: "📅",
    color: "green",
    type: "number",
  },
  CurfewTime: {
    label: "Curfew time",
    placeholder: "22:00",
    hint: "Latest allowed end time in HH:mm format.",
    icon: "🌙",
    color: "indigo",
    type: "time",
  },
  MaxOutSlotDuration: {
    label: "Maximum out-slot duration",
    placeholder: "4",
    hint: "Maximum duration allowed for flexible bookings.",
    icon: "⏱️",
    color: "orange",
    type: "number"
  },
  MaxConcurrentBookings: {
    label: "Maximum concurrent bookings",
    placeholder: "1",
    hint: "Limit how many bookings can coexist at once.",
    icon: "📊",
    color: "pink",
    type: "number"
  },
};

export const getPolicyKey = (policy: LabRoomPolicy) =>
  policy.policyKeyName || policy.policyKey;

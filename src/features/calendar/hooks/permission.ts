// import type { Role } from "../../utils/role";

// export type CalendarPermission = {
//   canView: boolean;
//   canReviewBookingRequest: boolean; // lab manager
//   canEditSchedule: boolean; // admin
//   canCreateBookingRequest: boolean; // lecturer
// };

// export const getCalendarPermission = (role: Role): CalendarPermission => {
//   const base = { canView: true };

//   switch (role) {
//     case "ADMIN":
//       return {
//         ...base,
//         canEditSchedule: true,
//         canReviewBookingRequest: false,
//         canCreateBookingRequest: false,
//       };
//     case "LAB_MANAGER":
//       return {
//         ...base,
//         canEditSchedule: false,
//         canReviewBookingRequest: true,
//         canCreateBookingRequest: false,
//       };
//     case "LECTURER":
//       return {
//         ...base,
//         canEditSchedule: false,
//         canReviewBookingRequest: false,
//         canCreateBookingRequest: true,
//       };
//     default:
//       return {
//         ...base,
//         canEditSchedule: false,
//         canReviewBookingRequest: false,
//         canCreateBookingRequest: false,
//       };
//   }
// };

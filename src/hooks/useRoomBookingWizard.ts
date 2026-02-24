// import { useCallback, useMemo, useState } from "react";
// import type {
//   BookingDraft,
//   Room,
//   StepId,
//   StudentGroup,
//   TimeSlot,
//   User,
// } from "../features/booking/type";
// import { STEPS } from "../features/booking/constants";

// export function useRoomBookingWizard() {
//   const [currentStep, setCurrentStep] = useState<StepId>(1);

//   const [selectedUser, setSelectedUser] = useState<User | null>(null);
//   const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");

//   const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>([]);

//   const [isRecurring, setIsRecurring] = useState(false);
//   const [recurringWeeks, setRecurringWeeks] = useState(1);

//   const [selectedGroup, setSelectedGroup] = useState<StudentGroup | null>(null);

//   const canProceed = useMemo(() => {
//     switch (currentStep) {
//       case 1:
//         return selectedUser !== null;
//       case 2:
//         return selectedRoom !== null;
//       case 3:
//         return startDate !== "" && endDate !== "";
//       case 4:
//         return selectedSlots.length > 0;
//       case 5:
//         return true;
//       case 6:
//         return true;
//       case 7:
//         return true;
//       default:
//         return false;
//     }
//   }, [
//     currentStep,
//     selectedUser,
//     selectedRoom,
//     startDate,
//     endDate,
//     selectedSlots,
//   ]);

//   const next = useCallback(() => {
//     if (!canProceed) return;
//     setCurrentStep((s) => (s < STEPS.length ? ((s + 1) as StepId) : s));
//   }, [canProceed]);

//   const back = useCallback(() => {
//     setCurrentStep((s) => (s > 1 ? ((s - 1) as StepId) : s));
//   }, []);

//   const draft: BookingDraft = useMemo(
//     () => ({
//       user: selectedUser,
//       room: selectedRoom,
//       period: { startDate, endDate },
//       slots: selectedSlots,
//       recurring: { enabled: isRecurring, weeks: recurringWeeks },
//       group: selectedGroup,
//     }),
//     [
//       selectedUser,
//       selectedRoom,
//       startDate,
//       endDate,
//       selectedSlots,
//       isRecurring,
//       recurringWeeks,
//       selectedGroup,
//     ],
//   );

//   return {
//     // step
//     currentStep,
//     canProceed,
//     next,
//     back,

//     // state setters (expose cho UI)
//     selectedUser,
//     setSelectedUser,
//     selectedRoom,
//     setSelectedRoom,
//     startDate,
//     setStartDate,
//     endDate,
//     setEndDate,
//     selectedSlots,
//     setSelectedSlots,
//     isRecurring,
//     setIsRecurring,
//     recurringWeeks,
//     setRecurringWeeks,
//     selectedGroup,
//     setSelectedGroup,

//     // collected data
//     draft,
//   };
// }

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bookingImportApi } from "../api/bookingImportApi";
import type {
  CommitFlexibleSlotImportRequest,
  ValidateFlexibleSlotImportRequest,
} from "../types/importBooking.type";

export const useBookingFlexibleImport = () => {
  const queryClient = useQueryClient();

  const validateFlexibleScheduleMutation = useMutation({
    mutationFn: (payload: ValidateFlexibleSlotImportRequest) =>
      bookingImportApi.validateFlexibleScheduleImport(payload),
  });

  const commitFlexibleScheduleMutation = useMutation({
    mutationFn: (payload: CommitFlexibleSlotImportRequest) =>
      bookingImportApi.commitFlexibleScheduleImport(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
    },
  });

  return {
    validateFlexibleScheduleMutation,
    commitFlexibleScheduleMutation,
    validateScheduleRows: validateFlexibleScheduleMutation.mutateAsync,
    commitScheduleRows: commitFlexibleScheduleMutation.mutateAsync,
  };
};
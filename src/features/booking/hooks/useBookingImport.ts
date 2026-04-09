import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bookingImportApi } from "../api/bookingImportApi";
import type {
  CommitImportCommand,
  ValidateImportQuery,
} from "../types/importBooking.type";

export const useBookingImport = () => {
  const queryClient = useQueryClient();

  const validateScheduleMutation = useMutation({
    mutationFn: (payload: ValidateImportQuery) =>
      bookingImportApi.validateScheduleImport(payload),
  });

  const commitScheduleMutation = useMutation({
    mutationFn: (payload: CommitImportCommand) =>
      bookingImportApi.commitScheduleImport(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
    },
  });

  return {
    validateScheduleMutation,
    commitScheduleMutation,
    validateScheduleRows: validateScheduleMutation.mutateAsync,
    commitScheduleRows: commitScheduleMutation.mutateAsync,
  };
};

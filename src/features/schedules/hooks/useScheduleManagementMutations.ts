import { useMutation, useQueryClient } from "@tanstack/react-query";
import { scheduleManagementApi } from "../api/scheduleManagementApi";
import type {
  CreateSchedulePayload,
  UpdateSchedulePayload,
} from "../types/scheduleManagement.type";
type MutationCtx = {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
};

export function useCreateSchedule(ctx?: MutationCtx) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSchedulePayload) =>
      scheduleManagementApi.create(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["schedule-management"] });
      ctx?.onSuccess?.();
    },
    onError: ctx?.onError,
  });
}

export function useUpdateSchedule(ctx?: MutationCtx) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateSchedulePayload;
    }) => scheduleManagementApi.update(id, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["schedule-management"] });
      ctx?.onSuccess?.();
    },
    onError: ctx?.onError,
  });
}

export function useDeleteSchedule(ctx?: MutationCtx) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => scheduleManagementApi.remove(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["schedule-management"] });
      ctx?.onSuccess?.();
    },
    onError: ctx?.onError,
  });
}

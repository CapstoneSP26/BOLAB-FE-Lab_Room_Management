import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { scheduleApi } from "../api/scheduleApi";
import type {
  GetSchedulesParams,
  CreateScheduleCommand,
  UpdateScheduleCommand,
} from "../types/schedule.type";

type MutationCtx = {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
};

export const SCHEDULE_QUERY_KEYS = {
  LIST: "schedules",
} as const;

export const useSchedules = (
  params: GetSchedulesParams,
  enabled: boolean = true,
) => {
  return useQuery({
    queryKey: ["schedules", params],
    queryFn: () => scheduleApi.getSchedules(params),
    placeholderData: keepPreviousData,
    retry: 2,
    enabled,
  });
};

export const useSchedulesStudent = (
  params: GetSchedulesParams,
  enabled: boolean = true,
) => {
  return useQuery({
    queryKey: ["schedules-student", params],
    queryFn: () => scheduleApi.getSchedulesStudent(params),
    placeholderData: keepPreviousData,
    retry: 2,
    enabled,
  });
};

export function useCreateSchedule(ctx?: MutationCtx) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateScheduleCommand) =>
      scheduleApi.createSchedule(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [SCHEDULE_QUERY_KEYS.LIST] });
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
      payload: UpdateScheduleCommand;
    }) => scheduleApi.updateSchedule(id, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [SCHEDULE_QUERY_KEYS.LIST] });
      ctx?.onSuccess?.();
    },
    onError: ctx?.onError,
  });
}

export function useDeleteSchedule(ctx?: MutationCtx) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => scheduleApi.deleteSchedule(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [SCHEDULE_QUERY_KEYS.LIST] });
      ctx?.onSuccess?.();
    },
    onError: ctx?.onError,
  });
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { scheduleManagementApi } from "../api/scheduleManagementApi";
import type { UpsertSlotTypePayload } from "../types/scheduleManagement.type";

export const slotTypeManagementQueryKey = (campusId?: number) =>
  ["slot-type-management", campusId ?? "all"] as const;

export function useSlotTypesForManagement(campusId?: number) {
  return useQuery({
    queryKey: slotTypeManagementQueryKey(campusId),
    queryFn: () => scheduleManagementApi.getSlotTypes(campusId),
  });
}

export function useCreateSlotType(onSuccess?: () => void) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpsertSlotTypePayload) =>
      scheduleManagementApi.createSlotType(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["slot-type-management"] });
      onSuccess?.();
    },
  });
}

export function useUpdateSlotType(onSuccess?: () => void) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpsertSlotTypePayload;
    }) => scheduleManagementApi.updateSlotType(id, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["slot-type-management"] });
      onSuccess?.();
    },
  });
}

export function useDeleteSlotType(onSuccess?: () => void) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => scheduleManagementApi.deleteSlotType(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["slot-type-management"] });
      onSuccess?.();
    },
  });
}

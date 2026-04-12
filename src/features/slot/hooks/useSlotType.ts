import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { slotApi } from "../api/slotApi";
import { useSlotStore } from "../../../store/slotStore";
import type { UpsertSlotTypePayload } from "../types/slot.types";

/**
 * Hook cho module slot (đã được chuyển sang module schedules)
 */
export const useSlotTypes = (campusId?: number) => {
  const setSlotTypes = useSlotStore((state) => state.setSlotTypes);

  const query = useQuery({
    queryKey: ["slotTypes", campusId],
    queryFn: () => slotApi.getSlotTypes(campusId),
    staleTime: Infinity, // Vì dữ liệu hiếm khi thay đổi
  });

  // Đồng bộ vào Store khi có dữ liệu mới
  useEffect(() => {
    if (query.data) {
      setSlotTypes(query.data);
    }
  }, [query.data, setSlotTypes]);

  return query;
};

/**
 * Hook dùng cho quản lý SlotType
 */
export const slotTypeManagementQueryKey = (campusId?: number) =>
  ["slot-type-management", campusId ?? "all"] as const;

export function useSlotTypesForManagement(campusId?: number) {
  return useQuery({
    queryKey: slotTypeManagementQueryKey(campusId),
    queryFn: () => slotApi.getSlotTypes(campusId),
  });
}

export function useCreateSlotType(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpsertSlotTypePayload) =>
      slotApi.createSlotType(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["slot-type-management"],
      });
      onSuccess?.();
    },
  });
}

export function useUpdateSlotType(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpsertSlotTypePayload;
    }) => slotApi.updateSlotType(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["slot-type-management"],
      });
      onSuccess?.();
    },
  });
}

export function useDeleteSlotType(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => slotApi.deleteSlotType(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["slot-type-management"],
      });
      onSuccess?.();
    },
  });
}

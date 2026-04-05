import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { labroomApi } from "../api/labroom.api";
import type {
  CreateLabRoomRequest,
  GetLabRoomsQuery,
  LabRoomDto,
  UpdateLabRoomRequest,
} from "../types/room.type";
import type {
  LabRoomPolicy,
  LabRoomPolicyMutationPayload,
} from "../types/policy.type";

/**
 * ===== BUSINESS LOGIC LAYER =====
 * Rules:
 * - Tên bắt đầu bằng use
 * - Không viết JSX trong hook
 * - Sử dụng React Query để quản lý API state
 */

export const QUERY_KEYS = {
  ROOMS: "rooms",
  ROOMS_MANAGEMENT: "rooms-management",
  ROOM_DETAIL: "room-detail",
  ROOM_POLICIES: "room-policies",
  STATS: "stats",
} as const;

/**
 * Hook lấy danh sách phòng/lab
 */
export const useLabRooms = (params?: GetLabRoomsQuery) => {
  return useQuery({
    queryKey: ["labrooms", params],
    queryFn: () => labroomApi.getRooms(params),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    enabled: !!params?.buildingId,
  });
};

export const useManagedLabRooms = (params: GetLabRoomsQuery = {}) =>
  useQuery({
    queryKey: [QUERY_KEYS.ROOMS_MANAGEMENT, params],
    queryFn: () => labroomApi.getRooms(params),
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

/**
 * Chi tiết một phòng lab theo id (GET /LabRoom/:id).
 */
export const useLabRoomDetail = (
  id: number | undefined,
  options: { enabled?: boolean } = {},
) => {
  const { enabled = true } = options;
  return useQuery({
    queryKey: [QUERY_KEYS.ROOM_DETAIL, id],
    queryFn: () => labroomApi.getRoomById(id!),
    enabled: enabled && id != null && Number.isFinite(id) && id > 0,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

interface UseStatsOptions {
  enabled?: boolean;
}

/**
 * Hook lấy thống kê tổng quan
 */
export const useStats = (options: UseStatsOptions = {}) => {
  const { enabled = true } = options;

  return useQuery({
    queryKey: [QUERY_KEYS.STATS],
    queryFn: labroomApi.getStats,
    enabled,
    staleTime: 1 * 60 * 1000, // 1 phút
    gcTime: 5 * 60 * 1000, // 5 phút
    refetchInterval: 30 * 1000, // Refetch mỗi 30s để cập nhật real-time
  });
};

interface MutationOptions<TData> {
  onSuccess?: (data: TData) => void;
  onError?: (error: Error) => void;
}

export const useRoomPolicies = (labRoomId: number, enabled = true) =>
  useQuery({
    queryKey: [QUERY_KEYS.ROOM_POLICIES, labRoomId],
    queryFn: () => labroomApi.getLabPolicies(labRoomId),
    enabled: enabled && labRoomId > 0,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

export const useCreateLabRoom = (
  options: MutationOptions<LabRoomDto> = {},
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateLabRoomRequest) => labroomApi.createRoom(payload),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.ROOMS_MANAGEMENT],
      });
      options.onSuccess?.(data);
    },
    onError: (error: Error) => {
      options.onError?.(error);
    },
  });
};

export const useUpdateLabRoom = (
  options: MutationOptions<LabRoomDto> = {},
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateLabRoomRequest;
    }) => labroomApi.updateRoom(id, payload),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.ROOMS_MANAGEMENT],
      });
      options.onSuccess?.(data);
    },
    onError: (error: Error) => {
      options.onError?.(error);
    },
  });
};

export const useUpdateLabRoomStatus = (
  options: MutationOptions<LabRoomDto> = {},
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      labroomApi.updateRoomStatus(id, isActive),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.ROOMS_MANAGEMENT],
      });
      options.onSuccess?.(data);
    },
    onError: (error: Error) => {
      options.onError?.(error);
    },
  });
};

export const useDeleteLabRoom = (options: MutationOptions<void> = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => labroomApi.deleteRoom(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.ROOMS_MANAGEMENT],
      });
      options.onSuccess?.(undefined);
    },
    onError: (error: Error) => {
      options.onError?.(error);
    },
  });
};

export const useCreateRoomPolicy = (
  options: MutationOptions<LabRoomPolicy> = {},
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      labRoomId,
      payload,
    }: {
      labRoomId: number;
      payload: LabRoomPolicyMutationPayload;
    }) => labroomApi.createLabPolicy(labRoomId, payload),
    onSuccess: (data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.ROOM_POLICIES, variables.labRoomId],
      });
      options.onSuccess?.(data);
    },
    onError: (error: Error) => {
      options.onError?.(error);
    },
  });
};

export const useUpdateRoomPolicy = (
  options: MutationOptions<LabRoomPolicy> = {},
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      labRoomId,
      policyKey,
      payload,
    }: {
      labRoomId: number;
      policyKey: string;
      payload: LabRoomPolicyMutationPayload;
    }) => labroomApi.updateLabPolicy(labRoomId, policyKey, payload),
    onSuccess: (data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.ROOM_POLICIES, variables.labRoomId],
      });
      options.onSuccess?.(data);
    },
    onError: (error: Error) => {
      options.onError?.(error);
    },
  });
};

export const useDeleteRoomPolicy = (
  options: MutationOptions<void> = {},
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      labRoomId,
      policyKey,
    }: {
      labRoomId: number;
      policyKey: string;
    }) => labroomApi.deleteLabPolicy(labRoomId, policyKey),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.ROOM_POLICIES, variables.labRoomId],
      });
      options.onSuccess?.(undefined);
    },
    onError: (error: Error) => {
      options.onError?.(error);
    },
  });
};


import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../../api";
import type { PagedResponse } from "../../../types/pagination.types";
import type { BuildingDto, GetBuildingsQuery } from "../types/building.type";
import type {
  CreateBuildingPayload,
  UpdateBuildingPayload,
} from "../types/buildingManagement.type";

const BUILDING_API = {
  LIST: "/buildings",
  DETAIL: (id: number) => `/buildings/${id}`,
} as const;

export const useManagedBuildings = (params: GetBuildingsQuery) => {
  return useQuery({
    queryKey: ["buildings", "managed", params],
    queryFn: () =>
      axiosInstance
        .get<PagedResponse<BuildingDto>>(BUILDING_API.LIST, { params })
        .then((res) => res.data),
    staleTime: 60 * 1000,
  });
};

export const useCreateBuilding = (options?: {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateBuildingPayload) =>
      axiosInstance
        .post<BuildingDto>(BUILDING_API.LIST, payload)
        .then((res) => res.data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["buildings"] });
      options?.onSuccess?.();
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });
};

export const useUpdateBuilding = (options?: {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { id: number; payload: UpdateBuildingPayload }) =>
      axiosInstance
        .put<BuildingDto>(BUILDING_API.DETAIL(input.id), input.payload)
        .then((res) => res.data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["buildings"] });
      options?.onSuccess?.();
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });
};

export const useDeleteBuilding = (options?: {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      axiosInstance.delete(BUILDING_API.DETAIL(id)).then(() => undefined),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["buildings"] });
      options?.onSuccess?.();
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });
};


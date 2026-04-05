import axiosInstance from "../../../api/axios";
import type {
  LabRoomPolicy,
  LabRoomPolicyMutationPayload,
} from "../types/policy.type";
import type {
  CreateLabRoomRequest,
  GetStatsResponse,
  GetLabRoomsQuery,
  LabRoomDto,
  UpdateLabRoomRequest,
} from "../types/room.type";
import type { PagedResponse } from "../../../types/pagination.types";
import {
  mapLabRoomDto,
  mapLabRoomPayload,
  mapLabRoomPolicyPayload,
  normalizeLabRoomPolicies,
  normalizeLabRoomsPagedResponse,
} from "../types/room.mapper";

const LABROOM_API = {
  LIST: "/LabRoom",
  DETAIL: (id: number) => `/LabRoom/${id}`,
  STATUS: (id: number) => `/LabRoom/${id}/status`,
  POLICIES: (labRoomId: number) => `/LabRoom/${labRoomId}/policies`,
  POLICY_DETAIL: (labRoomId: number, policyKey: string) =>
    `/LabRoom/${labRoomId}/policies/${policyKey}`,
  STATS: "/LabRoom/stats",
} as const;

const buildRoomListParams = (params: GetLabRoomsQuery = {}) => ({
  buildingId: params.buildingId,
  roomNo: params.roomNo,
  q: params.q ?? params.searchTerm ?? params.roomNo,
  keyword: params.keyword ?? params.q ?? params.searchTerm ?? params.roomNo,
  searchTerm: params.searchTerm ?? params.q ?? params.keyword ?? params.roomNo,
  includeImages: params.includeImages,
  includeBuilding: params.includeBuilding,
  isActive: params.isActive,
  page: params.page ?? params.pageNumber,
  pageNumber: params.pageNumber ?? params.page,
  limit: params.limit ?? params.pageSize,
  pageSize: params.pageSize ?? params.limit,
  sortBy: params.sortBy,
  isDescending: params.isDescending,
});

export const labroomApi = {
  async getRooms(params?: GetLabRoomsQuery): Promise<PagedResponse<LabRoomDto>> {
    const response = await axiosInstance.get(LABROOM_API.LIST, {
      params: buildRoomListParams(params),
    });

    return normalizeLabRoomsPagedResponse(response.data);
  },

  async getRoomById(id: number): Promise<LabRoomDto> {
    const response = await axiosInstance.get(LABROOM_API.DETAIL(id));
    const raw = response.data as unknown;
    const inner =
      raw &&
      typeof raw === "object" &&
      "data" in (raw as object) &&
      (raw as { data?: unknown }).data !== undefined
        ? (raw as { data: unknown }).data
        : raw;
    return mapLabRoomDto(inner);
  },

  async getLabPolicies(labRoomId: number): Promise<LabRoomPolicy[]> {
    const response = await axiosInstance.get(LABROOM_API.POLICIES(labRoomId));
    return normalizeLabRoomPolicies(response.data);
  },

  async createRoom(payload: CreateLabRoomRequest): Promise<LabRoomDto> {
    const response = await axiosInstance.post(
      LABROOM_API.LIST,
      mapLabRoomPayload(payload),
    );

    return mapLabRoomDto(response.data);
  },

  async updateRoom(id: number, payload: UpdateLabRoomRequest): Promise<LabRoomDto> {
    const response = await axiosInstance.put(
      LABROOM_API.DETAIL(id),
      mapLabRoomPayload(payload),
    );

    return mapLabRoomDto(response.data);
  },

  async updateRoomStatus(id: number, isActive: boolean): Promise<LabRoomDto> {
    const response = await axiosInstance.patch(LABROOM_API.STATUS(id), {
      isActive,
    });

    return mapLabRoomDto(response.data);
  },

  async deleteRoom(id: number): Promise<void> {
    await axiosInstance.delete(LABROOM_API.DETAIL(id));
  },

  async createLabPolicy(
    labRoomId: number,
    payload: LabRoomPolicyMutationPayload,
  ): Promise<LabRoomPolicy> {
    const response = await axiosInstance.post(
      LABROOM_API.POLICIES(labRoomId),
      mapLabRoomPolicyPayload(payload),
    );

    return normalizeLabRoomPolicies(response.data)[0] ?? {
      policyKey: payload.policyKey,
      policyKeyName: payload.policyKey,
      value: payload.value,
    };
  },

  async updateLabPolicy(
    labRoomId: number,
    policyKey: string,
    payload: LabRoomPolicyMutationPayload,
  ): Promise<LabRoomPolicy> {
    const response = await axiosInstance.put(
      LABROOM_API.POLICY_DETAIL(labRoomId, policyKey),
      mapLabRoomPolicyPayload(payload),
    );

    return normalizeLabRoomPolicies(response.data)[0] ?? {
      policyKey: payload.policyKey,
      policyKeyName: payload.policyKey,
      value: payload.value,
    };
  },

  async deleteLabPolicy(labRoomId: number, policyKey: string): Promise<void> {
    await axiosInstance.delete(LABROOM_API.POLICY_DETAIL(labRoomId, policyKey));
  },

  getStats: () =>
    axiosInstance
      .get<GetStatsResponse>(LABROOM_API.STATS)
      .then((response) => response.data),
};

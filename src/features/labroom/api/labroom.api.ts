import axiosInstance from "../../../api/axios";
import type {
  LabRoomPolicy,
  LabRoomPolicyUpdatePayload,
} from "../types/policy.type";
import type {
  CreateLabRoomRequest,
  GetLabRoomsQuery,
  GetStatsResponse,
  UpdateLabRoomRequest,
  ApiResponse,
  LabRoomDto,
} from "../types/room.type";
import {
  mapLabRoomDto,
  mapLabRoomPayload,
  mapLabRoomPolicyUpdatePayload,
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

const unwrapEnvelopeData = (raw: unknown): unknown => {
  if (
    raw &&
    typeof raw === "object" &&
    "data" in (raw as object) &&
    (raw as { data?: unknown }).data !== undefined
  ) {
    return (raw as { data: unknown }).data;
  }
  return raw;
};

export const labroomApi = {
  getRooms: (params: GetLabRoomsQuery = {}) =>
    axiosInstance
      .get(LABROOM_API.LIST, {
        params,
      })
      .then((response) => normalizeLabRoomsPagedResponse(response.data)),

  getRoomById: (id: number) =>
    axiosInstance
      .get(LABROOM_API.DETAIL(id))
      .then((response) => mapLabRoomDto(unwrapEnvelopeData(response.data))),

  getLabPolicies: (labRoomId: number) =>
    axiosInstance
      .get(LABROOM_API.POLICIES(labRoomId))
      .then((response) => normalizeLabRoomPolicies(response.data)),

  createRoom: (
    payload: CreateLabRoomRequest,
  ): Promise<{ data: LabRoomDto; message: string }> =>
    axiosInstance
      .post<ApiResponse<unknown>>(LABROOM_API.LIST, mapLabRoomPayload(payload))
      .then((response) => {
        if (!response.data.success) {
          throw new Error(response.data.message || "Failed to create room");
        }
        return {
          data: mapLabRoomDto(response.data.data),
          message: response.data.message,
        };
      }),

  updateRoom: (
    id: number,
    payload: UpdateLabRoomRequest,
  ): Promise<{ data: LabRoomDto; message: string }> =>
    axiosInstance
      .put<ApiResponse<unknown>>(LABROOM_API.DETAIL(id), mapLabRoomPayload(payload))
      .then((response) => {
        if (!response.data.success) {
          throw new Error(response.data.message || "Failed to update room");
        }
        return {
          data: mapLabRoomDto(response.data.data),
          message: response.data.message,
        };
      }),

  updateRoomStatus: (
    id: number,
    isActive: boolean,
  ): Promise<{ data: LabRoomDto; message: string }> =>
    axiosInstance
      .patch<ApiResponse<unknown>>(LABROOM_API.STATUS(id), { isActive })
      .then((response) => {
        if (!response.data.success) {
          throw new Error(response.data.message || "Failed to update room status");
        }
        return {
          data: mapLabRoomDto(unwrapEnvelopeData(response.data.data)),
          message: response.data.message,
        };
      }),

  deleteRoom: (id: number): Promise<{ message: string }> =>
    axiosInstance
      .delete<ApiResponse<unknown>>(LABROOM_API.DETAIL(id))
      .then((response) => {
        if (!response.data.success) {
          throw new Error(response.data.message || "Failed to delete room");
        }
        return {
          message: response.data.message,
        };
      }),

  updateLabPolicy: (
    labRoomId: number,
    policyKey: string,
    payload: LabRoomPolicyUpdatePayload,
  ): Promise<LabRoomPolicy> =>
    axiosInstance
      .put(
        LABROOM_API.POLICY_DETAIL(labRoomId, policyKey),
        mapLabRoomPolicyUpdatePayload(payload),
      )
      .then(
        (response) =>
          normalizeLabRoomPolicies(response.data)[0] ?? {
            labRoomId,
            policyKey: policyKey as LabRoomPolicy["policyKey"],
            policyKeyName: policyKey,
            policyValue: payload.policyValue ?? "",
            isActive: payload.isActive ?? true,
          },
      ),

  deleteLabPolicy: (labRoomId: number, policyKey: string) =>
    axiosInstance
      .delete(LABROOM_API.POLICY_DETAIL(labRoomId, policyKey))
      .then(() => undefined),

  getStats: () =>
    axiosInstance
      .get<GetStatsResponse>(LABROOM_API.STATS)
      .then((response) => response.data),
};

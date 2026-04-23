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

  createRoom: (payload: CreateLabRoomRequest) =>
    axiosInstance
      .post(LABROOM_API.LIST, mapLabRoomPayload(payload))
      .then((response) => mapLabRoomDto(response.data)),

  updateRoom: (id: number, payload: UpdateLabRoomRequest) =>
    axiosInstance
      .put(LABROOM_API.DETAIL(id), mapLabRoomPayload(payload))
      .then((response) => mapLabRoomDto(response.data)),

  updateRoomStatus: (id: number, isActive: boolean) =>
    axiosInstance
      .patch(LABROOM_API.STATUS(id), isActive)
      .then((response) => mapLabRoomDto(unwrapEnvelopeData(response.data))),

  deleteRoom: (id: number) =>
    axiosInstance.delete(LABROOM_API.DETAIL(id)).then(() => undefined),

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

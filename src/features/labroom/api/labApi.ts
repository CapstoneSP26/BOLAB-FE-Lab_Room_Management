import { axiosInstance } from "../../../api";
import type { LabRoomPolicy } from "../types/policy.type";
import type { GetRoomsRequest, GetRoomsResponse, GetStatsResponse } from "../types/room.type";

export const labApi = {
  getLabPolicies: (labRoomId: number) =>
    axiosInstance.get<LabRoomPolicy[]>(`/LabRooms/${labRoomId}/policies`),

  getRooms: (params: GetRoomsRequest | undefined) =>
    axiosInstance.get<GetRoomsResponse>('/LabRooms', { params })
      .then(response => response.data),

  getStats: () =>
    axiosInstance.get<GetStatsResponse>('/LabRooms/stats')
      .then(response => response.data),
};

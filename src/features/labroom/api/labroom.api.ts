import { axiosInstance } from "../../../api";
import type { LabRoomPolicy } from "../types/policy.type";
import type { GetStatsResponse, GetLabRoomsQuery, LabRoomDto } from "../types/room.type";
import type { PagedResponse } from "../../../types/pagination.types";

export const labroomApi = {
  getRooms: (params?: GetLabRoomsQuery) =>
    axiosInstance.get<PagedResponse<LabRoomDto>>('/LabRooms', { params })
      .then(response => response.data),

  getLabPolicies: (labRoomId: number) =>
    axiosInstance.get<LabRoomPolicy[]>(`/LabRooms/${labRoomId}/policies`),

  getStats: () =>
    axiosInstance.get<GetStatsResponse>('/LabRooms/stats')
      .then(response => response.data),
};

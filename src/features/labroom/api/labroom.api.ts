import { axiosInstance } from "../../../api";
import type { LabRoomPolicy } from "../types/policy.type";
import type {
  GetStatsResponse,
  GetLabRoomsQuery,
  LabRoomDto,
} from "../types/room.type";
import type { PagedResponse } from "../../../types/pagination.types";

export const labroomApi = {
  getRooms: (params?: GetLabRoomsQuery) =>
    axiosInstance.get<PagedResponse<LabRoomDto>>('/LabRoom', { params })
      .then(response => response.data),

  getLabPolicies: (labRoomId: number) =>
    axiosInstance.get<LabRoomPolicy[]>(`/LabRoom/${labRoomId}/policies`),

  getStats: () =>
    axiosInstance.get<GetStatsResponse>('/LabRoom/stats')
      .then(response => response.data),
};

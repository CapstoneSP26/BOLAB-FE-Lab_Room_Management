import { axiosInstance } from "../../../api";
import type { LabRoomPolicy } from "../types/policy.types";

export const labApi = {
  getLabPolicies: (labRoomId: number) =>
    axiosInstance.get<LabRoomPolicy[]>(`/LabRooms/${labRoomId}/policies`),
};
import { axiosInstance } from "../../../api";
import type { BuildingResponse, GetBuildingsRequest, GetBuildingsResponse } from "../types/building.type";

export const buildingApi = {
  getBuildingByName: (buildingName: string) =>
    axiosInstance.get<BuildingResponse>(`/buildings`, {
      params: { buildingName },
    }),

  getBuildings: async (params: GetBuildingsRequest | undefined) => {
    const rawData = await axiosInstance.get<GetBuildingsResponse>(`/buildings`, { params })
      .then(res => res.data);
    const buildingsArray = Array.isArray(rawData) ? rawData : (rawData?.data ?? []);
    return { data: buildingsArray, total: buildingsArray.length };
  },

};

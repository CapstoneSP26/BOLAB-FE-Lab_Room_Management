import { axiosInstance } from "../../../api";
import type { PagedResponse } from "../../../types/pagination.types";
import type { BuildingDto, BuildingResponse, GetBuildingsQuery } from "../types/building.type";

export const buildingApi = {
  getBuildingByName: (buildingName: string) =>
    axiosInstance.get<BuildingResponse>(`/buildings`, {
      params: { buildingName },
    }),

  getBuildings: (params?: GetBuildingsQuery) =>
    axiosInstance
      .get<PagedResponse<BuildingDto>>('/buildings', {
        params
      })
      .then(response => response.data),

};

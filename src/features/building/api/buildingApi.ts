import { axiosInstance } from "../../../api";
import type { PagedResponse } from "../../../types/pagination.types";
import type { BuildingDto, GetBuildingsQuery } from "../types/building.type";

export const buildingApi = {
  getBuildingByName: async (buildingName: string): Promise<BuildingDto> => {
    const response = await axiosInstance.get<PagedResponse<BuildingDto>>("/buildings", {
      params: { buildingName, pageNumber: 1, pageSize: 1 },
    });

    const building = response.data.items?.[0];
    if (!building) {
      throw new Error(`Building "${buildingName}" not found`);
    }

    return building;
  },

  getBuildings: (params?: GetBuildingsQuery) =>
    axiosInstance
      .get<PagedResponse<BuildingDto>>("/buildings", { params })
      .then((response) => response.data),
};

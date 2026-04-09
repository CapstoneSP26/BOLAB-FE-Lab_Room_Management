import { axiosInstance } from "../../../api";
import type { PagedResponse } from "../../../types/pagination.types";
import type {
  BuildingDto,
  Building,
  GetBuildingsQuery,
} from "../types/building.type";

export const buildingApi = {
  getBuildingByName: (buildingName: string) =>
    axiosInstance
      .get<Building>("/buildings", {
        params: { buildingName },
      })
      .then((response) => response.data),

  getBuildings: (params?: GetBuildingsQuery) =>
    axiosInstance
      .get<PagedResponse<BuildingDto>>("/buildings", { params })
      .then((response) => response.data),
};

import { axiosInstance } from "../../../api";
import type {
  BuildingDto,
  BuildingResponse,
  GetBuildingsQuery,
} from "../types/building.type";

export const buildingApi = {
  getBuildingByName: (buildingName: string) =>
    axiosInstance
      .get<BuildingResponse>("/buildings", {
        params: { buildingName },
      })
      .then((response) => response.data),

  getBuildings: (params?: GetBuildingsQuery) =>
    axiosInstance
      .get<BuildingDto[]>("/buildings", { params })
      .then((response) => response.data),
};

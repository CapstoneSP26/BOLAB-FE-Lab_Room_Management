import { axiosInstance } from "../../../api";
import type { PagedResponse } from "../../../types/pagination.types";
import type { BuildingDto, GetBuildingsQuery, CreateBuildingPayload, UpdateBuildingPayload, ApiResponse } from "../types/building.type";

const buildFormData = (payload: CreateBuildingPayload | UpdateBuildingPayload) => {
  const formData = new FormData();
  formData.append("BuildingName", payload.BuildingName);
  formData.append("Descriptions", payload.Descriptions);
  formData.append("IsImageUpdate", payload.IsImageUpdate.toString());
  
  if (payload.Images instanceof File) {
    formData.append("Images", payload.Images);
  }

  return formData;
};

const normalizePagedResponse = (data: any): PagedResponse<BuildingDto> => ({
  items: (data.items || []).map((item: any) => ({
    id: item.id || 0,
    campusId: item.campusId || 0,
    buildingName: item.buildingName || "",
    buildingImageUrl: item.buildingImageUrl || "",
    description: item.description || "",
    campusName: item.campusName || "",
    roomCount: item.roomCount || 0,
  })),
  totalCount: data.totalCount || 0,
  pageNumber: data.pageNumber || 1,
  pageSize: data.pageSize || 10,
  totalPages: data.totalPages || 1,
});

export const buildingApi = {
  getBuildingById: async (id: number): Promise<BuildingDto> => {
    const response = await axiosInstance.get<ApiResponse<BuildingDto>>(`/buildings/${id}`);
    const building = response.data.data;
    if (!building) {
      throw new Error("Building not found");
    }
    return building;
  },

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

  getBuildings: async (params?: GetBuildingsQuery): Promise<PagedResponse<BuildingDto>> => {
    const response = await axiosInstance.get<PagedResponse<BuildingDto>>("/buildings", { 
      params: {
        ...params,
        _t: Date.now() // Phá cache bằng timestamp
      } 
    });
    return normalizePagedResponse(response.data);
  },

  createBuilding: async (payload: CreateBuildingPayload): Promise<{ data: PagedResponse<BuildingDto>; message: string }> => {
    const response = await axiosInstance.post<any>("/buildings", buildFormData(payload), {
      headers: { "Content-Type": "multipart/form-data" },
    });
    
    // Nếu backend trả về trực tiếp danh sách (không bọc ApiResponse)
    const rawData = response.data;
    const isDirectList = rawData && Array.isArray(rawData.items);
    
    if (isDirectList) {
      return {
        data: normalizePagedResponse(rawData),
        message: "Building created successfully",
      };
    }

    // Nếu backend trả về bọc ApiResponse
    if (rawData && rawData.success === false) {
      throw new Error(rawData.message || "Failed to create building");
    }

    return {
      data: normalizePagedResponse(rawData.data || rawData),
      message: rawData.message || "Building created successfully",
    };
  },

  updateBuilding: async (id: number, payload: UpdateBuildingPayload): Promise<{ data: PagedResponse<BuildingDto>; message: string }> => {
    const formData = buildFormData(payload);
    formData.append("Id", id.toString());

    const response = await axiosInstance.put<any>(`/buildings/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    const rawData = response.data;
    const isDirectList = rawData && Array.isArray(rawData.items);

    if (isDirectList) {
      return {
        data: normalizePagedResponse(rawData),
        message: "Building updated successfully",
      };
    }

    if (rawData && rawData.success === false) {
      throw new Error(rawData.message || "Failed to update building");
    }

    return {
      data: normalizePagedResponse(rawData.data || rawData),
      message: rawData.message || "Building updated successfully",
    };
  },

  deleteBuilding: async (id: number): Promise<{ message: string }> => {
    const response = await axiosInstance.delete<any>(`/buildings/${id}`);
    
    const rawData = response.data;
    if (rawData && rawData.success === false) {
      throw new Error(rawData.message || "Failed to delete building");
    }
    
    return { message: rawData?.message || "Building deleted successfully" };
  },
};

import axiosInstance from './axios';

export interface BuildingResponse {
  id: number;
  campusId: number;
  buildingName: string;
  description: string;
  buildingImageUrl: string;
  campusName?: string;
}

export interface Room {
  id: number;
  name: string;
  building: string;
  capacity: number;
  status: 'Available' | 'Occupied' | 'Maintenance';
  image: string;
  features: string[];
  nextAvailable: string;
}

// Lấy chi tiết tòa nhà theo tên
export const getBuildingByName = async (buildingName: string): Promise<BuildingResponse> => {
  const response = await axiosInstance.get(`/buildings/${buildingName}`);
  return response.data;
};
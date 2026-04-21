export interface BuildingDto {
  id: number;
  campusId: number;
  buildingName: string;
  buildingImageUrl?: string;
  description: string;
  campusName: string;
  roomCount: number;
}

export interface GetBuildingsQuery {
  campusId?: number;
  searchTerm?: string;
  pageNumber?: number;
  pageSize?: number;
  buildingName?: string;
}

export interface Building {
  id: number;
  name: string;
  description: string;
  campusName?: string;
  roomCount: number;
  image: string;
  color?: string;
}

export interface BuildingResponse {
  id: number;
  campusId: number;
  buildingName: string;
  description: string;
  buildingImageUrl: string;
  campusName?: string;
  roomCount: number;
}

export interface GetBuildingsResponse {
  data: Building[];
  total: number;
}

export interface GetBuildingsRequest {
  page?: number;
  limit?: number;
}

export interface BuildingFormValues {
  campusId: number;
  buildingName: string;
  description: string;
  buildingImageUrl?: string;
}

export type CreateBuildingPayload = BuildingFormValues;

export type UpdateBuildingPayload = BuildingFormValues;


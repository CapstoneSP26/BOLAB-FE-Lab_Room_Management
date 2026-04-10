export interface BuildingDto {
  id: number;
  campusId: number;
  buildingName: string;
  buildingImageUrl?: string;
  description: string;
  campusName: string;
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
}

export interface GetBuildingsResponse {
  data: Building[];
  total: number;
}

export interface GetBuildingsRequest {
  page?: number;
  limit?: number;
}

export interface Building {
  id: string;
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

export type BuildingLookupApiResponse =
  | BuildingResponse[]
  | { data?: BuildingResponse[] };

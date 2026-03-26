export interface LabImageDto {
  id: string; // Guid
  url: string;
  isPrimary: boolean;
}

export interface LabRoomDto {
  id: number;
  roomName: string;
  roomNo: string;
  location?: string;
  capacity: number;
  hasEquipment: boolean;
  description?: string;
  buildingName: string;
  images?: LabImageDto[];
}

export interface GetLabRoomsQuery {
  buildingId?: number;
  roomNo?: string;
  searchTerm?: string;
  includeImages?: boolean;
  includeBuilding?: boolean;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  isDescending?: boolean;
}

export type RoomStatus = "Available" | "Occupied" | "Maintenance";

export interface GetRoomsRequest {
  building?: string;
  search?: string;
  status?: RoomStatus;
  page?: number;
  limit?: number;
}

export interface GetRoomsResponse {
  data: Room[];
  total: number;
  page: number;
  limit: number;
}

export interface Stats {
  totalRooms: number;
  activeRooms: number;
  maintenanceRooms: number;
}

export interface GetStatsResponse {
  data: Stats;
}

////////////////////////////////////////
export interface LabRoom {
  id: string;
  name: string;
  building: string;
  capacity: number;
  features: string[];
  image?: string;
}

export interface GetLabRoomsRequest {
  buildingId?: string;
  minCapacity?: number;
  features?: string[];
}

export interface GetLabRoomsResponse {
  rooms: LabRoom[];
  total: number;
}

//////////

export interface LabRoomLookupResponse {
  id: number | string;
  name?: string;
  labRoomName?: string;
  building?: string;
  buildingName?: string;
  capacity?: number;
  status?: "Available" | "Occupied" | "Maintenance";
  image?: string;
  features?: string[];
  nextAvailable?: string;
}

export type LabRoomLookupApiResponse =
  | LabRoomLookupResponse[]
  | { data?: LabRoomLookupResponse[] };

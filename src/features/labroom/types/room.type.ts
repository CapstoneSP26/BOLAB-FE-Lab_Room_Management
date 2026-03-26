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
  buildingId: number;
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

export interface Stats {
  totalRooms: number;
  activeRooms: number;
  maintenanceRooms: number;
}

export interface GetStatsResponse {
  data: Stats;
}

export interface LabRoomLookupItem {
  id: number;
  roomName: string;
  roomNo: string;
  buildingId: number;
  buildingName: string;
}

export type LabRoomLookupApiResponse =
  | LabRoomLookupItem[]
  | { data?: LabRoomLookupItem[] };

export interface GetLabRoomsResponse {
  data: LabRoomDto[];
  total: number;
  pageNumber?: number;
  pageSize?: number;
}

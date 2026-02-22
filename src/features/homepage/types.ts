// ===== DOMAIN MODELS =====

export interface Room {
  id: string | number;
  name: string;
  building: string;
  capacity: number;
  status: RoomStatus;
  image: string;
  nextAvailable?: string;
  features?: string[];
}

export type RoomStatus = 'Available' | 'Occupied' | 'Maintenance';

export interface Building {
  id: string;
  name: string;
  description: string;
  roomCount: number;
  image: string;
  color?: string;
}

export interface Stats {
  totalRooms: number;
  activeRooms: number;
  maintenanceRooms: number;
}

// ===== API REQUEST TYPES =====

export interface GetRoomsRequest {
  building?: string;
  search?: string;
  status?: RoomStatus;
  page?: number;
  limit?: number;
}

export interface GetBuildingsRequest {
  page?: number;
  limit?: number;
}

// ===== API RESPONSE TYPES =====

export interface GetRoomsResponse {
  data: Room[];
  total: number;
  page: number;
  limit: number;
}

export interface GetBuildingsResponse {
  data: Building[];
  total: number;
}

export interface GetStatsResponse {
  data: Stats;
}

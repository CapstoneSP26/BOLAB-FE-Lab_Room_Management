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
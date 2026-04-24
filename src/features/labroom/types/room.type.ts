export interface LabImageDto {
  id: string; // Guid
  url: string;
  isPrimary: boolean;
}

export interface ResultMessage<T> {
  success: boolean;
  message: string;
  data?: T;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
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
  LabOwnerId?: string;
  LabOwnerName?: string;
  images?: LabImageDto[];
  isActive: boolean;
  isDeleted?: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
}

/** Query params for GET /LabRoom (same style as booking `GetBookingsParams`). */
export interface GetLabRoomsQuery {
  buildingId?: number;
  roomNo?: string;
  searchTerm?: string;
  includeImages?: boolean;
  includeBuilding?: boolean;
  isActive?: boolean;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  isDescending?: boolean;
}

export type LabRoomStatusFilter = "ALL" | "ACTIVE" | "DEACTIVATED";

export interface LabRoomFormValues {
  roomName: string;
  roomNo: string;
  location: string;
  capacity: number;
  hasEquipment: boolean;
  description: string;
  buildingId: number | "";
  LabOwnerId?: string;
  isActive: boolean;
}

export interface LabRoomMutationPayload {
  roomName: string;
  roomNo: string;
  location?: string;
  capacity: number;
  hasEquipment: boolean;
  description?: string;
  buildingId: number;
  LabOwnerId?: string;
  isActive?: boolean;
}

export type CreateLabRoomRequest = LabRoomMutationPayload;
export type UpdateLabRoomRequest = LabRoomMutationPayload;

export type RoomStatus = "Available" | "Occupied" | "Maintenance";

export interface Stats {
  totalRooms: number;
  activeRooms: number;
  maintenanceRooms: number;
}

export interface GetStatsResponse {
  data: Stats;
}

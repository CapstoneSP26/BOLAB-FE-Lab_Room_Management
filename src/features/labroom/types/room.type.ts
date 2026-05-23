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

export interface LabOwnerDto {
  id: string;
  email: string;
  fullName: string;
  userCode: string;
  avatarUrl?: string | null;
  campusId?: number;
  isActive?: boolean | null;
  roleIds?: string[];
  roles?: string[];
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
  labOwnerId?: string | null;
  labOwner: LabOwnerDto;
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
  labOwnerId?: string;
  labOwner?: LabOwnerDto | null;
  isActive: boolean;
  Images?: File | null;
  IsImageUpdate?: boolean;
}

export interface LabRoomMutationPayload {
  roomName: string;
  roomNo: string;
  location?: string;
  capacity: number;
  hasEquipment: boolean;
  description?: string;
  buildingId: number;
  labOwnerId?: string;
  isActive?: boolean;
  Images?: File | null;
  IsImageUpdate?: boolean;
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

import axiosInstance from "../../../api/axios";
import type {
  GetBookingRequestsRequest,
  GetBookingRequestsResponse,
  GetBookingHistoryRequest,
  GetBookingHistoryResponse,
  GetBookingByIdResponse,
  GetBookingByScheduleIdResponse,
  UpdateBookingStatusRequest,
  UpdateBookingStatusResponse,
  GetBookingStatusLookupResponse,
} from "../types/schedule.type";
import type {
  Building,
  BuildingLookupApiResponse,
} from "../../building/types/building.type";
import type {
  Room,
  LabRoomLookupApiResponse,
} from "../../room/types/room.type";
import type {
  GetSlotTypesRequest,
  GetSlotTypesResponse,
} from "../../slot/types/slot.types";

const BOOKING_REQUEST_API = {
  LIST: "/bookings",
  HISTORY: "/booking-requests/history",
  BY_ID: (id: string) => `/booking-requests/${id}`,
  BY_SCHEDULE: (scheduleId: string) =>
    `/booking-requests/by-schedule/${scheduleId}`,
  UPDATE_STATUS: (id: string) => `/booking-requests/${id}/status`,
};

const BOOKING_LOOKUP_API = {
  BUILDINGS: "/buildings",
  LAB_ROOMS: "/lab-rooms",
  SLOT_TYPES: "/slot-types",
};

/** Pending booking requests */
export const getBookingRequests = async (
  params: GetBookingRequestsRequest = {},
): Promise<GetBookingRequestsResponse> => {
  const response = await axiosInstance.get<GetBookingRequestsResponse>(
    `${BOOKING_REQUEST_API.LIST}/get-unchecked-booking-request`,
    { params },
  );
  return response.data;
};

/** History */
export const getBookingRequestHistory = async (
  params: GetBookingHistoryRequest = {},
): Promise<GetBookingHistoryResponse> => {
  const response = await axiosInstance.get<GetBookingHistoryResponse>(
    `${BOOKING_REQUEST_API.HISTORY}/get-unchecked-booking-request`,
    { params },
  );
  return response.data;
};

/** Get by booking id */
export const getBookingRequestById = async (
  id: string,
): Promise<GetBookingByIdResponse> => {
  const response = await axiosInstance.get<GetBookingByIdResponse>(
    BOOKING_REQUEST_API.BY_ID(id),
  );
  return response.data;
};

/** Get booking by scheduleId */
export const getBookingRequestByScheduleId = async (
  scheduleId: string,
): Promise<GetBookingByScheduleIdResponse> => {
  const response = await axiosInstance.get<GetBookingByScheduleIdResponse>(
    BOOKING_REQUEST_API.BY_SCHEDULE(scheduleId),
  );
  return response.data;
};

/** Update status */
export const updateBookingRequestStatus = async (
  id: string,
  body: UpdateBookingStatusRequest,
): Promise<UpdateBookingStatusResponse> => {
  const response = await axiosInstance.patch<UpdateBookingStatusResponse>(
    BOOKING_REQUEST_API.UPDATE_STATUS(id),
    body,
  );
  return response.data;
};

/** Lookup: buildings */
export const getBuildingOptions = async (): Promise<Building[]> => {
  const response = await axiosInstance.get<BuildingLookupApiResponse>(
    BOOKING_LOOKUP_API.BUILDINGS,
  );

  const raw = response.data;
  const items = Array.isArray(raw) ? raw : (raw.data ?? []);

  return items.map((item) => ({
    id: String(item.id),
    name: item.buildingName,
    description: item.description ?? "",
    roomCount: 0,
    image: item.buildingImageUrl ?? "",
    color: undefined,
  }));
};

/** Lookup: rooms */
export const getRoomOptions = async (): Promise<Room[]> => {
  const response = await axiosInstance.get<LabRoomLookupApiResponse>(
    BOOKING_LOOKUP_API.LAB_ROOMS,
  );

  const raw = response.data;
  const items = Array.isArray(raw) ? raw : (raw.data ?? []);

  return items.map((item) => ({
    id: Number(item.id),
    name: item.name ?? item.labRoomName ?? "",
    building: item.building ?? item.buildingName ?? "",
    capacity: item.capacity ?? 0,
    status: item.status ?? "Available",
    image: item.image ?? "",
    features: item.features ?? [],
    nextAvailable: item.nextAvailable ?? "",
  }));
};

/** Lookup: slot types */
export const getSlotTypes = async (
  params: GetSlotTypesRequest = {},
): Promise<GetSlotTypesResponse> => {
  const response = await axiosInstance.get<GetSlotTypesResponse>(
    BOOKING_LOOKUP_API.SLOT_TYPES,
    { params },
  );
  return response.data;
};

export const getBookingStatusLookup = async () => {
  const response = await axiosInstance.get<GetBookingStatusLookupResponse>(
    "/booking-requests/status",
  );
  return response.data;
};

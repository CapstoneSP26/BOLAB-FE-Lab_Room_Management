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
import type { Building } from "../../building/types/building.type";
import { buildingApi } from "../../building/api/buildingApi";
import type {
  LabRoomDto,
  LabRoomLookupItem,
} from "../../labroom/types/room.type";
import { labroomApi } from "../../labroom/api/labroom.api";
import type {
  GetSlotTypesRequest,
  GetSlotTypesResponse,
  SlotType,
} from "../../slot/types/slot.types";
import { slotApi } from "../../slot/api/slotApi";

const BOOKING_REQUEST_API = {
  LIST: "/bookings/get-unchecked-booking-request",
  HISTORY: "/booking-requests/history",
  BY_ID: (id: string) => `/booking-requests/${id}`,
  BY_SCHEDULE: (scheduleId: string) =>
    `/booking-requests/by-schedule/${scheduleId}`,
  UPDATE_STATUS: (id: string) => `/booking-requests/${id}/status`,
  STATUS_LOOKUP: "/booking-requests/status",
};

/** Pending booking requests
 * Có thể lọc theo room bằng params.labRoomId
 */
export const getBookingRequests = async (
  params: GetBookingRequestsRequest = {},
): Promise<GetBookingRequestsResponse> => {
  const response = await axiosInstance.get<GetBookingRequestsResponse>(
    BOOKING_REQUEST_API.LIST,
    { params },
  );
  return response.data;
};

/** Booking history
 * Có thể lọc theo room bằng params.labRoomId
 */
export const getBookingRequestHistory = async (
  params: GetBookingHistoryRequest = {},
): Promise<GetBookingHistoryResponse> => {
  const response = await axiosInstance.get<GetBookingHistoryResponse>(
    BOOKING_REQUEST_API.HISTORY,
    { params },
  );
  return response.data;
};

/** Get booking by booking id */
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

/** Update booking status */
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

/** Lookup: buildings
 * Dùng buildingApi để đổ dropdown building
 */
export const getBuildingOptions = async (): Promise<Building[]> => {
  const items = await buildingApi.getBuildings({
    pageNumber: 1,
    pageSize: 1000,
  });

  return items.map((item) => ({
    id: String(item.id),
    name: item.buildingName,
    description: item.description ?? "",
    roomCount: 0,
    image: item.buildingImageUrl ?? "",
    color: undefined,
  }));
};

/** Lookup: rooms for booking filter
 * Dùng labroomApi để đổ dropdown room
 */
export const getRoomOptions = async (
  buildingId?: string | number,
): Promise<LabRoomLookupItem[]> => {
  const response = await labroomApi.getRooms({
    pageNumber: 1,
    pageSize: 1000,
    includeBuilding: true,
    isDescending: false,
    buildingId: buildingId ? Number(buildingId) : undefined,
  });

  const items: LabRoomDto[] = response.items ?? [];

  return items.map((item: LabRoomDto) => ({
    id: item.id,
    roomName: item.roomName,
    roomNo: item.roomNo,
    buildingId: item.buildingId,
    buildingName: item.buildingName,
  }));
};

/** Lookup: slot types
 * Dùng slotApi để đổ dropdown slot type
 */
export const getSlotTypes = async (
  params: GetSlotTypesRequest = {},
): Promise<GetSlotTypesResponse> => {
  const items: SlotType[] = await slotApi.getSlotTypes(params);

  return {
    data: items,
    total: items.length,
    page: 1,
    limit: items.length,
  };
};

/** Lookup: booking statuses */
export const getBookingStatusLookup =
  async (): Promise<GetBookingStatusLookupResponse> => {
    const response = await axiosInstance.get<GetBookingStatusLookupResponse>(
      BOOKING_REQUEST_API.STATUS_LOOKUP,
    );
    return response.data;
  };

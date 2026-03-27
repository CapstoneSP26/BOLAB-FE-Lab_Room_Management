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
} from "../type";
import type {
  Building,
  Room,
  BuildingResponse,
} from "../../building/types/building.type";

type BuildingLookupApiResponse =
  | BuildingResponse[]
  | { data?: BuildingResponse[] };

interface LabRoomLookupResponse {
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

type LabRoomLookupApiResponse =
  | LabRoomLookupResponse[]
  | { data?: LabRoomLookupResponse[] };

type RawHistoryItem = Record<string, unknown>;

const toIsoFromDateAndTime = (date?: string, time?: string): string => {
  if (!date) return "";
  if (!time) return `${date}T00:00:00`;
  return `${date}T${time}:00`;
};

const normalizeHistoryItem = (raw: RawHistoryItem) => {
  const date = String(raw.date ?? raw.Date ?? "");
  const startTimePart = String(raw.startTime ?? raw.StartTime ?? "");
  const endTimePart = String(raw.endTime ?? raw.EndTime ?? "");

  return {
    Id: String(raw.Id ?? raw.id ?? ""),
    LabRoomId: Number(raw.LabRoomId ?? raw.labRoomId ?? raw.roomId ?? 0),
    roomName: String(raw.roomName ?? raw.RoomName ?? ""),
    BuildingName: String(raw.BuildingName ?? raw.buildingName ?? ""),
    buildingName: String(raw.BuildingName ?? raw.buildingName ?? ""),
    BookedByUserId: String(
      raw.BookedByUserId ?? raw.bookedByUserId ?? raw.userName ?? "",
    ),
    StartTime: toIsoFromDateAndTime(date, startTimePart),
    EndTime: toIsoFromDateAndTime(date, endTimePart),
    StudentCount: Number(raw.StudentCount ?? raw.studentCount ?? 0),
    PurposeTypeName: String(
      raw.PurposeTypeName ?? raw.purposeTypeName ?? raw.purpose ?? "",
    ),
    Reason: String(raw.Reason ?? raw.reason ?? ""),
    BookingStatus: String(
      raw.BookingStatus ?? raw.bookingStatus ?? raw.status ?? "",
    ),
    BookingType:
      (raw.BookingType as string | null | undefined) ??
      (raw.bookingType as string | null | undefined) ??
      null,
    SlotTypeId: Number(raw.SlotTypeId ?? raw.slotTypeId ?? 0) || undefined,
    SlotTypeCode: (raw.SlotTypeCode ?? raw.slotTypeCode) as
      | "OLD_SLOT"
      | "NEW_SLOT"
      | "OUT_SLOT"
      | undefined,
    SlotTypeName: String(raw.SlotTypeName ?? raw.slotTypeName ?? "") || undefined,
    CreatedAt: String(raw.CreatedAt ?? raw.createdAt ?? ""),
    UpdatedAt: String(raw.UpdatedAt ?? raw.updatedAt ?? ""),
    CreatedBy: String(raw.CreatedBy ?? raw.createdBy ?? ""),
    UpdatedBy: String(raw.UpdatedBy ?? raw.updatedBy ?? ""),
    Recur: Number(raw.Recur ?? raw.recur ?? 0),
  };
};

/**
 * ===== DATA ACCESS LAYER =====
 * Rules:
 * - Chỉ dùng axiosInstance
 * - Phải định nghĩa TypeScript Interface cho cả Request và Response
 * - Không được catch error (để UI hoặc React Query xử lý)
 */

const BOOKING_REQUEST_API = {
  LIST: "/bookings",
  HISTORY: "/bookings/history",
  APPROVE: (id: string) => `/bookings/${id}/approve`,
  REJECT: (id: string) => `/bookings/${id}/reject`,
};

const BOOKING_LOOKUP_API = {
  BUILDINGS: "/buildings",
  // BE route hiện tại: /api/LabRoom (controller: LabRoomController)
  LAB_ROOMS: "/LabRoom",
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
  const response = await axiosInstance.get<Record<string, unknown>>(
    BOOKING_REQUEST_API.HISTORY,
    { params },
  );

  const raw = response.data;
  const list = Array.isArray(raw?.data) ? (raw.data as RawHistoryItem[]) : [];

  return {
    data: list.map(normalizeHistoryItem),
    total: Number(raw?.total ?? list.length),
    page: Number(raw?.page ?? params.page ?? 1),
    limit: Number(raw?.limit ?? params.limit ?? 10),
  };
};

/**
 * Not supported by current BE contract (/api/bookings).
 * Keep explicit error to avoid silent wrong endpoint calls.
 */
export const getBookingRequestById = async (
  _id: string,
): Promise<GetBookingByIdResponse> => {
  throw new Error("BE does not support GET /bookings/{id} for booking request");
};

/**
 * Not supported by current BE contract (/api/bookings).
 * Keep explicit error to avoid silent wrong endpoint calls.
 */
export const getBookingRequestByScheduleId = async (
  _scheduleId: string,
): Promise<GetBookingByScheduleIdResponse> => {
  throw new Error(
    "BE does not support GET /bookings/by-schedule/{scheduleId} for booking request",
  );
};

/**
 * Map FE status action -> current BE endpoints:
 * - APPROVED => PUT /bookings/{id}/approve with body { bookingId }
 * - REJECTED => PUT /bookings/{id}/reject with body { bookingId, reason }
 */
export const updateBookingRequestStatus = async (
  id: string,
  body: UpdateBookingStatusRequest,
): Promise<UpdateBookingStatusResponse> => {
  if (body.status === "APPROVED") {
    const response = await axiosInstance.put(BOOKING_REQUEST_API.APPROVE(id), {
      bookingId: id,
    });

    return response.data as UpdateBookingStatusResponse;
  }

  const response = await axiosInstance.put(BOOKING_REQUEST_API.REJECT(id), {
    bookingId: id,
    reason: "Rejected by lab manager",
  });

  return response.data as UpdateBookingStatusResponse;
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
  const response = await axiosInstance.get<
    | LabRoomLookupApiResponse
    | {
        items?: LabRoomLookupResponse[];
        Items?: LabRoomLookupResponse[];
        data?: LabRoomLookupResponse[];
      }
  >(BOOKING_LOOKUP_API.LAB_ROOMS);

  const raw = response.data as Record<string, unknown>;

  const items = Array.isArray(raw)
    ? (raw as LabRoomLookupResponse[])
    : Array.isArray(raw.items)
      ? (raw.items as LabRoomLookupResponse[])
      : Array.isArray(raw.Items)
        ? (raw.Items as LabRoomLookupResponse[])
        : Array.isArray(raw.data)
          ? (raw.data as LabRoomLookupResponse[])
          : [];

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

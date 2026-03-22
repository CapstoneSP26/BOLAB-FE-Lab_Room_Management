export interface BookingDto {
  id: string;
  labRoomId: number;
  labRoomName: string;

  createdBy: string;
  userFullName: string;
  userEmail: string;

  startTime: string;
  endTime: string;
  studentCount: number;
  reason?: string;

  status: string;
  createdAt: string;

  isOverdue: boolean;
  canApprove: boolean;
  canReject: boolean;
}

export interface GetBookingsParams {
  searchTerm?: string;
  status?: string;
  labRoomId?: number;
  fromDate?: string;
  toDate?: string;
  requestedBy?: string;

  pageNumber?: number;
  pageSize?: number;

  sortBy?: string;
  isDescending?: boolean;
}
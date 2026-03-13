export type ActivityType =
  | "BOOKING_CREATED"
  | "BOOKING_APPROVED"
  | "BOOKING_REJECTED"
  | "SCHEDULE_CREATED"
  | "SCHEDULE_UPDATED"
  | "SCHEDULE_DELETED";

export type ActivityDetails = {
  startTime?: string;
  endTime?: string;
  previousStatus?: string;
  newStatus?: string;
  reason?: string;
};

export type Activity = {
  id: string;
  type: ActivityType;

  roomId: number;
  roomName: string;
  buildingName: string;

  userName: string;
  userRole: string;

  timestamp: string;
  description: string;
  details?: ActivityDetails;
};

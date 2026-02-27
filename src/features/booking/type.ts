export type UserRole = "ADMIN" | "LECTURER";

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type Room = {
  id: number;
  name: string;
  capacity: number;
  building: string;
};

export type TimeSlot = {
  id: string;
  startTime: string;
  endTime: string;
  date: string;
  available: boolean;
};

export type StudentGroup = {
  id: string;
  name: string;
  count: number;
};

export type StepId = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type BookingDraft = {
  user: User | null;
  room: Room | null;
  period: { startDate: string; endDate: string };
  slots: TimeSlot[];
  recurring: { enabled: boolean; weeks: number };
  group: StudentGroup | null;
};

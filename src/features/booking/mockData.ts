import type { Room, StudentGroup, TimeSlot, User } from "./type";

export const users: User[] = [
  {
    id: "lecturer",
    name: "lecturer",
    email: "you@example.com",
    role: "LECTURER",
  },
  {
    id: "1",
    name: "Dr. John Smith",
    email: "john.smith@example.com",
    role: "LECTURER",
  },
  {
    id: "2",
    name: "Prof. Sarah Johnson",
    email: "sarah.j@example.com",
    role: "LECTURER",
  },
  {
    id: "3",
    name: "Dr. Michael Brown",
    email: "m.brown@example.com",
    role: "LECTURER",
  },
];

export const rooms: Room[] = [
  { id: 101, name: "Room 101", capacity: 30, building: "Building A" },
  { id: 102, name: "Room 102", capacity: 50, building: "Building A" },
  { id: 201, name: "Room 201", capacity: 40, building: "Building B" },
  { id: 202, name: "Room 202", capacity: 60, building: "Building B" },
];

export const availableSlots: TimeSlot[] = [
  {
    id: "1",
    date: "2024-02-20",
    startTime: "08:00",
    endTime: "10:00",
    available: true,
  },
  {
    id: "2",
    date: "2024-02-20",
    startTime: "10:00",
    endTime: "12:00",
    available: true,
  },
  {
    id: "3",
    date: "2024-02-20",
    startTime: "13:00",
    endTime: "15:00",
    available: false,
  },
  {
    id: "4",
    date: "2024-02-20",
    startTime: "15:00",
    endTime: "17:00",
    available: true,
  },
];

export const studentGroups: StudentGroup[] = [
  { id: "1", name: "CS101 - Section A", count: 25 },
  { id: "2", name: "CS101 - Section B", count: 28 },
  { id: "3", name: "CS201 - Advanced Programming", count: 30 },
  { id: "4", name: "CS301 - Database Systems", count: 22 },
];

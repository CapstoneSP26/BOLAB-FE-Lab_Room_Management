import type { StudentGroupInBooking } from '../../groups/types/group.type';
import type { TimeSlot } from '../../slot/types/slot.types';

interface RoomCatalogItem {
  id: string;
  name: string;
  buildingCode: 'Alpha' | 'Beta' | 'Gamma' | 'Delta';
  buildingName: string;
  buildingId: string;
  capacity: number;
  status: 'Available' | 'Occupied' | 'Maintenance';
  image: string;
  images: string[];
  features: string[];
  nextAvailable: string;
}

const ROOM_CATALOG: RoomCatalogItem[] = [
  {
    id: '1',
    name: 'Quantum Lab A',
    buildingCode: 'Alpha',
    buildingName: 'Alpha Building',
    buildingId: 'alpha',
    capacity: 12,
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200',
    images: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&q=80&w=900',
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80&w=900',
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=900',
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=900',
    ],
    features: ['wifi', 'screen'],
    nextAvailable: '14:00 PM',
  },
  {
    id: '2',
    name: 'AI Innovation Hub',
    buildingCode: 'Alpha',
    buildingName: 'Alpha Building',
    buildingId: 'alpha',
    capacity: 25,
    status: 'Occupied',
    image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=1200',
    images: [
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80&w=900',
      'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=900',
      'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&q=80&w=900',
    ],
    features: ['wifi', 'screen'],
    nextAvailable: '16:00 PM',
  },
  {
    id: '3',
    name: 'Robotics Center',
    buildingCode: 'Gamma',
    buildingName: 'Gamma Building',
    buildingId: 'gamma',
    capacity: 30,
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&q=80&w=1200',
    images: [
      'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=900',
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80&w=900',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=900',
    ],
    features: ['wifi', 'screen'],
    nextAvailable: '13:00 PM',
  },
  {
    id: '4',
    name: 'Digital Arts Studio',
    buildingCode: 'Gamma',
    buildingName: 'Gamma Building',
    buildingId: 'gamma',
    capacity: 15,
    status: 'Maintenance',
    image: 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=1200',
    images: [
      'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&q=80&w=900',
      'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=900',
    ],
    features: ['wifi'],
    nextAvailable: 'Tomorrow',
  },
  {
    id: '11',
    name: 'Blockchain Lab',
    buildingCode: 'Delta',
    buildingName: 'Delta Building',
    buildingId: 'delta',
    capacity: 20,
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=1200',
    images: [
      'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=900',
      'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&q=80&w=900',
    ],
    features: ['wifi', 'screen'],
    nextAvailable: 'Now',
  },
  {
    id: '12',
    name: 'Quantum Computing',
    buildingCode: 'Delta',
    buildingName: 'Delta Building',
    buildingId: 'delta',
    capacity: 8,
    status: 'Occupied',
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=1200',
    images: [
      'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=900',
      'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&q=80&w=900',
    ],
    features: ['wifi', 'screen'],
    nextAvailable: '18:00 PM',
  },
];

const MOCK_DATE_BASE = new Date();

const toISODate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const addDays = (days: number): string => {
  const date = new Date(MOCK_DATE_BASE);
  date.setDate(date.getDate() + days);
  return toISODate(date);
};

export const MOCK_BOOKING_BUILDINGS = [
  { id: 'alpha', name: 'Alpha Building' },
  { id: 'gamma', name: 'Gamma Building' },
  { id: 'delta', name: 'Delta Building' },
] as const;

export const MOCK_BOOKING_ROOMS = ROOM_CATALOG.map((room) => ({
  id: room.id,
  name: room.name,
  building: room.buildingName,
  buildingId: room.buildingId,
  capacity: room.capacity,
  features: room.features,
  image: room.image,
}));

export const MOCK_BUILDING_DETAIL_BUILDINGS = [
  {
    id: 'Alpha',
    name: 'Building Alpha',
    description: 'Engineering & High-Tech Labs',
    image: 'https://daihoc.fpt.edu.vn/wp-content/uploads/2021/05/20210512_giaiwa1.jpeg',
  },
  {
    id: 'Gamma',
    name: 'Building Gamma',
    description: 'Multipurpose Area & Content Creation',
    image: 'https://vinaconex25.com.vn/wp-content/uploads/2020/06/2.jpg',
  },
  {
    id: 'Delta',
    name: 'Building Delta',
    description: 'Research & Innovation Center',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1200',
  },
] as const;

export const MOCK_BUILDING_DETAIL_ROOMS = ROOM_CATALOG.map((room) => ({
  id: Number(room.id),
  name: room.name,
  building: room.buildingCode,
  capacity: room.capacity,
  status: room.status,
  image: room.image,
  images: room.images,
  features: room.features,
  nextAvailable: room.nextAvailable,
}));

export const MOCK_STUDENT_GROUPS: StudentGroupInBooking[] = [
  {
    id: 'g1',
    name: 'SE1801',
    courseCode: 'PRN231',
    studentCount: 36,
  },
  {
    id: 'g2',
    name: 'SE1802',
    courseCode: 'SWP391',
    studentCount: 30,
  },
  {
    id: 'g3',
    name: 'SE1803',
    courseCode: 'MAD101',
    studentCount: 28,
  },
];

export const MOCK_TIME_SLOTS: TimeSlot[] = [
  {
    id: 'slot-r1-d0-1',
    roomId: '1',
    date: addDays(0),
    startTime: '08:00',
    endTime: '10:00',
    status: 'Booked',
    userName: 'Nguyen Van A',
    bookedBy: 'Nguyen Van A',
    groupName: 'SE1801',
    lecturerName: 'Nguyen Van A',
    scheduleType: 'Teaching Session',
    studentCount: 32,
    bookingSource: 'LECTURER_BOOK',
  },
  {
    id: 'slot-r1-d0-2',
    roomId: '1',
    date: addDays(0),
    startTime: '10:30',
    endTime: '12:00',
    status: 'Available',
  },
  {
    id: 'slot-r1-d1-1',
    roomId: '1',
    date: addDays(1),
    startTime: '13:00',
    endTime: '15:00',
    status: 'Pending',
    bookedBy: 'Academic Office',
    groupName: 'SE1803',
    lecturerName: 'Academic Office',
    scheduleType: 'AO Reservation',
    studentCount: 40,
    bookingSource: 'AO_BOOK',
  },
  {
    id: 'slot-r1-d2-1',
    roomId: '1',
    date: addDays(2),
    startTime: '08:00',
    endTime: '09:30',
    status: 'Available',
  },
  {
    id: 'slot-r2-d0-1',
    roomId: '2',
    date: addDays(0),
    startTime: '09:00',
    endTime: '11:00',
    status: 'Booked',
    bookedBy: 'Tran Thi B',
    groupName: 'SE1802',
    lecturerName: 'Tran Thi B',
    scheduleType: 'Lab Session',
    studentCount: 30,
    bookingSource: 'LECTURER_BOOK',
  },
  {
    id: 'slot-r2-d1-1',
    roomId: '2',
    date: addDays(1),
    startTime: '14:00',
    endTime: '16:30',
    status: 'Maintenance',
  },
  {
    id: 'slot-r2-d3-1',
    roomId: '2',
    date: addDays(3),
    startTime: '10:00',
    endTime: '12:00',
    status: 'Available',
  },
  {
    id: 'slot-r3-d0-1',
    roomId: '3',
    date: addDays(0),
    startTime: '07:30',
    endTime: '09:30',
    status: 'Available',
  },
  {
    id: 'slot-r3-d2-1',
    roomId: '3',
    date: addDays(2),
    startTime: '15:00',
    endTime: '17:00',
    status: 'Booked',
    bookedBy: 'Le Van C',
    groupName: 'SE1803',
    lecturerName: 'Le Van C',
    scheduleType: 'Practice Session',
    studentCount: 24,
    bookingSource: 'LECTURER_BOOK',
  },
  {
    id: 'slot-r4-d1-1',
    roomId: '4',
    date: addDays(1),
    startTime: '08:00',
    endTime: '17:00',
    status: 'Maintenance',
  },
  {
    id: 'slot-r11-d0-1',
    roomId: '11',
    date: addDays(0),
    startTime: '13:30',
    endTime: '16:00',
    status: 'Available',
  },
  {
    id: 'slot-r11-d2-1',
    roomId: '11',
    date: addDays(2),
    startTime: '09:00',
    endTime: '11:30',
    status: 'Booked',
    bookedBy: 'Pham Thi D',
    groupName: 'SE1801',
    lecturerName: 'Pham Thi D',
    scheduleType: 'Research Session',
    studentCount: 18,
    bookingSource: 'LECTURER_BOOK',
  },
  {
    id: 'slot-r12-d1-1',
    roomId: '12',
    date: addDays(1),
    startTime: '08:30',
    endTime: '10:30',
    status: 'Booked',
    bookedBy: 'Do Minh E',
    groupName: 'SE1802',
    lecturerName: 'Do Minh E',
    scheduleType: 'Seminar',
    studentCount: 20,
    bookingSource: 'LECTURER_BOOK',
  },
  {
    id: 'slot-r12-d4-1',
    roomId: '12',
    date: addDays(4),
    startTime: '14:00',
    endTime: '16:00',
    status: 'Available',
  },
];

export const getMockRoomById = (roomId: string) => {
  return ROOM_CATALOG.find((room) => room.id === roomId) ?? null;
};

export const getMockSlotsByRoomAndRange = (
  roomId: string,
  startDate: string,
  endDate: string
): TimeSlot[] => {
  return MOCK_TIME_SLOTS
    .filter((slot) => slot.roomId === roomId && slot.date >= startDate && slot.date <= endDate)
    .sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`));
};

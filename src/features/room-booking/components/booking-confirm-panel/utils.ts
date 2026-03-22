import type { StudentGroup } from '../../types';
import type { BookingStudent } from './types';

const FIRST_NAMES = ['An', 'Bao', 'Chi', 'Duc', 'Giang', 'Huy', 'Khanh', 'Linh', 'Minh', 'Phuong'];
const LAST_NAMES = ['Nguyen', 'Tran', 'Le', 'Pham', 'Hoang', 'Vo', 'Dang', 'Do'];

export const buildStudentsForGroup = (group: StudentGroup): BookingStudent[] => {
  const count = Math.max(Math.min(group.studentCount, 8), 3);
  const seed = Number.parseInt(group.id.replace(/\D/g, ''), 10) || group.name.length;

  return Array.from({ length: count }).map((_, index) => {
    const fullName = `${LAST_NAMES[(seed + index * 2) % LAST_NAMES.length]} ${FIRST_NAMES[(seed + index) % FIRST_NAMES.length]}`;
    const studentCode = `HE${group.id.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3)}${String(index + 1).padStart(3, '0')}`;
    const avatarSeed = ((seed + index * 11) % 70) + 1;

    return {
      studentId: `${group.id}-${index + 1}`,
      studentCode,
      fullName,
      avatarUrl: `https://i.pravatar.cc/80?img=${avatarSeed}`,
    };
  });
};

export const getInitials = (fullName: string): string => {
  return fullName
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((word) => word[0]?.toUpperCase() || '')
    .join('');
};

export interface BookingStudent {
  studentId: string;
  studentCode: string;
  fullName: string;
  avatarUrl?: string;
}

export interface SelectedGroupBucket {
  id: string;
  name: string;
  courseCode: string;
  isCustom: boolean;
  students: BookingStudent[];
}

export type ManualStudentDraft = {
  fullName: string;
  studentCode: string;
};

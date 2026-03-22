export interface ScheduleDto {
  id: string;
  subjectCode: string;
  lecturerName: string;
  labRoomName: string;
  slotName: string;
  groupName?: string;
  startTime: string;
  endTime: string;

  studentCount: number;
  status: string;
  type: string;
}

export interface GetSchedulesParams {
  searchTerm?: string;
  status?: string;
  labRoomId?: number;
  lecturerId?: string;
  subjectCode?: string;
  fromDate?: string;
  toDate?: string;

  pageNumber?: number;
  pageSize?: number;

  sortBy?: string;
  isDescending?: boolean;
}
// ===== DOMAIN MODELS =====

export interface StudentGroup {
  id: string;
  name: string;
  studentCount: number;
  previewStudents?: StudentInGroup[];
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentInGroup {
  studentId: string;
  studentCode: string;
  fullName: string;
  email?: string;
  avatarUrl?: string;
}

// ===== API REQUEST/RESPONSE TYPES =====

export interface GetStudentGroupsRequest {
  lecturerId?: string;
  searchQuery?: string;
  sortBy?: 'name' | 'count';
  sortOrder?: 'asc' | 'desc';
}

export interface GetStudentGroupsResponse {
  groups: StudentGroup[];
  total: number;
}

export interface CreateStudentGroupRequest {
  name: string;
}

export interface CreateStudentGroupResponse {
  success: boolean;
  group: StudentGroup;
  message: string;
}

export interface UpdateStudentGroupRequest {
  id: string;
  name: string;
}

export interface UpdateStudentGroupResponse {
  success: boolean;
  group: StudentGroup;
  message: string;
}

export interface DeleteStudentGroupRequest {
  id: string;
}

export interface DeleteStudentGroupResponse {
  success: boolean;
  message: string;
}

export interface GetGroupStudentsRequest {
  groupId: string;
}

export interface GetGroupStudentsResponse {
  students: StudentInGroup[];
  total: number;
}

export interface AddStudentToGroupRequest {
  groupId: string;
  studentId: string;
}

export interface AddStudentToGroupResponse {
  success: boolean;
  message: string;
}

export interface RemoveStudentFromGroupRequest {
  groupId: string;
  studentId: string;
}

export interface RemoveStudentFromGroupResponse {
  success: boolean;
  message: string;
}

// ===== FILTER & SEARCH STATE =====

export interface GroupFilterState {
  searchQuery: string;
  sortBy: 'name' | 'count';
  sortOrder: 'asc' | 'desc';
}

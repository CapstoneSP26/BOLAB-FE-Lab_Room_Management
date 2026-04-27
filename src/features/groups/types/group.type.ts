/**
 * ===== DOMAIN MODELS (from Backend Entities) =====
 * These types are aligned with the backend C# entities
 */

/** Group DTO from backend */
export interface GroupDto {
  id: string; // GUID
  groupName: string;
  ownerId: string; // GUID - Lecturer ID
  isDeleted: boolean;
  createdAt: string;
  createdBy: string; // GUID
  updatedAt?: string;
  updatedBy?: string;
}

/** Group with owner details (for listing) */
export interface Group extends GroupDto {
  ownerName?: string;
  memberCount?: number;
  members?: GroupMemberDto[];
}

/** GroupMember DTO from backend */
export interface GroupMemberDto {
  id: string; // GUID
  groupId: string; // GUID
  userId: string; // GUID - Student ID
  subjectCode?: string; // Teacher's subject code for the student
  group?: GroupDto;
  user?: UserInfo;
}

/** User info embedded in responses */
export interface UserInfo {
  id: string; // GUID
  fullName: string;
  email?: string;
  avatarUrl?: string;
  studentCode?: string; // For students
}

/**
 * ===== API REQUEST TYPES =====
 */

export interface GetGroupsParams {
  searchQuery?: string;
  sortBy?: 'name' | 'memberCount' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface CreateGroupRequest {
  groupName: string;
}

export interface UpdateGroupRequest {
  groupId: string;
  groupName: string;
}

export interface DeleteGroupRequest {
  groupId: string;
}

export interface AddGroupMemberRequest {
  groupId: string;
  userId: string;
  subjectCode?: string;
}

export interface UpdateGroupMemberRequest {
  groupId: string;
  userId: string;
  subjectCode?: string;
}

export interface RemoveGroupMemberRequest {
  groupId: string;
  userId: string;
}

/**
 * ===== API RESPONSE TYPES =====
 */

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  pageNumber: number;
  pageSize: number;
}

export type GetGroupsResponse = PaginatedResponse<Group>;
export type GetGroupMembersResponse = PaginatedResponse<GroupMemberDto>;

/**
 * ===== STUDENT SEARCH =====
 */

export interface StudentSearchDto {
  id: string;
  userCode: string;
  fullName: string;
  email: string;
}

export interface SearchStudentsRequest {
  q?: string;
  role?: string;
}

export interface SearchStudentsResponse {
  items: StudentSearchDto[];
  total: number;
}

/**
 * ===== FILTER & SEARCH STATE =====
 */

export interface GroupFilterState {
  searchQuery?: string;
  sortBy?: 'name' | 'memberCount' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

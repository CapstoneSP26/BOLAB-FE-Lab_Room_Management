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
  membersCount?: number;
  members?: GroupMemberDto[];
}

/** GroupMember DTO from backend */
export interface GroupMemberDto {
  userId: string; // GUID - Student ID
  userName: string; // Full name from backend
  userCode?: string; // Student code from backend
  userEmail?: string; // Email from backend
  subjectCode?: string; // Teacher's subject code for the student
  groupId?: string; // GUID
  id?: string; // GUID - if BE returns it
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

// Backend returns arrays directly, not paginated responses
export type GetGroupsResponse = Group[];
export type GetGroupMembersResponse = GroupMemberDto[];

/**
 * ===== FILTER & SEARCH STATE =====
 */

export interface GroupFilterState {
  searchQuery?: string;
  sortBy?: 'name' | 'memberCount' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

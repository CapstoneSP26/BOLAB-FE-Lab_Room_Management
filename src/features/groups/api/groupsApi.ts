/**
 * ===== DATA ACCESS LAYER (Groups API) =====
 * Rules:
 * - Only use axiosInstance from src/api/axios
 * - Must define TypeScript Interface for both Request and Response
 * - Do NOT catch errors (UI or React Query handles them)
 * - All data comes from backend API
 */

import axiosInstance from '../../../api/axios';
import type {
  GroupDto,
  Group,
  GroupMemberDto,
  CreateGroupRequest,
  UpdateGroupRequest,
  AddGroupMemberRequest,
  UpdateGroupMemberRequest,
  GetGroupsResponse,
  GetGroupMembersResponse,
  StudentSearchDto,
  SearchStudentsResponse,
} from '../types/group.type';

// API endpoints
const API_ENDPOINTS = {
  GROUPS: '/groups',
  GROUP_DETAIL: (groupId: string) => `/groups/${groupId}`,
  GROUP_MEMBERS: (groupId: string) => `/groups/${groupId}/members`,
  GROUP_MEMBER_DETAIL: (groupId: string, userId: string) =>
    `/groups/${groupId}/members/${userId}`,
} as const;

/**
 * Get all groups owned by current lecturer
 */
export const getGroups = async (): Promise<GetGroupsResponse> => {
  const response = await axiosInstance.get<GetGroupsResponse>(
    API_ENDPOINTS.GROUPS
  );
  return response.data;
};

/**
 * Get single group by ID
 */
export const getGroupById = async (groupId: string): Promise<Group> => {
  const response = await axiosInstance.get<Group>(
    API_ENDPOINTS.GROUP_DETAIL(groupId)
  );
  return response.data;
};

/**
 * Create a new group
 */
export const createGroup = async (
  request: CreateGroupRequest
): Promise<GroupDto> => {
  const response = await axiosInstance.post<GroupDto>(
    API_ENDPOINTS.GROUPS,
    request
  );
  return response.data;
};

/**
 * Update group information
 */
export const updateGroup = async (
  request: UpdateGroupRequest
): Promise<GroupDto> => {
  const response = await axiosInstance.put<GroupDto>(
    API_ENDPOINTS.GROUP_DETAIL(request.groupId),
    {
      groupName: request.groupName,
    }
  );
  return response.data;
};

/**
 * Delete group (soft delete by backend)
 */
export const deleteGroup = async (groupId: string): Promise<void> => {
  await axiosInstance.delete(API_ENDPOINTS.GROUP_DETAIL(groupId));
};

/**
 * Get all members of a group
 */
export const getGroupMembers = async (
  groupId: string,
  params?: { page?: number; pageSize?: number }
): Promise<GetGroupMembersResponse> => {
  const response = await axiosInstance.get<GetGroupMembersResponse>(
    API_ENDPOINTS.GROUP_MEMBERS(groupId),
    { params }
  );
  return response.data;
};

/**
 * Add a student to a group
 */
export const addGroupMember = async (
  request: AddGroupMemberRequest
): Promise<GroupMemberDto> => {
  const response = await axiosInstance.post<GroupMemberDto>(
    API_ENDPOINTS.GROUP_MEMBERS(request.groupId),
    {
      userId: request.userId,
      subjectCode: request.subjectCode,
    }
  );
  return response.data;
};

/**
 * Update a group member's information (subject code, etc.)
 */
export const updateGroupMember = async (
  request: UpdateGroupMemberRequest
): Promise<GroupMemberDto> => {
  const response = await axiosInstance.put<GroupMemberDto>(
    API_ENDPOINTS.GROUP_MEMBER_DETAIL(request.groupId, request.userId),
    {
      subjectCode: request.subjectCode,
    }
  );
  return response.data;
};

/**
 * Remove a student from a group
 */
export const removeGroupMember = async (
  groupId: string,
  userId: string
): Promise<void> => {
  await axiosInstance.delete(
    API_ENDPOINTS.GROUP_MEMBER_DETAIL(groupId, userId)
  );
};

/**
 * Search for available students (by keyword)
 * Filters out students already in the group
 * Backend role mapping: 1=Admin, 2=LabManager, 3=Lecturer, 4=Student
 */
export const searchStudents = async (
  searchQuery: string,
  excludeUserIds?: string[]
): Promise<SearchStudentsResponse> => {
  const response = await axiosInstance.get<any>(
    '/users',
    {
      params: {
        keyword: searchQuery,
        role: 4, // Student role
        limit: 10,
        pageSize: 10,
        sortBy: 'CreatedAt',
        isDescending: true,
      }
    }
  );

  // Handle different response structures
  let users = response.data;
  if (response.data?.items) {
    users = response.data.items;
  } else if (response.data?.data) {
    users = response.data.data;
  } else if (!Array.isArray(response.data)) {
    users = [];
  }

  // Map the response and filter out excluded users
  const items = (Array.isArray(users) ? users : [])
    .filter((user: any) => !excludeUserIds?.includes(user.id))
    .map((user: any) => ({
      id: user.id,
      userCode: user.userCode,
      fullName: user.fullName,
      email: user.email,
    } as StudentSearchDto));

  return {
    items,
    total: items.length,
  };
};


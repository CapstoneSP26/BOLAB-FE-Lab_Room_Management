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
  GetGroupsParams,
  CreateGroupRequest,
  UpdateGroupRequest,
  AddGroupMemberRequest,
  UpdateGroupMemberRequest,
  GetGroupsResponse,
  GetGroupMembersResponse,
} from '../types/group.type';

// API endpoints
const API_ENDPOINTS = {
  GROUPS: '/api/groups',
  GROUP_DETAIL: (groupId: string) => `/api/groups/${groupId}`,
  GROUP_MEMBERS: (groupId: string) => `/api/groups/${groupId}/members`,
  GROUP_MEMBER_DETAIL: (groupId: string, userId: string) =>
    `/api/groups/${groupId}/members/${userId}`,
} as const;

/**
 * Get all groups owned by current lecturer
 */
export const getGroups = async (
  params: GetGroupsParams = {}
): Promise<GetGroupsResponse> => {
  const response = await axiosInstance.get<GetGroupsResponse>(
    API_ENDPOINTS.GROUPS,
    { params }
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

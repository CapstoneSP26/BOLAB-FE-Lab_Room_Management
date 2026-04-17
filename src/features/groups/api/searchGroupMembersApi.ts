/**
 * ===== SEARCH AVAILABLE USERS FOR GROUP (Groups API) =====
 * Search and fetch users to add to groups
 * Rules:
 * - Only use axiosInstance from src/api/axios
 * - Uses UserInfo from group.type for consistency
 */

import axiosInstance from '../../../api/axios';
import type { UserInfo } from '../types/group.type';

// API endpoints
const API_ENDPOINTS = {
  SEARCH_USERS: '/users/search',
} as const;

export interface SearchGroupMembersParams {
  searchQuery?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Search available users to add to a group by code, email, or name
 */
export const searchGroupMembers = async (
  params: SearchGroupMembersParams = {}
): Promise<UserInfo[]> => {
  const response = await axiosInstance.get<UserInfo[]>(
    API_ENDPOINTS.SEARCH_USERS,
    { params }
  );
  return response.data;
};

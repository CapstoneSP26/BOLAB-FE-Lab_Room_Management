/**
 * ===== SEARCH GROUP MEMBERS HOOK =====
 * React Query hook for searching users to add to groups
 */

import { useQuery } from '@tanstack/react-query';
import { searchGroupMembers, type SearchGroupMembersParams } from '../api/searchGroupMembersApi';

export const SEARCH_GROUP_MEMBERS_QUERY_KEYS = {
  all: ['searchGroupMembers'] as const,
  search: (params: SearchGroupMembersParams) => 
    [...SEARCH_GROUP_MEMBERS_QUERY_KEYS.all, params] as const,
} as const;

interface UseSearchGroupMembersOptions {
  params?: SearchGroupMembersParams;
  enabled?: boolean;
}

/**
 * Search for available users to add to a group by code, email, or name
 */
export const useSearchGroupMembers = (options: UseSearchGroupMembersOptions = {}) => {
  const { params = {}, enabled = true } = options;

  return useQuery({
    queryKey: SEARCH_GROUP_MEMBERS_QUERY_KEYS.search(params),
    queryFn: () => searchGroupMembers(params),
    enabled: enabled && !!(params.searchQuery),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

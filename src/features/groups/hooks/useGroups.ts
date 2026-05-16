/**
 * ===== REACT QUERY HOOKS (Groups Feature) =====
 * - All hooks use React Query for server state management
 * - No JSX in hooks (only logic)
 * - Hooks are prefixed with "use"
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
  getGroupMembers,
  addGroupMember,
  updateGroupMember,
  removeGroupMember,
  searchStudents,
} from '../api/groupsApi';
import type {
  GetGroupsParams,
  CreateGroupRequest,
  UpdateGroupRequest,
  AddGroupMemberRequest,
  UpdateGroupMemberRequest,
} from '../types/group.type';

// React Query keys
export const GROUPS_QUERY_KEYS = {
  all: ['groups'] as const,
  lists: () => [...GROUPS_QUERY_KEYS.all, 'list'] as const,
  list: (params: GetGroupsParams) => [...GROUPS_QUERY_KEYS.lists(), params] as const,
  details: () => [...GROUPS_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...GROUPS_QUERY_KEYS.details(), id] as const,
  members: () => [...GROUPS_QUERY_KEYS.all, 'members'] as const,
  memberList: (groupId: string) =>
    [...GROUPS_QUERY_KEYS.members(), groupId] as const,
  search: () => [...GROUPS_QUERY_KEYS.all, 'search'] as const,
  searchStudents: (query: string) =>
    [...GROUPS_QUERY_KEYS.search(), 'students', query] as const,
} as const;

// ===== QUERIES =====

interface UseGroupsOptions {
  enabled?: boolean;
}

/**
 * Fetch all groups belonging to current lecturer
 */
export const useGroups = (options: UseGroupsOptions = {}) => {
  const { enabled = true } = options;

  return useQuery({
    queryKey: GROUPS_QUERY_KEYS.lists(),
    queryFn: () => getGroups(),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

interface UseGroupByIdOptions {
  groupId: string;
  enabled?: boolean;
}

/**
 * Fetch single group by ID
 */
export const useGroup = (options: UseGroupByIdOptions) => {
  const { groupId, enabled = true } = options;

  return useQuery({
    queryKey: GROUPS_QUERY_KEYS.detail(groupId),
    queryFn: () => getGroupById(groupId),
    enabled: enabled && !!groupId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

interface UseGroupMembersOptions {
  groupId: string;
  enabled?: boolean;
  page?: number;
  pageSize?: number;
}

/**
 * Fetch all members of a specific group
 */
export const useGroupMembers = (options: UseGroupMembersOptions) => {
  const { groupId, enabled = true, page, pageSize } = options;

  return useQuery({
    queryKey: GROUPS_QUERY_KEYS.memberList(groupId),
    queryFn: () =>
      getGroupMembers(groupId, {
        page,
        pageSize,
      }),
    enabled: enabled && !!groupId,
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000,
  });
};

// ===== MUTATIONS =====

interface MutationOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

/**
 * Create a new group
 */
export const useCreateGroup = (options: MutationOptions = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError } = options;

  return useMutation({
    mutationFn: (request: CreateGroupRequest) => createGroup(request),
    onSuccess: (data) => {
      // Invalidate groups list
      queryClient.invalidateQueries({ queryKey: GROUPS_QUERY_KEYS.lists() });
      onSuccess?.(data);
    },
    onError,
  });
};

/**
 * Update group information
 */
export const useUpdateGroup = (options: MutationOptions = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError } = options;

  return useMutation({
    mutationFn: (request: UpdateGroupRequest) => updateGroup(request),
    onSuccess: (data, variables) => {
      // Invalidate specific group and list
      queryClient.invalidateQueries({
        queryKey: GROUPS_QUERY_KEYS.detail(variables.groupId),
      });
      queryClient.invalidateQueries({ queryKey: GROUPS_QUERY_KEYS.lists() });
      onSuccess?.(data);
    },
    onError,
  });
};

/**
 * Delete a group (soft delete)
 */
export const useDeleteGroup = (options: MutationOptions = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError } = options;

  return useMutation({
    mutationFn: (groupId: string) => deleteGroup(groupId),
    onSuccess: (_, groupId) => {
      // Remove from cache and invalidate list
      queryClient.removeQueries({
        queryKey: GROUPS_QUERY_KEYS.detail(groupId),
      });
      queryClient.invalidateQueries({ queryKey: GROUPS_QUERY_KEYS.lists() });
      onSuccess?.(null);
    },
    onError,
  });
};

/**
 * Add a student to a group
 */
export const useAddGroupMember = (options: MutationOptions = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError } = options;

  return useMutation({
    mutationFn: (request: AddGroupMemberRequest) => addGroupMember(request),
    onSuccess: (data, variables) => {
      // Invalidate group members list
      queryClient.invalidateQueries({
        queryKey: GROUPS_QUERY_KEYS.memberList(variables.groupId),
      });
      // Invalidate group detail to refresh member count
      queryClient.invalidateQueries({
        queryKey: GROUPS_QUERY_KEYS.detail(variables.groupId),
      });
      // Invalidate lists to update table
      queryClient.invalidateQueries({ queryKey: GROUPS_QUERY_KEYS.lists() });
      onSuccess?.(data);
    },
    onError,
  });
};

/**
 * Update a group member's information
 */
export const useUpdateGroupMember = (options: MutationOptions = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError } = options;

  return useMutation({
    mutationFn: (request: UpdateGroupMemberRequest) => updateGroupMember(request),
    onSuccess: (data, variables) => {
      // Invalidate group members list
      queryClient.invalidateQueries({
        queryKey: GROUPS_QUERY_KEYS.memberList(variables.groupId),
      });
      onSuccess?.(data);
    },
    onError,
  });
};

/**
 * Remove a student from a group
 */
export const useRemoveGroupMember = (options: MutationOptions = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError } = options;

  return useMutation({
    mutationFn: (params: { groupId: string; userId: string }) =>
      removeGroupMember(params.groupId, params.userId),
    onSuccess: (_, variables) => {
      // Invalidate group members list
      queryClient.invalidateQueries({
        queryKey: GROUPS_QUERY_KEYS.memberList(variables.groupId),
      });
      // Invalidate group detail to refresh member count
      queryClient.invalidateQueries({
        queryKey: GROUPS_QUERY_KEYS.detail(variables.groupId),
      });
      // Invalidate lists to update table
      queryClient.invalidateQueries({ queryKey: GROUPS_QUERY_KEYS.lists() });
      onSuccess?.(null);
    },
    onError,
  });
};

// ===== SEARCH QUERIES =====

interface UseSearchStudentsOptions {
  query: string;
  excludeUserIds?: string[];
  enabled?: boolean;
}

/**
 * Search for available students to add to a group
 */
export const useSearchStudents = (options: UseSearchStudentsOptions) => {
  const { query, excludeUserIds = [], enabled = true } = options;

  return useQuery({
    queryKey: GROUPS_QUERY_KEYS.searchStudents(query),
    queryFn: () => searchStudents(query, excludeUserIds),
    enabled: enabled && query.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};


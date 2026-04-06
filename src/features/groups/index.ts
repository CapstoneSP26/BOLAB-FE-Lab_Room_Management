/**
 * ===== GROUPS FEATURE EXPORTS =====
 * Public API for the groups feature
 */

// ===== TYPES =====
export type {
  GroupDto,
  Group,
  GroupMemberDto,
  UserInfo,
  GetGroupsParams,
  CreateGroupRequest,
  UpdateGroupRequest,
  DeleteGroupRequest,
  AddGroupMemberRequest,
  UpdateGroupMemberRequest,
  RemoveGroupMemberRequest,
  GetGroupsResponse,
  GetGroupMembersResponse,
  PaginatedResponse,
  GroupFilterState,
} from './types/types';

// ===== QUERY KEYS =====
export { GROUPS_QUERY_KEYS } from './hooks/useGroups';

// ===== HOOKS =====
export {
  useGroups,
  useGroup,
  useGroupMembers,
  useCreateGroup,
  useUpdateGroup,
  useDeleteGroup,
  useAddGroupMember,
  useUpdateGroupMember,
  useRemoveGroupMember,
} from './hooks/useGroups';

// ===== COMPONENTS =====
export { default as GroupSearchFilter } from './components/GroupSearchFilter';
export { default as GroupsGridCard } from './components/GroupsGridCard';
export { default as CreateGroupModal } from './components/CreateGroupModal';
export { default as GroupStudentsModal } from './components/GroupStudentsModal';
export { default as GroupStudentsTable } from './components/GroupStudentsTable';
export { default as GroupStats } from './components/GroupStats';

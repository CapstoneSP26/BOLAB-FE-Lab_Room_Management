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
} from './types/group.type';

// ===== IMPORT TYPES =====
export type {
  GroupImportDto,
  RowError,
  RowResult,
  ImportValidationResult,
  ValidateGroupImportRequest,
  CommitGroupImportRequest,
  CommitGroupImportResponse,
  EditableGroupRow,
  GroupField,
  ValidationErrors,
} from './types/importGroup.type';

// ===== QUERY KEYS =====
export { GROUPS_QUERY_KEYS } from './hooks/useGroups';
export { SEARCH_GROUP_MEMBERS_QUERY_KEYS } from './hooks/useSearchGroupMembers';

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

// ===== SEARCH HOOKS =====
export { useSearchGroupMembers } from './hooks/useSearchGroupMembers';

// ===== IMPORT HOOKS =====
export { useGroupImport } from './hooks/useGroupImport';

// ===== COMPONENTS =====
export { default as GroupSearchFilter } from './components/GroupSearchFilter';
export { default as GroupsGridCard } from './components/GroupsGridCard';
export { default as CreateGroupModal } from './components/CreateGroupModal';
export { default as GroupStudentsModal } from './components/GroupStudentsModal';
export { default as GroupStudentsTable } from './components/GroupStudentsTable';
export { default as GroupStats } from './components/GroupStats';

// ===== IMPORT COMPONENTS =====
export { default as ImportGroupFeature } from './components/ImportGroupFeature';
export { default as ImportGroupPanel } from './components/ImportGroupPanel';

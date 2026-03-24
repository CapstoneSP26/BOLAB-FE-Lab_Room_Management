import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getStudentGroups,
  createStudentGroup,
  updateStudentGroup,
  deleteStudentGroup,
  getGroupStudents,
  addStudentToGroup,
  removeStudentFromGroup,
} from '../api/studentGroupsApi';
import type {
  GetStudentGroupsRequest,
  CreateStudentGroupRequest,
  UpdateStudentGroupRequest,
  DeleteStudentGroupRequest,
  AddStudentToGroupRequest,
  RemoveStudentFromGroupRequest,
} from '../types/types';

/**
 * ===== BUSINESS LOGIC LAYER =====
 * Rules:
 * - Tên bắt đầu bằng use
 * - Không viết JSX trong hook
 * - Sử dụng React Query để quản lý API state
 */

export const QUERY_KEYS = {
  STUDENT_GROUPS: 'student-groups',
  GROUP_STUDENTS: 'group-students',
} as const;

// ===== QUERIES =====

interface UseStudentGroupsOptions {
  params?: GetStudentGroupsRequest;
  enabled?: boolean;
}

/**
 * Hook lấy danh sách nhóm sinh viên với filter/search
 */
export const useStudentGroups = (options: UseStudentGroupsOptions = {}) => {
  const { params, enabled = true } = options;

  return useQuery({
    queryKey: [QUERY_KEYS.STUDENT_GROUPS, params],
    queryFn: () => getStudentGroups(params),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 phút
    gcTime: 10 * 60 * 1000, // 10 phút
  });
};

interface UseGroupStudentsOptions {
  groupId: string;
  enabled?: boolean;
}

/**
 * Hook lấy danh sách sinh viên trong nhóm
 */
export const useGroupStudents = (options: UseGroupStudentsOptions) => {
  const { groupId, enabled = true } = options;

  return useQuery({
    queryKey: [QUERY_KEYS.GROUP_STUDENTS, groupId],
    queryFn: () => getGroupStudents({ groupId }),
    enabled: enabled && !!groupId,
    staleTime: 3 * 60 * 1000, // 3 phút
    gcTime: 10 * 60 * 1000, // 10 phút
  });
};

// ===== MUTATIONS =====

interface UseCreateStudentGroupOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

/**
 * Hook tạo nhóm sinh viên mới
 */
export const useCreateStudentGroup = (options: UseCreateStudentGroupOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateStudentGroupRequest) => createStudentGroup(request),
    onSuccess: (data) => {
      // Invalidate student groups list to refresh
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STUDENT_GROUPS] });
      options.onSuccess?.(data);
    },
    onError: options.onError,
  });
};

interface UseUpdateStudentGroupOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

/**
 * Hook cập nhật nhóm sinh viên
 */
export const useUpdateStudentGroup = (options: UseUpdateStudentGroupOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdateStudentGroupRequest) => updateStudentGroup(request),
    onSuccess: (data) => {
      // Invalidate student groups list to refresh
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STUDENT_GROUPS] });
      options.onSuccess?.(data);
    },
    onError: options.onError,
  });
};

interface UseDeleteStudentGroupOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

/**
 * Hook xóa nhóm sinh viên
 */
export const useDeleteStudentGroup = (options: UseDeleteStudentGroupOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: DeleteStudentGroupRequest) => deleteStudentGroup(request),
    onSuccess: (data) => {
      // Invalidate student groups list to refresh
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STUDENT_GROUPS] });
      options.onSuccess?.(data);
    },
    onError: options.onError,
  });
};

interface UseAddStudentToGroupOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

/**
 * Hook thêm sinh viên vào nhóm
 */
export const useAddStudentToGroup = (options: UseAddStudentToGroupOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: AddStudentToGroupRequest) => addStudentToGroup(request),
    onSuccess: (data, variables) => {
      // Invalidate group students list
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GROUP_STUDENTS, variables.groupId],
      });
      // Also invalidate main groups list
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STUDENT_GROUPS] });
      options.onSuccess?.(data);
    },
    onError: options.onError,
  });
};

interface UseRemoveStudentFromGroupOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

/**
 * Hook xóa sinh viên khỏi nhóm
 */
export const useRemoveStudentFromGroup = (options: UseRemoveStudentFromGroupOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: RemoveStudentFromGroupRequest) => removeStudentFromGroup(request),
    onSuccess: (data, variables) => {
      // Invalidate group students list
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GROUP_STUDENTS, variables.groupId],
      });
      // Also invalidate main groups list
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STUDENT_GROUPS] });
      options.onSuccess?.(data);
    },
    onError: options.onError,
  });
};

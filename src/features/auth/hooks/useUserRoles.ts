// src/features/auth/hooks/useUserRoles.ts
import { useQuery, useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import { useToast } from '../../../hooks/useToast.tsx';
import { useAuthStore } from '../../../store/useAuthStore';

const ROLE_NAMES: Record<number, string> = {
  1: 'Admin',
  2: 'Lab Manager',
  3: 'Lecturer',
  4: 'Student',
};

export const useUserRoles = () => {
  const { success, error: errorToast } = useToast();
  const { user, setAuth } = useAuthStore();

  // Fetch user's available roles
  const {
    data: roles = [],
    isLoading: isLoadingRoles,
    error: rolesError,
  } = useQuery({
    queryKey: ['user-roles'],
    queryFn: authApi.getUserRoles,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Mutation for changing role
  const changeRoleMutation = useMutation({
    mutationFn: (roleId: number) => authApi.changeRole(roleId),
    onSuccess: (_, roleId) => {
      success(
        'Success',
        `Role switched to ${ROLE_NAMES[roleId] || 'Unknown'}`,
      );
      
      // Update auth store with new role
      if (user) {
        setAuth({
          ...user,
          roleId: roleId.toString(),
        });
      }

      // Redirect to appropriate dashboard after role change
    //   setTimeout(() => {
    //     const roleRoutes: Record<number, string> = {
    //       1: '/admin/dashboard',
    //       2: '/labmanager/dashboard',
    //       3: '/lecturer/dashboard',
    //       4: '/',
    //     };
    //     window.location.href = roleRoutes[roleId] || '/';
    //   }, 500);
    // },
    // onError: (error: any) => {
    //   errorToast(
    //     'Error',
    //     error?.response?.data?.message ||
    //       'Failed to change role. Please try again.',
    //   );
    },
  });

  const getRoleName = (roleId: number): string => {
    return ROLE_NAMES[roleId] || `Role ${roleId}`;
  };

  return {
    roles,
    isLoadingRoles,
    rolesError,
    changeRole: changeRoleMutation.mutate,
    isChangingRole: changeRoleMutation.isPending,
    getRoleName,
  };
};

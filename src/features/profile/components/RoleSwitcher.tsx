// src/features/profile/components/RoleSwitcher.tsx
import { useState } from 'react';
import { useUserRoles } from '../../auth/hooks/useUserRoles';
import { useAuthStore } from '../../../store/useAuthStore';
import { Shield, ChevronRight, Loader2 } from 'lucide-react';
import { RoleSwitchConfirmModal } from './RoleSwitchConfirmModal';

export const RoleSwitcher = () => {
  const { roles, isLoadingRoles, changeRole, isChangingRole, getRoleName } =
    useUserRoles();
  const { user } = useAuthStore();
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    roleId: number | null;
  }>({
    isOpen: false,
    roleId: null,
  });

  const currentRoleId = user?.roleId ? parseInt(user.roleId, 10) : undefined;

  // If user has only one role, don't show the switcher
  if (!isLoadingRoles && roles.length <= 1) {
    return null;
  }

  const handleRoleClick = (roleId: number) => {
    setConfirmModal({ isOpen: true, roleId });
  };

  const handleConfirm = () => {
    if (confirmModal.roleId) {
      changeRole(confirmModal.roleId);
      setConfirmModal({ isOpen: false, roleId: null });
    }
  };

  const handleCancel = () => {
    setConfirmModal({ isOpen: false, roleId: null });
  };

  const selectedRoleName =
    confirmModal.roleId ? getRoleName(confirmModal.roleId) : '';

  return (
    <>
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all">
        <div className="flex items-center gap-2 mb-6">
          <Shield className="w-6 h-6 text-blue-500" />
          <h3 className="text-xl font-bold text-gray-900">Switch Role</h3>
        </div>

        {isLoadingRoles ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
            <span className="ml-2 text-gray-600">Loading roles...</span>
          </div>
        ) : roles.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No additional roles available</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {roles.map((roleId) => {
              const roleName = getRoleName(roleId);
              const isCurrentRole = roleId === currentRoleId;

              return (
                <button
                  key={roleId}
                  onClick={() => handleRoleClick(roleId)}
                  disabled={isCurrentRole || isChangingRole}
                  className={`
                    flex items-center justify-between gap-3 px-4 py-3 rounded-xl
                    transition-all duration-300 font-medium text-sm
                    ${
                      isCurrentRole
                        ? 'bg-blue-100 border-2 border-blue-500 text-blue-900 cursor-default'
                        : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100 hover:border-blue-300 text-gray-900 hover:text-blue-700'
                    }
                    ${isChangingRole && !isCurrentRole ? 'opacity-50 cursor-not-allowed' : ''}
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5" />
                    <span>{roleName}</span>
                  </div>
                  {isCurrentRole ? (
                    <span className="text-xs font-semibold bg-blue-500 text-white px-2 py-1 rounded-full">
                      Current
                    </span>
                  ) : isChangingRole ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        <p className="text-xs text-gray-500 mt-4 text-center">
          Switching roles will redirect you to the appropriate dashboard.
        </p>
      </div>

      {/* Confirmation Modal */}
      <RoleSwitchConfirmModal
        isOpen={confirmModal.isOpen}
        roleName={selectedRoleName}
        isLoading={isChangingRole}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </>
  );
};

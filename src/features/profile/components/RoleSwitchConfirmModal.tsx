// src/features/profile/components/RoleSwitchConfirmModal.tsx
import { useEffect } from 'react';
import { Shield, AlertCircle, Loader2 } from 'lucide-react';

interface RoleSwitchConfirmModalProps {
  isOpen: boolean;
  roleName: string;
  isLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const RoleSwitchConfirmModal = ({
  isOpen,
  roleName,
  isLoading,
  onConfirm,
  onCancel,
}: RoleSwitchConfirmModalProps) => {
  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 transition-opacity duration-300"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full border border-gray-200 dark:border-gray-700 animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-start gap-4 p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30">
              <AlertCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Switch Role?
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                You're about to switch to a different role
              </p>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  New Role:
                </p>
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {roleName}
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400">
              You will be redirected to the appropriate dashboard for this role. Your
              session will be updated with the new permissions.
            </p>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
              <p className="text-xs text-yellow-800 dark:text-yellow-300">
                ⚠️ Make sure all your work is saved before proceeding.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium hover:from-blue-600 hover:to-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Switching...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Confirm
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

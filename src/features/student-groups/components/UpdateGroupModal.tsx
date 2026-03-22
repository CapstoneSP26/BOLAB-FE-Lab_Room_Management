import React, { useState, useEffect } from 'react';
import { X, Trash2, Loader2 } from 'lucide-react';
import type { StudentGroup } from '../types';

interface UpdateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: StudentGroup | null;
  onUpdate: (data: { id: string; name: string }) => Promise<void>;
  onDelete: (groupId: string) => Promise<void>;
  isLoading?: boolean;
  otherGroups?: StudentGroup[];
}

export const UpdateGroupModal: React.FC<UpdateGroupModalProps> = ({
  isOpen,
  onClose,
  group,
  onUpdate,
  onDelete,
  isLoading = false,
  otherGroups = [],
}) => {
  const [name, setName] = useState('');
  const [errors, setErrors] = useState<{ name?: string }>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (isOpen && group) {
      setName(group.name);
      setErrors({});
      setShowDeleteConfirm(false);
    }
  }, [isOpen, group]);

  const validateForm = (): boolean => {
    const newErrors: { name?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Group name is required';
    } else if (
      name !== group?.name &&
      otherGroups.some((g) => g.name.toLowerCase() === name.toLowerCase())
    ) {
      newErrors.name = 'This group name already exists';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !group) {
      return;
    }

    try {
      await onUpdate({ id: group.id, name });
      onClose();
    } catch (error) {
      console.error('Error updating group:', error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!group) return;

    try {
      await onDelete(group.id);
      onClose();
    } catch (error) {
      console.error('Error deleting group:', error);
    }
  };

  if (!isOpen || !group) return null;

  if (showDeleteConfirm) {
    return (
      <div className="fixed inset-0 bg-white/45 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-lg max-w-md w-full mx-4 shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Confirm Deletion</h2>
          </div>

          <div className="p-6">
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete group <strong>{group.name}</strong>?
            </p>
            <p className="text-sm text-gray-600">
              This action cannot be undone. All related data will be deleted.
            </p>
          </div>

          <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded hover:bg-red-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading && <Loader2 size={16} className="animate-spin" />}
              {isLoading ? 'Deleting...' : 'Delete Now'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white/45 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 shadow-lg">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Edit Student Group</h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded transition disabled:cursor-not-allowed"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Group Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none transition ${
                errors.name
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:border-orange-500'
              } disabled:bg-gray-100`}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              This group has <strong>{group.studentCount}</strong> students
            </p>
          </div>
        </form>

        <div className="flex justify-between gap-3 p-6 border-t border-gray-200">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded hover:bg-red-100 transition disabled:cursor-not-allowed disabled:bg-gray-100 flex items-center gap-2"
          >
            <Trash2 size={16} /> Delete Group
          </button>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading && <Loader2 size={16} className="animate-spin" />}
              {isLoading ? 'Updating...' : 'Update'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateGroupModal;

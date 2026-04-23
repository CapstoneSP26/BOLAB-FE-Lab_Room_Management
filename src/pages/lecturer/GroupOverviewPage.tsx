import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { useGroups, useGroupMembers, useAddGroupMember, useRemoveGroupMember, useDeleteGroup } from '../../features/groups';
import GroupStudentsTable from '../../features/groups/components/GroupStudentsTable';
import GroupStudentsModal from '../../features/groups/components/GroupStudentsModal';
import { useBreadcrumb } from '../../context/BreadcrumbContext';
import { useToast } from '../../hooks/useToast';

const GroupOverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { groupId } = useParams<{ groupId: string }>();
  const { setGroupName, reset: resetBreadcrumb } = useBreadcrumb();
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showDeleteGroupConfirmModal, setShowDeleteGroupConfirmModal] = useState(false);
  const [showRemoveStudentConfirmModal, setShowRemoveStudentConfirmModal] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState<{ id: string; name: string } | null>(null);
  const appAlert = useToast();

  // Get all groups to find the selected one
  const { data: groupsData, isLoading: isLoadingGroups } = useGroups({
    enabled: true,
  });

  const selectedGroup = groupsData?.items.find((g) => g.id === groupId);

  // Set group name in breadcrumb
  useEffect(() => {
    if (selectedGroup?.groupName) {
      setGroupName(selectedGroup.groupName);
    }
    
    // Cleanup: reset breadcrumb when leaving this page
    return () => {
      resetBreadcrumb();
    };
  }, [selectedGroup?.groupName, setGroupName, resetBreadcrumb]);

  // Get students in the group
  const { data: membersData, isLoading: isLoadingStudents } = useGroupMembers({
    groupId: groupId || '',
    enabled: !!groupId,
  });

  const removeStudentMutation = useRemoveGroupMember({
    onSuccess: () => {
      appAlert.success('Success', 'Student removed successfully!');
    },
    onError: (error: any) => {
      appAlert.error('Error', error.message || 'Failed to remove student');
    },
  });

  const addStudentMutation = useAddGroupMember({
    onSuccess: () => {
      appAlert.success('Success', 'Student added successfully!');
      setShowAddStudentModal(false);
    },
    onError: (error: any) => {
      appAlert.error('Error', error.message || 'Failed to add student');
    },
  });

  const deleteGroupMutation = useDeleteGroup({
    onSuccess: () => {
      appAlert.success('Success', 'Group deleted successfully!');
    },
    onError: (error: any) => {
      appAlert.error('Error', error.message || 'Failed to delete group');
    },
  });

  // Navigate to student-groups page after successful delete
  useEffect(() => {
    if (deleteGroupMutation.isSuccess) {
      navigate('/student-groups');
    }
  }, [deleteGroupMutation.isSuccess, navigate]);

  const students = membersData?.items || [];

  const handleRemoveStudent = (studentId: string): void => {
    const student = students.find(s => s.userId === studentId);
    if (student) {
      setStudentToRemove({
        id: studentId,
        name: student.user?.fullName || 'Unknown',
      });
      setShowRemoveStudentConfirmModal(true);
    }
  };

  const handleConfirmRemoveStudent = async (): Promise<void> => {
    if (!selectedGroup || !studentToRemove) return;

    await removeStudentMutation.mutateAsync({
      groupId: selectedGroup.id,
      userId: studentToRemove.id,
    });
    setShowRemoveStudentConfirmModal(false);
    setStudentToRemove(null);
  };

  const handleAddStudent = async (studentId: string): Promise<void> => {
    if (!selectedGroup) return;
    await addStudentMutation.mutateAsync({
      groupId: selectedGroup.id,
      userId: studentId,
    });
  };

  const handleDeleteGroup = (): void => {
    if (!selectedGroup) return;
    setShowDeleteGroupConfirmModal(true);
  };

  const handleConfirmDelete = async (): Promise<void> => {
    if (!selectedGroup) return;
    await deleteGroupMutation.mutateAsync(selectedGroup.id);
  };

  if (isLoadingGroups || !selectedGroup) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate('/student-groups')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4"
          >
            <ArrowLeft size={20} /> Back to Group Management
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Group Overview</h1>
              <p className="text-gray-600 mt-1">Manage students and view activity for group <strong>{selectedGroup.groupName}</strong></p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Students Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Students in group {selectedGroup.groupName}</h2>
              <p className="text-sm text-gray-600 mt-1">Total: {students.length} students</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddStudentModal(true)}
                disabled={addStudentMutation.isPending || deleteGroupMutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-theme-xs transition-all duration-200 flex items-center gap-2 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-theme-sm disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none"
              >
                <Plus size={18} /> Add Student
              </button>
              <button
                onClick={handleDeleteGroup}
                disabled={deleteGroupMutation.isPending}
                title="Delete Group"
                className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-theme-xs transition-all duration-200 flex items-center gap-2 hover:-translate-y-0.5 hover:bg-red-700 hover:shadow-theme-sm disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none"
              >
                <Trash2 size={18} /> {deleteGroupMutation.isPending ? 'Deleting...' : 'Delete Group'}
              </button>
            </div>
          </div>

          {/* Students Table */}
          <GroupStudentsTable
            students={students}
            isLoading={
              isLoadingStudents ||
              removeStudentMutation.isPending ||
              addStudentMutation.isPending ||
              deleteGroupMutation.isPending
            }
            onRemoveStudent={handleRemoveStudent}
          />
        </div>
      </div>

      {/* Add Student Modal */}
      <GroupStudentsModal
        isOpen={showAddStudentModal}
        onClose={() => setShowAddStudentModal(false)}
        group={selectedGroup}
        students={students}
        isLoading={addStudentMutation.isPending || removeStudentMutation.isPending || deleteGroupMutation.isPending}
        onAddStudent={handleAddStudent}
        onRemoveStudent={handleRemoveStudent}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteGroupConfirmModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100000] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-7 w-7 text-red-600" />
              </div>
            </div>

            {/* Content */}
            <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
              Delete Group
            </h2>
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to delete the group <strong>"{selectedGroup?.groupName}"</strong>? This action cannot be undone.
            </p>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteGroupConfirmModal(false)}
                disabled={deleteGroupMutation.isPending}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg transition-all duration-200 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleteGroupMutation.isPending}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white font-semibold rounded-lg transition-all duration-200 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {deleteGroupMutation.isPending && <Loader2 size={18} className="animate-spin" />}
                {deleteGroupMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Student Confirmation Modal */}
      {showRemoveStudentConfirmModal && studentToRemove && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100000] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-7 w-7 text-red-600" />
              </div>
            </div>

            {/* Content */}
            <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
              Remove Student
            </h2>
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to remove <strong>"{studentToRemove.name}"</strong> from this group? This action cannot be undone.
            </p>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRemoveStudentConfirmModal(false);
                  setStudentToRemove(null);
                }}
                disabled={removeStudentMutation.isPending}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg transition-all duration-200 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRemoveStudent}
                disabled={removeStudentMutation.isPending}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white font-semibold rounded-lg transition-all duration-200 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {removeStudentMutation.isPending && <Loader2 size={18} className="animate-spin" />}
                {removeStudentMutation.isPending ? 'Removing...' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupOverviewPage;

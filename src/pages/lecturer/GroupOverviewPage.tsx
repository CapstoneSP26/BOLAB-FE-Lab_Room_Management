import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useGroups, useGroupMembers, useAddGroupMember, useRemoveGroupMember } from '../../features/groups';
import GroupStats from '../../features/groups/components/GroupStats';
import GroupStudentsTable from '../../features/groups/components/GroupStudentsTable';
import GroupStudentsModal from '../../features/groups/components/GroupStudentsModal';
import { useToast } from '../../hooks/useToast';

const GroupOverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { groupId } = useParams<{ groupId: string }>();
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const appAlert = useToast();

  // Memoize params to prevent duplicate requests
  const groupsParams = useMemo(
    () => ({
      searchQuery: '',
      sortBy: 'name' as const,
      sortOrder: 'asc' as const,
    }),
    []
  );

  // Get all groups to find the selected one
  const { data: groupsData, isLoading: isLoadingGroups } = useGroups({
    params: groupsParams,
  });

  const selectedGroup = groupsData?.find((g) => g.id === groupId);

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

  const students = membersData || [];

  const handleRemoveStudent = async (studentId: string): Promise<void> => {
    if (!selectedGroup) return;

    await removeStudentMutation.mutateAsync({
      groupId: selectedGroup.id,
      userId: studentId,
    });
  };

  // Handle batch adding students to the group
  const handleConfirmAddStudents = async (studentIds: string[]): Promise<void> => {
    if (!selectedGroup || studentIds.length === 0) return;

    try {
      // Add each student one by one
      for (const userId of studentIds) {
        await addStudentMutation.mutateAsync({
          groupId: selectedGroup.id,
          userId,
        });
      }
      appAlert.success('Success', `Added ${studentIds.length} student(s) to the group!`);
      setShowAddStudentModal(false);
    } catch (error) {
      appAlert.error('Error', 'Failed to add one or more students');
      console.error('Error adding students:', error);
    }
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
        {/* Stats Cards */}
        <GroupStats completed={0} upcoming={0} pending={3} />

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
                className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-theme-xs transition-all duration-200 flex items-center gap-2 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-theme-sm disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none"
              >
                <Plus size={18} /> Add Student
              </button>
              <button
                title="Delete Group"
                className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-theme-xs transition-all duration-200 flex items-center gap-2 hover:-translate-y-0.5 hover:bg-red-700 hover:shadow-theme-sm"
              >
                <Trash2 size={18} /> Delete Group
              </button>
            </div>
          </div>

          {/* Students Table */}
          <GroupStudentsTable
            students={students}
            isLoading={
              isLoadingStudents ||
              removeStudentMutation.isPending ||
              addStudentMutation.isPending
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
        isLoading={addStudentMutation.isPending || removeStudentMutation.isPending}
        onRemoveStudent={handleRemoveStudent}
        onConfirmAddStudents={handleConfirmAddStudents}
      />
    </div>
  );
};

export default GroupOverviewPage;

import React, { useState, useMemo, useCallback, useDeferredValue } from 'react';
import { X, Search, UserPlus, UserMinus, Loader2 } from 'lucide-react';
import { useSearchGroupMembers } from '../hooks/useSearchGroupMembers';
import type { Group, GroupMemberDto, UserInfo } from '../types/group.type';

interface GroupStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: Group | null;
  students: GroupMemberDto[];
  isLoading?: boolean;
  onRemoveStudent?: (studentId: string) => Promise<void>;
  onConfirmAddStudents?: (studentIds: string[]) => Promise<void>;
}

export const GroupStudentsModal: React.FC<GroupStudentsModalProps> = ({
  isOpen,
  onClose,
  group,
  students,
  isLoading = false,
  onRemoveStudent,
  onConfirmAddStudents,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [temporaryStudents, setTemporaryStudents] = useState<UserInfo[]>([]);
  const [isConfirming, setIsConfirming] = useState(false);

  // Defer search query to avoid excessive API calls while keeping input responsive
  const deferredSearchQuery = useDeferredValue(searchQuery.trim());

  // Search available users to add to group via API
  const { data: searchResults, isLoading: isSearching } = useSearchGroupMembers({
    params: {
      searchQuery: deferredSearchQuery,
    },
    enabled: deferredSearchQuery.length > 0,
  });

  // Get existing student IDs to prevent duplicates
  const existingStudentIds = useMemo(() => {
    const existing = new Set(students.map((s) => s.userId));
    temporaryStudents.forEach((s) => existing.add(s.id));
    return existing;
  }, [students, temporaryStudents]);

  // Filter search results to exclude already added students
  const filteredSearchResults = useMemo(() => {
    if (!searchResults) return [];
    return searchResults.filter((user) => !existingStudentIds.has(user.id));
  }, [searchResults, existingStudentIds]);

  // Handle checkbox selection
  const handleSelectUser = useCallback((userId: string) => {
    setSelectedUserIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  }, []);

  // Handle "Push" button - add selected users to temporary list
  const handlePushSelectedUsers = useCallback(() => {
    const selectedUsers = filteredSearchResults.filter((user) =>
      selectedUserIds.has(user.id)
    );

    setTemporaryStudents((prev) => {
      const existingIds = new Set(prev.map((s) => s.id));
      const newUsers = selectedUsers.filter((user) => !existingIds.has(user.id));
      return [...prev, ...newUsers];
    });

    // Clear selection and search
    setSelectedUserIds(new Set());
    setSearchQuery('');
  }, [filteredSearchResults, selectedUserIds]);

  // Handle remove from temporary list
  const handleRemoveTemporaryStudent = useCallback((userId: string) => {
    setTemporaryStudents((prev) => prev.filter((s) => s.id !== userId));
  }, []);

  // Handle "Confirm" button - submit all temporary students to BE
  const handleConfirmAddStudents = async () => {
    if (temporaryStudents.length === 0 || !onConfirmAddStudents) return;

    try {
      setIsConfirming(true);
      const studentIds = temporaryStudents.map((s) => s.id);
      await onConfirmAddStudents(studentIds);
      
      // Clear temporary list after success
      setTemporaryStudents([]);
      setSearchQuery('');
      setSelectedUserIds(new Set());
    } catch (error) {
      console.error('Error confirming students:', error);
    } finally {
      setIsConfirming(false);
    }
  };

  // Handle remove existing student
  const handleRemoveStudent = async (studentId: string) => {
    if (!onRemoveStudent) return;

    try {
      await onRemoveStudent(studentId);
    } catch (error) {
      console.error('Error removing student:', error);
    }
  };

  if (!isOpen || !group) return null;

  return (
    <div className="fixed inset-0 bg-white/45 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 shadow-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Manage Students - {group.groupName}
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading || isConfirming}
            className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded transition disabled:cursor-not-allowed"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Search Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Search student</h3>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" />
              <input
                type="text"
                placeholder="Search by name, code or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={isConfirming}
                className="w-full pl-10 pr-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

            {/* Search Results */}
            {searchQuery.trim().length > 0 && (
              <div className="border border-blue-200 rounded-lg p-4">
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {isSearching ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 size={20} className="animate-spin text-blue-500" />
                    </div>
                  ) : filteredSearchResults.length > 0 ? (
                    filteredSearchResults.map((user) => (
                      <label
                        key={user.id}
                        className={`flex items-center p-3 border border-blue-200 rounded-lg cursor-pointer transition ${
                          selectedUserIds.has(user.id)
                            ? 'bg-blue-50 border-blue-500'
                            : 'hover:bg-blue-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedUserIds.has(user.id)}
                          onChange={() => handleSelectUser(user.id)}
                          disabled={isConfirming}
                          className="mr-3"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {user.fullName}
                          </p>
                          <p className="text-xs text-gray-600">
                            {user.studentCode} - {user.email}
                          </p>
                        </div>
                      </label>
                    ))
                  ) : (
                    <p className="text-sm text-gray-600 text-center py-4">
                      No students found or all are already in this group
                    </p>
                  )}
                </div>

                {/* Push Button */}
                {filteredSearchResults.length > 0 && (
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={handlePushSelectedUsers}
                      disabled={
                        selectedUserIds.size === 0 || isConfirming
                      }
                      className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg shadow-theme-xs transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-theme-sm disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                    >
                      <UserPlus size={16} />
                      Push ({selectedUserIds.size})
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Temporary List Section */}
          {temporaryStudents.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">
                  Selected Students to Add ({temporaryStudents.length})
                </h3>
              </div>
              <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {temporaryStudents.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200 hover:bg-green-50 transition"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {student.fullName}
                        </p>
                        <p className="text-xs text-gray-600">
                          {student.studentCode} - {student.email}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveTemporaryStudent(student.id)}
                        disabled={isConfirming}
                        className="ml-3 flex-shrink-0 px-3 py-1 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200 transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-100 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 disabled:border-gray-300 disabled:transform-none inline-flex items-center gap-1"
                        title="Remove from temporary list"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Current Group Members */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">
              Student List ({students.length})
            </h3>

            {students.length === 0 ? (
              <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600">No students in this group</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {students.map((member) => (
                  <div
                    key={member.userId}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {member.userName}
                      </p>
                      <p className="text-xs text-gray-600">
                        {member.userCode || '-'} - {member.userEmail || '-'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveStudent(member.userId)}
                      disabled={isLoading || isConfirming}
                      className="ml-3 flex-shrink-0 px-3 py-1 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200 transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-100 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 disabled:border-gray-300 disabled:transform-none inline-flex items-center gap-1"
                      title="Remove student"
                    >
                      <UserMinus size={14} />
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          {temporaryStudents.length > 0 && (
            <button
              onClick={handleConfirmAddStudents}
              disabled={isLoading || isConfirming}
              className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg shadow-theme-xs transition-all duration-200 hover:-translate-y-0.5 hover:bg-green-700 hover:shadow-theme-sm disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
            >
              {isConfirming && <Loader2 size={16} className="animate-spin" />}
              {isConfirming ? 'Confirming...' : 'Confirm'}
            </button>
          )}
          <button
            onClick={onClose}
            disabled={isLoading || isConfirming}
            className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg transition-all duration-200 hover:bg-gray-200 disabled:cursor-not-allowed"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupStudentsModal;

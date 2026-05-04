import React, { useState, useEffect } from 'react';
import { X, Search, UserPlus, UserMinus, Loader2 } from 'lucide-react';
import type { Group, GroupMemberDto } from '../types/group.type';
import { useSearchStudents } from '../hooks/useGroups';

interface GroupStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: Group | null;
  students: GroupMemberDto[];
  isLoading?: boolean;
  onAddStudent?: (studentId: string) => Promise<void>;
  onRemoveStudent?: (studentId: string) => void | Promise<void>;
}

export const GroupStudentsModal: React.FC<GroupStudentsModalProps> = ({
  isOpen,
  onClose,
  group,
  students,
  isLoading = false,
  onAddStudent,
  onRemoveStudent,
}) => {
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [deletingStudentId, setDeletingStudentId] = useState<string | null>(null);

  const existingStudentIds = students.map((s) => s.userId);
  
  // Debounce search query to avoid excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  // Fetch available students based on debounced search query
  const { data: searchData, isLoading: isSearching } = useSearchStudents({
    query: debouncedSearchQuery,
    excludeUserIds: existingStudentIds,
    enabled: showAddStudent && debouncedSearchQuery.length > 0,
  });

  const availableStudents = searchData?.items || [];

  const handleAddStudent = async () => {
    if (!selectedStudentId || !onAddStudent) return;

    try {
      await onAddStudent(selectedStudentId);
      setSelectedStudentId('');
      setShowAddStudent(false);
      setSearchQuery('');
      setDebouncedSearchQuery('');
    } catch (error) {
      console.error('Error adding student:', error);
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    if (!onRemoveStudent || deletingStudentId) return;

    try {
      setDeletingStudentId(studentId);
      await Promise.resolve(onRemoveStudent(studentId));
    } catch (error) {
      console.error('Error removing student:', error);
    } finally {
      setDeletingStudentId(null);
    }
  };

  if (!isOpen || !group) return null;

  const isAddingDisabled = isLoading || isSearching;

  return (
    <div className="fixed inset-0 bg-white/45 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 shadow-lg max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Manage Students - {group.groupName}
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded transition disabled:cursor-not-allowed"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Add Student Section */}
          {!showAddStudent && (
            <button
              onClick={() => setShowAddStudent(true)}
              disabled={isLoading}
              className="w-full px-4 py-3 text-sm font-semibold text-orange-700 bg-orange-50 border border-orange-200 rounded-lg shadow-theme-xs transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-100 hover:shadow-theme-sm disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              <UserPlus size={16} /> Add Student
            </button>
          )}

          {showAddStudent && (
            <div className="bg-white border border-blue-200 rounded-lg p-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Search student
                </label>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" />
                  <input
                    type="text"
                    placeholder="Search by name, code or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    disabled={isAddingDisabled}
                    className="w-full pl-10 pr-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>

              {/* Search Results */}
              <div className="mb-4 max-h-48 overflow-y-auto space-y-2">
                {isSearching && searchQuery ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 size={20} className="animate-spin text-blue-500" />
                    <span className="ml-2 text-sm text-gray-600">Searching...</span>
                  </div>
                ) : availableStudents.length > 0 ? (
                  availableStudents.map((student) => (
                    <label
                      key={student.id}
                      className={`flex items-center p-3 border border-blue-200 rounded-lg cursor-pointer transition ${selectedStudentId === student.id
                          ? 'bg-blue-50 border-blue-500'
                          : 'hover:bg-blue-50'
                        }`}
                    >
                      <input
                        type="radio"
                        name="student"
                        value={student.id}
                        checked={selectedStudentId === student.id}
                        onChange={(e) => setSelectedStudentId(e.target.value)}
                        disabled={isAddingDisabled}
                        className="mr-3"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {student.fullName}
                        </p>
                        <p className="text-xs text-gray-600">
                          {student.userCode} - {student.email}
                        </p>
                      </div>
                    </label>
                  ))
                ) : (
                  <p className="text-sm text-gray-600 text-center py-4">
                    {debouncedSearchQuery
                      ? 'No students found matching your search'
                      : 'Type to search for students'}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleAddStudent}
                  disabled={isAddingDisabled || !selectedStudentId}
                  className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-orange-500 rounded-lg shadow-theme-xs transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-theme-sm disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                >
                  {isAddingDisabled && <Loader2 size={16} className="animate-spin" />}
                  {isAddingDisabled ? 'Adding...' : 'Push'}
                </button>
                <button
                  onClick={() => {
                    setShowAddStudent(false);
                    setSelectedStudentId('');
                    setSearchQuery('');
                    setDebouncedSearchQuery('');
                  }}
                  disabled={isAddingDisabled}
                  className="flex-1 px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg transition-all duration-200 hover:bg-gray-200 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Students List */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Student List ({students.length})
            </h3>

            {students.length === 0 ? (
              <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600">No students in this group</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {students.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {member.user?.studentCode}
                      </p>
                      <p className="text-sm text-gray-600">{member.user?.fullName}</p>
                      {member.user?.email && (
                        <p className="text-xs text-gray-500">{member.user.email}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveStudent(member.userId)}
                      disabled={isAddingDisabled || deletingStudentId === member.userId}
                      className="ml-3 flex-shrink-0 px-3 py-1 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200 transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-100 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 disabled:border-gray-300 disabled:transform-none inline-flex items-center gap-1"
                      title="Remove student"
                    >
                      {deletingStudentId === member.userId ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <UserMinus size={14} />
                      )}
                      {deletingStudentId === member.userId ? 'Removing...' : 'Remove'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={isLoading}
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

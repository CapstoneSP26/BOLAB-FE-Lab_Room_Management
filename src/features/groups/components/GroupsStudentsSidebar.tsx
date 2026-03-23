import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import type { StudentGroup, StudentInGroup } from '../types/types';

interface GroupsStudentsSidebarProps {
  group: StudentGroup | null;
  students: StudentInGroup[];
  isOpen: boolean;
  isLoading?: boolean;
  onClose: () => void;
  onAddStudent?: () => void;
  onRemoveStudent?: (studentId: string) => Promise<void>;
}

export const GroupsStudentsSidebar: React.FC<GroupsStudentsSidebarProps> = ({
  group,
  students,
  isOpen,
  isLoading = false,
  onClose,
  onAddStudent,
  onRemoveStudent,
}) => {
  const [removingStudentId, setRemovingStudentId] = useState<string | null>(null);

  const handleRemove = async (studentId: string) => {
    if (!onRemoveStudent) return;
    setRemovingStudentId(studentId);
    try {
      await onRemoveStudent(studentId);
    } finally {
      setRemovingStudentId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-30 z-30 md:hidden"
        onClick={onClose}
      ></div>

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-screen w-full md:relative md:h-auto md:w-80 bg-white border-l border-gray-200 shadow-lg md:shadow-none z-40 overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{group?.name}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded transition md:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Add Student Button */}
          <button
            onClick={onAddStudent}
            disabled={isLoading}
            className="w-full px-4 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Plus size={18} /> Add Student
          </button>

          {/* Students List */}
          <div>
            <p className="text-xs font-semibold text-gray-700 uppercase mb-3">
              Student List ({students.length})
            </p>

            {students.length === 0 ? (
              <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600">No students found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {students.map((student) => (
                  <div
                    key={student.studentId}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                  >
                    {/* Avatar */}
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                      {student.fullName.charAt(0).toUpperCase()}
                    </div>

                    {/* Student Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {student.fullName}
                      </p>
                      <p className="text-xs text-gray-600">{student.studentCode}</p>
                      {student.email && (
                        <p className="text-xs text-gray-500 truncate">{student.email}</p>
                      )}
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemove(student.studentId)}
                      disabled={isLoading || removingStudentId === student.studentId}
                      className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-red-600 hover:bg-red-100 rounded transition disabled:cursor-not-allowed disabled:text-gray-400"
                      title="Remove student"
                    >
                      {removingStudentId === student.studentId ? (
                        <span className="animate-spin text-xs">⟳</span>
                      ) : (
                        <X size={16} />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 border-t border-gray-200 p-4 bg-white md:hidden">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition flex items-center justify-center gap-2"
          >
            <X size={18} /> Close
          </button>
        </div>
      </div>
    </>
  );
};

export default GroupsStudentsSidebar;

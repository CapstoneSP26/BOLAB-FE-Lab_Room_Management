import React from 'react';
import { Trash2 } from 'lucide-react';
import type { GroupMemberDto } from '../types/types';

interface GroupStudentsTableProps {
  students: GroupMemberDto[];
  isLoading?: boolean;
  onRemoveStudent?: (studentId: string) => Promise<void>;
}

export const GroupStudentsTable: React.FC<GroupStudentsTableProps> = ({
  students,
  isLoading = false,
  onRemoveStudent,
}) => {
  const [removingStudentId, setRemovingStudentId] = React.useState<string | null>(null);

  const handleRemove = async (studentId: string) => {
    if (!onRemoveStudent) return;
    setRemovingStudentId(studentId);
    try {
      await onRemoveStudent(studentId);
    } finally {
      setRemovingStudentId(null);
    }
  };

  if (students.length === 0) {
    return (
      <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
        <p className="text-gray-600">No students in this group</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              NO
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              AVATAR
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              NAME
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              CODE
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              EMAIL
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              STATUS
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              ACTION
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {students.map((member, index) => (
            <tr key={member.id} className="hover:bg-gray-50 transition">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {index + 1}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {member.user?.avatarUrl ? (
                  <img
                    src={member.user.avatarUrl}
                    alt={member.user.fullName}
                    className="w-10 h-10 rounded-full object-cover border border-gray-200"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                    {member.user?.fullName?.charAt(0)?.toUpperCase()}
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {member.user?.fullName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {member.user?.studentCode}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {member.user?.email || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <button
                  onClick={() => handleRemove(member.userId)}
                  disabled={isLoading || removingStudentId === member.userId}
                  className="px-3 py-1 text-sm text-red-600 bg-red-50 rounded hover:bg-red-100 transition disabled:cursor-not-allowed disabled:text-gray-400 flex items-center gap-1"
                  title="Remove student"
                >
                  <Trash2 size={16} /> Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GroupStudentsTable;

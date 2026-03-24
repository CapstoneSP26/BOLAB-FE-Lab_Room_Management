import React from 'react';
import { Edit, Trash2, Users } from 'lucide-react';
import type { StudentGroup } from '../types/types';

interface GroupsTableProps {
  groups: StudentGroup[];
  isLoading?: boolean;
  onEdit: (group: StudentGroup) => void;
  onDelete: (group: StudentGroup) => void;
  onManageStudents: (group: StudentGroup) => void;
}

export const GroupsTable: React.FC<GroupsTableProps> = ({
  groups,
  isLoading = false,
  onEdit,
  onDelete,
  onManageStudents,
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
        <Users className="w-12 h-12 mx-auto mb-2 text-gray-400" />
        <p className="text-gray-600">No student groups found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Group Name</th>
            <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
              Student Count
            </th>
            <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Hành động</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {groups.map((group) => (
            <tr key={group.id} className="hover:bg-gray-50 transition">
              <td className="px-6 py-4 text-sm text-gray-900 font-medium">{group.name}</td>
              <td className="px-6 py-4 text-sm text-gray-600 text-center">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {group.studentCount}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-right">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onManageStudents(group)}
                    className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition flex items-center gap-1"
                    title="Manage students"
                  >
                    <Users size={16} />
                  </button>
                  <button
                    onClick={() => onEdit(group)}
                    className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition flex items-center gap-1"
                    title="Edit"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(group)}
                    className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100 transition flex items-center gap-1"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GroupsTable;

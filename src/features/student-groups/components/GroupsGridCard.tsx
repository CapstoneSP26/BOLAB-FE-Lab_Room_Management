import React from 'react';
import { ArrowRight, GraduationCap, Users } from 'lucide-react';
import type { StudentGroup, StudentInGroup } from '../types';

interface GroupsGridCardProps {
  groups: StudentGroup[];
  isLoading?: boolean;
  onSelectGroup: (group: StudentGroup) => void;
}

export const GroupsGridCard: React.FC<GroupsGridCardProps> = ({
  groups,
  isLoading = false,
  onSelectGroup,
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-theme-sm">
        <GraduationCap className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-700 text-lg font-semibold">No student groups found</p>
        <p className="text-gray-500 text-sm mt-2">Create your first group to get started</p>
      </div>
    );
  }

  const getFallbackAvatar = (studentId: string, index: number): string => {
    const seed = `${studentId}${index}`
      .split('')
      .reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const imgId = (seed % 70) + 1;
    return `https://i.pravatar.cc/80?img=${imgId}`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {groups.map((group) => {
        const previewStudents: StudentInGroup[] = group.previewStudents || [];
        const visibleStudents = previewStudents.slice(0, 4);
        const remainingStudents = Math.max((group.studentCount || 0) - visibleStudents.length, 0);
        
        return (
          <div key={group.id}>
            <div
              onClick={() => onSelectGroup(group)}
              className="group cursor-pointer rounded-2xl border border-[#dfe4f2] bg-[#eef1f8] p-4 shadow-[0_6px_20px_rgba(30,41,59,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_28px_rgba(30,41,59,0.14)]"
            >
              <div className="inline-flex items-center rounded-full bg-[#e4e9f6] px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#6d7ea8]">
                with students
              </div>

              <div
                className="relative mt-4 flex justify-center"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="group/avatars inline-flex items-center">
                  <div className="flex -space-x-2.5">
                    {visibleStudents.map((student) => (
                      <img
                        key={student.studentId}
                        src={student.avatarUrl || getFallbackAvatar(student.studentId, 0)}
                        alt={student.fullName}
                        className="h-10 w-10 rounded-full border-2 border-white object-cover shadow-theme-sm ring-1 ring-gray-200 transition-transform duration-200 hover:z-10 hover:scale-110"
                      />
                    ))}
                    {remainingStudents > 0 && (
                      <div className="h-10 w-10 rounded-full border-2 border-white bg-gray-200 text-gray-700 text-xs font-bold flex items-center justify-center shadow-theme-sm">
                        +{remainingStudents}
                      </div>
                    )}
                  </div>

                  <div className="pointer-events-none invisible absolute left-1/2 top-full z-30 mt-3 w-64 -translate-x-1/2 rounded-xl border border-gray-200 bg-white p-3 shadow-theme-lg opacity-0 transition-all duration-200 group-hover/avatars:visible group-hover/avatars:opacity-100">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Student Preview
                    </p>
                    <div className="mt-2 space-y-2">
                      {previewStudents.slice(0, 3).map((student) => (
                        <div key={`${student.studentId}-tooltip`} className="flex items-center gap-2">
                          <img
                            src={student.avatarUrl || getFallbackAvatar(student.studentId, 1)}
                            alt={student.fullName}
                            className="h-7 w-7 rounded-full border border-gray-200 object-cover"
                          />
                          <p className="text-xs font-medium text-gray-700">{student.fullName}</p>
                        </div>
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-gray-500">Hover avatars to preview members</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-1 text-left">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">GROUP NAME</p>
                <p className="text-xl font-bold text-gray-900 leading-tight">{group.name}</p>
              </div>

              <div className="mt-5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Users size={16} className="text-gray-500" />
                  {group.studentCount} students
                </div>

              <div
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#dfe4fb] text-brand-600 transition-colors duration-200 group-hover:bg-brand-500 group-hover:text-white"
              >
                <ArrowRight size={14} />
              </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default GroupsGridCard;


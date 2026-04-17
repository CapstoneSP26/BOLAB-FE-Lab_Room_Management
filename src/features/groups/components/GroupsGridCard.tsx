import React from 'react';
import { ArrowRight, GraduationCap, Users } from 'lucide-react';
import type { Group, GroupMemberDto } from '../types/group.type';

interface GroupsGridCardProps {
  groups: Group[];
  isLoading?: boolean;
  onSelectGroup: (group: Group) => void;
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
                <Users className="w-8 h-8 text-gray-400" />
              </div>

              <div className="mt-4 space-y-1 text-left">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">GROUP NAME</p>
                <p className="text-xl font-bold text-gray-900 leading-tight">{group.groupName}</p>
              </div>

              <div className="mt-5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Users size={16} className="text-gray-500" />
                  <span>{group.membersCount || 0} students</span>
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
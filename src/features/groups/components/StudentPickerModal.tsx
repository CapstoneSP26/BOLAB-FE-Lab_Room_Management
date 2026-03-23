import React from 'react';
import {
  X,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Trash2,
  FolderPlus,
  Plus,
  Users,
} from 'lucide-react';
import { Button } from '../../../components/ui';
import type { StudentGroup } from '../types/types';
import type { BookingStudent, ManualStudentDraft, SelectedGroupBucket } from '../types/group.type';

interface StudentPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentGroups: StudentGroup[];
  studentsByGroup: Record<string, BookingStudent[]>;
  selectedGroups: Record<string, SelectedGroupBucket>;
  selectedGroupEntries: Array<[string, SelectedGroupBucket]>;
  selectedStudentsCount: number;
  collapsedGroups: Record<string, boolean>;
  manualStudentDrafts: Record<string, ManualStudentDraft>;
  newGroupName: string;
  onNewGroupNameChange: (value: string) => void;
  onCreateEmptyGroup: () => void;
  onAddExistingGroup: (group: StudentGroup) => void;
  onToggleGroupCollapse: (groupId: string) => void;
  onRemoveGroup: (groupId: string) => void;
  onDraftChange: (groupId: string, key: 'fullName' | 'studentCode', value: string) => void;
  onAddManualStudent: (groupId: string) => void;
  onRemoveStudent: (groupId: string, studentId: string) => void;
  getInitials: (fullName: string) => string;
}

export const StudentPickerModal: React.FC<StudentPickerModalProps> = ({
  isOpen,
  onClose,
  studentGroups,
  studentsByGroup,
  selectedGroups,
  selectedGroupEntries,
  selectedStudentsCount,
  collapsedGroups,
  manualStudentDrafts,
  newGroupName,
  onNewGroupNameChange,
  onCreateEmptyGroup,
  onAddExistingGroup,
  onToggleGroupCollapse,
  onRemoveGroup,
  onDraftChange,
  onAddManualStudent,
  onRemoveStudent,
  getInitials,
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[1020] bg-black/10 backdrop-blur-[1px]" onClick={onClose} />

      <div className="fixed inset-0 z-[1030] flex items-center justify-center p-4">
        <div className="flex h-full max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Add Groups And Students</h3>
              <p className="text-xs text-gray-500">Pick students from groups, then apply to current booking</p>
            </div>
            <Button
              type="button"
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="h-10 w-10 rounded-full p-0 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="grid flex-1 grid-cols-1 gap-4 overflow-hidden p-4 lg:grid-cols-2">
            <div className="flex min-h-0 flex-col rounded-xl border border-gray-200 bg-gray-50">
              <div className="border-b border-gray-200 px-4 py-3">
                <p className="text-sm font-semibold text-gray-900">Add Group First</p>
                <p className="text-xs text-gray-500">Pick existing group or create a new empty group folder</p>
              </div>
              <div className="min-h-0 space-y-3 overflow-y-auto p-3">
                <div className="rounded-lg border border-dashed border-gray-300 bg-white p-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Create New Empty Group</p>
                  <div className="flex gap-2">
                    <input
                      value={newGroupName}
                      onChange={(e) => onNewGroupNameChange(e.target.value)}
                      placeholder="Enter new group name"
                      className="h-9 flex-1 rounded-md border border-gray-300 px-3 text-sm text-gray-900 outline-none ring-orange-200 transition focus:border-orange-400 focus:ring"
                    />
                    <Button
                      type="button"
                      size="md"
                      onClick={onCreateEmptyGroup}
                      icon={<FolderPlus className="h-5 w-5" />}
                      className="bg-gray-800 hover:bg-gray-900"
                    >
                      Create
                    </Button>
                  </div>
                </div>

                {studentGroups.map((group) => {
                  const students = studentsByGroup[group.id] || [];
                  const isAdded = !!selectedGroups[group.id];

                  return (
                    <div key={group.id} className="rounded-lg border border-gray-200 bg-white p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{group.name}</p>
                          <p className="text-xs text-gray-500">{"group.courseCode"} • {students.length} students</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {isAdded ? (
                            <span className="rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-700">Added</span>
                          ) : null}
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>

                      <div className="mt-3">
                        <Button
                          type="button"
                          size="md"
                          fullWidth
                          onClick={() => onAddExistingGroup(group)}
                          icon={<Users className="h-5 w-5" />}
                          className="bg-orange-500 hover:bg-orange-600"
                        >
                          Add Whole Group ({students.length})
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex min-h-0 flex-col rounded-xl border border-gray-200 bg-gray-50">
              <div className="border-b border-gray-200 px-4 py-3">
                <p className="text-sm font-semibold text-gray-900">Selected Groups</p>
                <p className="text-xs text-gray-500">{selectedGroupEntries.length} group(s) • {selectedStudentsCount} student(s)</p>
              </div>
              <div className="min-h-0 space-y-3 overflow-y-auto p-3">
                {selectedGroupEntries.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
                    No groups selected yet
                  </div>
                ) : (
                  selectedGroupEntries.map(([groupId, group]) => {
                    const draft = manualStudentDrafts[groupId] || { fullName: '', studentCode: '' };
                    const isCollapsed = !!collapsedGroups[groupId];

                    return (
                      <div key={groupId} className="rounded-lg border border-gray-200 bg-white p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{group.name}</p>
                            <p className="text-xs text-gray-500">
                              {group.isCustom ? 'Custom folder' : group.courseCode} • {group.students.length} student(s)
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              onClick={() => onToggleGroupCollapse(groupId)}
                              variant="ghost"
                              size="sm"
                              className="h-10 w-10 rounded-md p-0 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                            >
                              {isCollapsed ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
                            </Button>
                            <Button
                              type="button"
                              onClick={() => onRemoveGroup(groupId)}
                              variant="ghost"
                              size="sm"
                              className="h-10 w-10 rounded-md p-0 text-red-500 hover:bg-red-100 hover:text-red-700"
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </div>
                        </div>

                        {!isCollapsed && group.isCustom && (
                          <div className="mb-3 rounded-md border border-gray-200 bg-gray-50 p-2">
                            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">Add student manually</p>
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                              <input
                                value={draft.fullName}
                                onChange={(e) => onDraftChange(groupId, 'fullName', e.target.value)}
                                placeholder="Full name"
                                className="h-8 rounded-md border border-gray-300 px-2 text-xs text-gray-900 outline-none ring-orange-200 transition focus:border-orange-400 focus:ring"
                              />
                              <div className="flex gap-2">
                                <input
                                  value={draft.studentCode}
                                  onChange={(e) => onDraftChange(groupId, 'studentCode', e.target.value)}
                                  placeholder="Student code"
                                  className="h-8 flex-1 rounded-md border border-gray-300 px-2 text-xs text-gray-900 outline-none ring-orange-200 transition focus:border-orange-400 focus:ring"
                                />
                                <Button
                                  type="button"
                                  onClick={() => onAddManualStudent(groupId)}
                                  variant="outline"
                                  size="md"
                                  className="h-10 border-gray-300 px-3 text-sm text-gray-700 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}

                        {!isCollapsed && (
                          <div className="space-y-1.5">
                            {group.students.length === 0 ? (
                              <div className="rounded-md border border-dashed border-gray-300 px-2 py-2 text-xs text-gray-500">
                                Empty group folder. Add student manually.
                              </div>
                            ) : (
                              group.students.map((student) => (
                                <div
                                  key={student.studentId}
                                  className="flex items-center justify-between rounded-md border border-gray-100 px-2 py-1.5"
                                >
                                  <div className="flex items-center gap-2.5">
                                    {student.avatarUrl ? (
                                      <img
                                        src={student.avatarUrl}
                                        alt={student.fullName}
                                        className="h-8 w-8 rounded-full border border-gray-200 object-cover"
                                      />
                                    ) : (
                                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-[10px] font-semibold text-gray-700">
                                        {getInitials(student.fullName)}
                                      </div>
                                    )}
                                    <div>
                                      <p className="text-xs font-medium text-gray-900">{student.fullName}</p>
                                      <p className="text-[11px] text-gray-500">{student.studentCode}</p>
                                    </div>
                                  </div>
                                  <Button
                                    type="button"
                                    onClick={() => onRemoveStudent(groupId, student.studentId)}
                                    variant="ghost"
                                    size="sm"
                                    className="h-10 w-10 rounded-md p-0 text-red-500 hover:bg-red-100 hover:text-red-700"
                                  >
                                    <Trash2 className="h-5 w-5" />
                                  </Button>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2 border-t border-gray-200 bg-gray-50 px-4 py-3">
            <Button onClick={onClose} variant="outline" fullWidth size="md">
              Close
            </Button>
            <Button
              onClick={onClose}
              fullWidth
              size="md"
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
            >
              Apply To Booking
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

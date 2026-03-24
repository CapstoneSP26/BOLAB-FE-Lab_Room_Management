import React, { useEffect, useMemo, useState } from 'react';
import {
  X,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import type { StudentGroupInBooking } from '../../groups/types/group.type';
import { formatDate } from '../../../utils/formatDate';
import { useToast } from '../../../hooks/useToast';
import { SelectedStudentsSummary } from '../../groups/components/SelectedStudentsSummary';
import { StudentPickerModal } from '../../groups/components/StudentPickerModal';
import type { BookingStudent, ManualStudentDraft, SelectedGroupBucket } from '../../groups/types/group.type';
import { buildStudentsForGroup, getInitials } from '../../groups/utils/buildStudentsForGroup';

interface BookingConfirmPanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  startTime: string;
  endTime: string;
  roomName: string;
  studentGroups: StudentGroupInBooking[];
  onConfirm: (data: {
    groupId?: string;
    repeatWeekly: boolean;
    repeatWeeksCount?: number;
  }) => void;
  loading?: boolean;
}

/**
 * 📋 Modern Booking Confirmation Panel
 * Clean, friendly design inspired by modern booking systems
 */
export const BookingConfirmPanel: React.FC<BookingConfirmPanelProps> = ({
  isOpen,
  onClose,
  selectedDate,
  startTime,
  endTime,
  roomName,
  studentGroups,
  onConfirm,
  loading = false,
}) => {
  const appAlert = useToast();
  const [repeatWeekly, setRepeatWeekly] = useState(false);
  const [repeatWeeksCount, setRepeatWeeksCount] = useState(4);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [showStudentPicker, setShowStudentPicker] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState<Record<string, SelectedGroupBucket>>({});
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [newGroupName, setNewGroupName] = useState('');
  const [manualStudentDrafts, setManualStudentDrafts] = useState<Record<string, ManualStudentDraft>>({});

  const studentsByGroup = useMemo(() => {
    return studentGroups.reduce<Record<string, BookingStudent[]>>((acc, group) => {
      acc[group.id] = buildStudentsForGroup(group);
      return acc;
    }, {});
  }, [studentGroups]);

  const selectedGroupEntries = useMemo(() => {
    return Object.entries(selectedGroups);
  }, [selectedGroups]);

  const selectedStudentsCount = useMemo(() => {
    return selectedGroupEntries.reduce((total, [, group]) => total + group.students.length, 0);
  }, [selectedGroupEntries]);

  const selectedGroupIds = useMemo(() => {
    return selectedGroupEntries.map(([groupId]) => groupId);
  }, [selectedGroupEntries]);

  useEffect(() => {
    if (selectedGroupIds.length === 0) {
      setSelectedGroupId('');
      return;
    }

    if (!selectedGroupIds.includes(selectedGroupId)) {
      setSelectedGroupId(selectedGroupIds[0]);
    }
  }, [selectedGroupId, selectedGroupIds]);

  if (!isOpen) return null;

  const handleClosePanel = () => {
    setShowStudentPicker(false);
    onClose();
  };

  const handleAddExistingGroup = (group: StudentGroupInBooking) => {
    if (selectedGroups[group.id]) {
      appAlert.warning('Group already added', `${group.name} is already in Selected Groups.`);
      return;
    }

    const allStudents = studentsByGroup[group.id] || [];

    setSelectedGroups((prev) => ({
      ...prev,
      [group.id]: {
        id: group.id,
        name: group.name,
        courseCode: group.courseCode,
        isCustom: false,
        students: allStudents,
      },
    }));

    setSelectedGroupId(group.id);
  };

  const handleCreateEmptyGroup = () => {
    const trimmed = newGroupName.trim();
    if (!trimmed) {
      return;
    }

    const customId = `custom-${Date.now()}`;

    setSelectedGroups((prev) => ({
      ...prev,
      [customId]: {
        id: customId,
        name: trimmed,
        courseCode: 'Custom Group',
        isCustom: true,
        students: [],
      },
    }));

    setManualStudentDrafts((prev) => ({
      ...prev,
      [customId]: { fullName: '', studentCode: '' },
    }));

    setSelectedGroupId(customId);
    setNewGroupName('');
  };

  const handleRemoveStudent = (groupId: string, studentId: string) => {
    setSelectedGroups((prev) => {
      const group = prev[groupId];
      if (!group) {
        return prev;
      }

      const current = group.students;
      const next = current.filter((student) => student.studentId !== studentId);

      return {
        ...prev,
        [groupId]: {
          ...group,
          students: next,
        },
      };
    });
  };

  const handleDraftChange = (groupId: string, key: 'fullName' | 'studentCode', value: string) => {
    setManualStudentDrafts((prev) => ({
      ...prev,
      [groupId]: {
        fullName: prev[groupId]?.fullName || '',
        studentCode: prev[groupId]?.studentCode || '',
        [key]: value,
      },
    }));
  };

  const handleAddManualStudent = (groupId: string) => {
    const draft = manualStudentDrafts[groupId];
    const fullName = draft?.fullName?.trim();
    const studentCode = draft?.studentCode?.trim();

    if (!fullName || !studentCode) {
      return;
    }

    setSelectedGroups((prev) => {
      const group = prev[groupId];
      if (!group) {
        return prev;
      }

      const exists = group.students.some((student) => student.studentCode === studentCode);
      if (exists) {
        return prev;
      }

      const manualStudent: BookingStudent = {
        studentId: `${groupId}-${Date.now()}-${group.students.length + 1}`,
        fullName,
        studentCode,
      };

      return {
        ...prev,
        [groupId]: {
          ...group,
          students: [...group.students, manualStudent],
        },
      };
    });

    setManualStudentDrafts((prev) => ({
      ...prev,
      [groupId]: {
        fullName: '',
        studentCode: '',
      },
    }));
  };

  const handleRemoveGroup = (groupId: string) => {
    setSelectedGroups((prev) => {
      const { [groupId]: _removed, ...rest } = prev;
      return rest;
    });

    setCollapsedGroups((prev) => {
      const { [groupId]: _removed, ...rest } = prev;
      return rest;
    });

    setManualStudentDrafts((prev) => {
      const { [groupId]: _removed, ...rest } = prev;
      return rest;
    });
  };

  const handleToggleGroupCollapse = (groupId: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const handleConfirm = () => {
    const activeGroup = selectedGroupId ? selectedGroups[selectedGroupId] : undefined;

    onConfirm({
      groupId: activeGroup && !activeGroup.isCustom ? activeGroup.id : undefined,
      repeatWeekly,
      repeatWeeksCount: repeatWeekly ? repeatWeeksCount : undefined,
    });

    // Reset form
    setRepeatWeekly(false);
    setRepeatWeeksCount(4);
    setSelectedGroupId('');
    setSelectedGroups({});
    setNewGroupName('');
    setManualStudentDrafts({});
    setShowStudentPicker(false);
  };

  // Calculate repeated dates for preview
  const getRepeatedDates = (): string[] => {
    if (!repeatWeekly) return [];

    const dates: string[] = [];
    const baseDate = new Date(selectedDate);

    for (let i = 1; i <= repeatWeeksCount; i++) {
      const nextDate = new Date(baseDate);
      nextDate.setDate(baseDate.getDate() + i * 7);
      dates.push(nextDate.toISOString().split('T')[0]);
    }

    return dates;
  };

  const repeatedDates = getRepeatedDates();

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-transparent z-[1000] transition-opacity backdrop-blur-sm"
        onClick={handleClosePanel}
      />

      {/* Modal Panel - Centered */}
      <div className="fixed inset-0 z-[1010] flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Booking Details</h2>
                <p className="text-xs text-gray-500 mt-1">Review and confirm your booking</p>
              </div>
              <Button
                type="button"
                onClick={handleClosePanel}
                variant="ghost"
                size="sm"
                className="h-10 w-10 rounded-full p-0 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {/* Booking Info Card */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-orange-600" />
                <h3 className="font-semibold text-sm text-gray-900">Selected Time Slot</h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-lg p-3">
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Date</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatDate(new Date(selectedDate), 'MMM DD, YYYY')}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Time</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {startTime} - {endTime}
                  </p>
                </div>
              </div>

              <div className="mt-3 bg-white rounded-lg p-3">
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Room</p>
                <p className="text-sm font-semibold text-orange-600">{roomName}</p>
              </div>
            </div>

            <SelectedStudentsSummary
              selectedGroupEntries={selectedGroupEntries}
              selectedStudentsCount={selectedStudentsCount}
              onOpenStudentPicker={() => setShowStudentPicker(true)}
            />

            {/* Repeat Weekly Option */}
            <div className="border-t border-gray-200 pt-4">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={repeatWeekly}
                    onChange={(e) => setRepeatWeekly(e.target.checked)}
                    className="w-4 h-4 text-orange-600 focus:ring-orange-500 rounded"
                  />
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900 group-hover:text-orange-600 transition-colors">
                    Repeat Weekly
                  </p>
                  <p className="text-sm text-gray-500">
                    Book the same time slot for multiple weeks
                  </p>
                </div>
              </label>

              {repeatWeekly && (
                <div className="mt-3 ml-6 space-y-3 animate-fade-in">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of weeks: <span className="text-orange-600 font-bold">{repeatWeeksCount}</span>
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="16"
                      value={repeatWeeksCount}
                      onChange={(e) => setRepeatWeeksCount(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>1 week</span>
                      <span>16 weeks</span>
                    </div>
                  </div>

                  {/* Preview of repeated dates */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-sm text-blue-900 mb-2">
                          {repeatWeeksCount + 1} bookings will be created
                        </p>
                        <div className="space-y-1 text-xs text-blue-800 max-h-28 overflow-y-auto">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                            {formatDate(new Date(selectedDate), 'MMM DD, YYYY')} (Today)
                          </div>
                          {repeatedDates.map((date, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                              {formatDate(new Date(date), 'MMM DD, YYYY')}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex gap-2.5">
              <Button
                onClick={handleClosePanel}
                variant="outline"
                fullWidth
                size="sm"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                variant="primary"
                fullWidth
                size="sm"
                isLoading={loading}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
              >
                {loading ? 'Saving...' : 'Confirm Booking'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <StudentPickerModal
        isOpen={showStudentPicker}
        onClose={() => setShowStudentPicker(false)}
        studentGroups={studentGroups}
        studentsByGroup={studentsByGroup}
        selectedGroups={selectedGroups}
        selectedGroupEntries={selectedGroupEntries}
        selectedStudentsCount={selectedStudentsCount}
        collapsedGroups={collapsedGroups}
        manualStudentDrafts={manualStudentDrafts}
        newGroupName={newGroupName}
        onNewGroupNameChange={setNewGroupName}
        onCreateEmptyGroup={handleCreateEmptyGroup}
        onAddExistingGroup={handleAddExistingGroup}
        onToggleGroupCollapse={handleToggleGroupCollapse}
        onRemoveGroup={handleRemoveGroup}
        onDraftChange={handleDraftChange}
        onAddManualStudent={handleAddManualStudent}
        onRemoveStudent={handleRemoveStudent}
        getInitials={getInitials}
      />
    </>
  );
};

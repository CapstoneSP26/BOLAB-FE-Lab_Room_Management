import React from 'react';
import { Users, UserPlus } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import type { SelectedGroupBucket } from './types';

interface SelectedStudentsSummaryProps {
  selectedGroupEntries: Array<[string, SelectedGroupBucket]>;
  selectedStudentsCount: number;
  onOpenStudentPicker: () => void;
}

export const SelectedStudentsSummary: React.FC<SelectedStudentsSummaryProps> = ({
  selectedGroupEntries,
  selectedStudentsCount,
  onOpenStudentPicker,
}) => {
  return (
    <div>
      <label className="mb-2 flex items-center gap-2">
        <Users className="h-4 w-4 text-gray-600" />
        <span className="text-sm font-semibold text-gray-900">Students for Booking</span>
        <span className="text-xs text-gray-500">(Optional)</span>
      </label>

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-gray-900">Selected groups: {selectedGroupEntries.length}</p>
            <p className="text-xs text-gray-500">{selectedStudentsCount} student(s) will be included</p>
          </div>
          <Button
            onClick={onOpenStudentPicker}
            size="md"
            icon={<UserPlus className="h-4 w-4" />}
            className="bg-gray-800 hover:bg-gray-900"
          >
            Add Student
          </Button>
        </div>

        {selectedGroupEntries.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {selectedGroupEntries.map(([groupId, group]) => {
              return (
                <div
                  key={groupId}
                  className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm"
                >
                  <span>{group.name}</span>
                  <span className="text-xs text-gray-500">{group.students.length} student(s)</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

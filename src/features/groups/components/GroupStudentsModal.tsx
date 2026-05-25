import React, { useState, useEffect, useMemo } from 'react';
import { X, Search, UserPlus, UserMinus, Loader2, Plus, BookOpen } from 'lucide-react';
import type { Group, GroupMemberDto } from '../types/group.type';
import { useSearchStudents } from '../hooks/useGroups';

interface GroupStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: Group | null;
  students: GroupMemberDto[];
  isLoading?: boolean;
  onAddStudent?: (studentId: string, subjectCode: string) => Promise<void>;
  onRemoveStudent?: (studentId: string, subjectCode?: string) => void | Promise<void>;
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
  // ── Subject tabs state ──
  const [activeSubject, setActiveSubject] = useState<string | null>(null);
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [newSubjectCode, setNewSubjectCode] = useState('');
  const [manualSubjects, setManualSubjects] = useState<string[]>([]);

  // ── Add student state ──
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [deletingStudentId, setDeletingStudentId] = useState<string | null>(null);

  // ── Derived data ──
  // Extract unique subject codes from all members + manually added ones
  const subjectCodes = useMemo(() => {
    const codes = new Set<string>([...manualSubjects]);
    students.forEach((s) => {
      if (s.subjectCode) codes.add(s.subjectCode);
    });
    return Array.from(codes).sort();
  }, [students, manualSubjects]);

  // Filter students by active subject
  const filteredStudents = useMemo(() => {
    if (!activeSubject) return students;
    return students.filter((s) => s.subjectCode === activeSubject);
  }, [students, activeSubject]);

  // Auto-select first subject tab when subjects change
  useEffect(() => {
    if (subjectCodes.length > 0 && !activeSubject) {
      setActiveSubject(subjectCodes[0]);
    }
    // If the active subject was deleted (no more members), reset
    if (activeSubject && !subjectCodes.includes(activeSubject) && subjectCodes.length > 0) {
      setActiveSubject(subjectCodes[0]);
    }
    if (subjectCodes.length === 0) {
      setActiveSubject(null);
    }
  }, [subjectCodes, activeSubject]);

  // Existing student ids for the ACTIVE subject (to exclude from search)
  const existingStudentIds = useMemo(() => {
    return filteredStudents.map((s) => s.userId);
  }, [filteredStudents]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch available students
  const { data: searchData, isLoading: isSearching } = useSearchStudents({
    query: debouncedSearchQuery,
    excludeUserIds: existingStudentIds,
    enabled: showAddStudent && debouncedSearchQuery.length > 0,
  });

  const availableStudents = searchData?.items || [];

  // ── Handlers ──
  const handleAddSubject = () => {
    const code = newSubjectCode.trim().toUpperCase();
    if (!code) return;
    
    // Track manually added subjects so it appears as a tab immediately
    setManualSubjects(prev => Array.from(new Set([...prev, code])));
    
    // Set as active tab
    setActiveSubject(code);
    setNewSubjectCode('');
    setShowAddSubject(false);
    
    // Automatically open "Add Student" form so user can start adding
    setShowAddStudent(true);
  };

  const handleAddStudent = async () => {
    if (!selectedStudentId || !onAddStudent || !activeSubject) return;

    try {
      await onAddStudent(selectedStudentId, activeSubject);
      setSelectedStudentId('');
      setShowAddStudent(false);
      setSearchQuery('');
      setDebouncedSearchQuery('');
    } catch (error) {
      console.error('Error adding student:', error);
    }
  };

  const handleRemoveStudent = async (studentId: string, subjectCode?: string) => {
    if (!onRemoveStudent || deletingStudentId) return;

    try {
      setDeletingStudentId(studentId);
      await Promise.resolve(onRemoveStudent(studentId, subjectCode));
    } catch (error) {
      console.error('Error removing student:', error);
    } finally {
      setDeletingStudentId(null);
    }
  };

  if (!isOpen || !group) return null;

  const isAddingDisabled = isLoading || isSearching;
  const hasSubjects = subjectCodes.length > 0;

  return (
    <div className="fixed inset-0 bg-white/45 backdrop-blur-sm flex items-center justify-center z-[100000]">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 shadow-lg max-h-[85vh] overflow-hidden flex flex-col">
        {/* ── Header ── */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Manage Students - {group.groupName}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {students.length} student{students.length !== 1 ? 's' : ''} · {subjectCodes.length} subject{subjectCodes.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg transition disabled:cursor-not-allowed"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Subject Tabs ── */}
        <div className="px-6 pt-4 pb-2 border-b border-gray-100">
          <div className="flex items-center gap-2 flex-wrap">
            {/* "All" tab - only show if there are subjects */}
            {hasSubjects && (
              <button
                onClick={() => setActiveSubject(null)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  activeSubject === null
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                All ({students.length})
              </button>
            )}

            {/* Subject tabs */}
            {subjectCodes.map((code) => {
              const count = students.filter((s) => s.subjectCode === code).length;
              return (
                <button
                  key={code}
                  onClick={() => setActiveSubject(code)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-1.5 ${
                    activeSubject === code
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-blue-700 bg-blue-50 hover:bg-blue-100 ring-1 ring-inset ring-blue-200'
                  }`}
                >
                  <BookOpen size={14} />
                  {code} ({count})
                </button>
              );
            })}

            {/* Add Subject button */}
            {!showAddSubject ? (
              <button
                onClick={() => setShowAddSubject(true)}
                disabled={isLoading}
                className="px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 rounded-lg border border-dashed border-green-300 hover:bg-green-100 transition-all duration-200 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={14} /> Add Subject
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={newSubjectCode}
                  onChange={(e) => setNewSubjectCode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSubject()}
                  placeholder="e.g. PRN211"
                  autoFocus
                  className="w-28 px-2.5 py-1.5 text-sm border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  onClick={handleAddSubject}
                  disabled={!newSubjectCode.trim()}
                  className="px-2.5 py-1.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Add
                </button>
                <button
                  onClick={() => { setShowAddSubject(false); setNewSubjectCode(''); }}
                  className="px-2.5 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Content ── */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Empty state: no subjects yet */}
          {!hasSubjects && !activeSubject && !showAddStudent && (
            <div className="text-center py-10 bg-gray-50 rounded-lg border border-gray-200">
              <BookOpen size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-sm font-medium text-gray-700 mb-1">No subjects yet</p>
              <p className="text-xs text-gray-500 mb-4">
                Add a subject first, then add students to it.
              </p>
              <button
                onClick={() => setShowAddSubject(true)}
                className="px-4 py-2 text-sm font-semibold text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition inline-flex items-center gap-1.5"
              >
                <Plus size={16} /> Add First Subject
              </button>
            </div>
          )}

          {/* Add Student Section - only visible when a subject is selected */}
          {activeSubject && (
            <>
              {!showAddStudent && (
                <button
                  onClick={() => setShowAddStudent(true)}
                  disabled={isLoading}
                  className="w-full px-4 py-3 text-sm font-semibold text-orange-700 bg-orange-50 border border-orange-200 rounded-lg shadow-theme-xs transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-100 hover:shadow-theme-sm disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                >
                  <UserPlus size={16} /> Add Student to "{activeSubject}"
                </button>
              )}

              {showAddStudent && (
                <div className="bg-white border border-blue-200 rounded-lg p-4">
                  <div className="mb-3">
                    <p className="text-xs font-medium text-blue-600 mb-2">
                      Adding to subject: <span className="font-bold">{activeSubject}</span>
                    </p>
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
                          className={`flex items-center p-3 border border-blue-200 rounded-lg cursor-pointer transition ${
                            selectedStudentId === student.id
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
                      {isAddingDisabled ? 'Adding...' : 'Add to ' + activeSubject}
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
            </>
          )}

          {/* Students List */}
          {(hasSubjects || filteredStudents.length > 0) && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                {activeSubject
                  ? `Students in ${activeSubject} (${filteredStudents.length})`
                  : `All Students (${filteredStudents.length})`}
              </h3>

              {filteredStudents.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600">
                    {activeSubject
                      ? `No students in "${activeSubject}" yet. Click "Add Student" above.`
                      : 'No students in this group'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredStudents.map((member) => (
                    <div
                      key={`${member.userId}-${member.subjectCode || 'none'}`}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900">
                            {member.user?.studentCode}
                          </p>
                          {/* Show subject badge only in "All" view */}
                          {!activeSubject && member.subjectCode && (
                            <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                              {member.subjectCode}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{member.user?.fullName}</p>
                        {member.user?.email && (
                          <p className="text-xs text-gray-500">{member.user.email}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveStudent(member.userId, member.subjectCode)}
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
          )}
        </div>

        {/* ── Footer ── */}
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

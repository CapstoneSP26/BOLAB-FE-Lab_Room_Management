/**
 * Manual Attendance Page - BOLAB-31
 * Traditional attendance marking by lecturer (no QR code)
 * URL: /attendance/manual/:sessionId
 */

import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Users,
  CheckCircle,
  XCircle,
  Search,
  Save,
  ArrowLeft,
  CheckCheck,
  UserX,
  RotateCcw,
  Loader2,
  Lock,
  AlertTriangle,
  AlertCircle,
  MapPin,
} from 'lucide-react';
import { useAttendanceList, useSubmitAttendance } from '../../features/attendance';
import type { AttendanceStatus } from '../../features/attendance/types/attendance.type';

import { useToast } from '../../hooks/useToast';

// Mock student data - will be replaced with real Student Group API
interface Student {
  id: string;
  studentId: string;
  name: string;
  email: string;
  avatar?: string;
}

export default function ManualAttendancePage() {
  const appAlert = useToast();
  const { sessionId: scheduleId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  // Fetch attendance list for this schedule
  const { data: attendanceData, isLoading: sessionLoading } = useAttendanceList(scheduleId || null);
  const submitAttendance = useSubmitAttendance();

  // Get attendance data array (handle both direct array and wrapped object)
  const attendanceArray = Array.isArray(attendanceData) ? attendanceData : (attendanceData?.data || []);

  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, AttendanceStatus>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Get students from API response
  const students: Student[] = attendanceArray.map((student: any) => ({
    id: student.userId,  // Only userId is allowed as studentId
    studentId: student.studentCode || '',
    name: student.fullName || 'Unknown',
    email: student.email || '',
    avatar: undefined,
  }));

  // Check if session is editable (simplified - always true for now)
  const isEditable = true;

  // Initialize attendance records and pre-fill students who already scanned QR.
  useEffect(() => {
    if (isInitialized || !students.length) return;

    const initial: Record<string, AttendanceStatus> = {};
    students.forEach(student => {
      initial[student.id] = 'absent';
    });

    // Pre-fill with existing attendance records from API
    const apiStudents = attendanceArray;
    apiStudents.forEach((record: any) => {
      const matchedStudent = students.find(
        student => student.id === record.userId
      );

      if (matchedStudent) {
        initial[matchedStudent.id] = record.status === 0 ? 'absent' : 'present';
      }
    });

    setAttendanceRecords(initial);
    setIsInitialized(true);
  }, [attendanceArray, isInitialized, students]);

  // Filter students by search query
  const filteredStudents = useMemo(() => {
    if (!searchQuery) return students;
    const query = searchQuery.toLowerCase();
    return students.filter(
      student =>
        student.name.toLowerCase().includes(query) ||
        student.studentId.toLowerCase().includes(query) ||
        student.email.toLowerCase().includes(query)
    );
  }, [searchQuery, students]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = students.length;
    let present = 0;
    let absent = 0;

    Object.values(attendanceRecords).forEach(status => {
      if (status === 'present') present++;
      else if (status === 'absent') absent++;
    });

    return { total, present, absent };
  }, [attendanceRecords, students]);

  // Handle status change
  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    if (!isEditable) return; // Prevent editing past sessions
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: status,
    }));
  };

  // Bulk actions
  const markAllPresent = () => {
    if (!isEditable) return;
    const updated: Record<string, AttendanceStatus> = {};
    students.forEach(student => {
      updated[student.id] = 'present';
    });
    setAttendanceRecords(updated);
  };

  const markAllAbsent = () => {
    if (!isEditable) return;
    const updated: Record<string, AttendanceStatus> = {};
    students.forEach(student => {
      updated[student.id] = 'absent';
    });
    setAttendanceRecords(updated);
  };

  const clearAll = () => {
    if (!isEditable) return;
    const updated: Record<string, AttendanceStatus> = {};
    students.forEach(student => {
      updated[student.id] = 'absent';
    });
    setAttendanceRecords(updated);
  };

  // Show confirmation modal
  const handleSave = () => {
    if (!isEditable) {
      appAlert.warning('Cannot save', 'Attendance can only be updated on the same day as the session.');
      return;
    }
    setShowConfirmModal(true);
  };

  // Confirm and save attendance
  const confirmAndSave = async () => {
    setShowConfirmModal(false);
    setIsSaving(true);

    try {
      if (!scheduleId) {
        throw new Error('Schedule ID is missing.');
      }

      const alreadyMarkedPresent = new Set(
        attendanceArray
          .filter((record: any) => record.status === 1 || record.status === 'present')
          .map((record: any) => record.userId)
      );

      // Build attendance payload - use student.id (userId only)
      const attendancePayload = students.map(student => ({
        userId: student.id,  // Must be userId (not studentId)
        status: attendanceRecords[student.id] as AttendanceStatus,
      }));

      // Call API to submit attendance
      await submitAttendance.mutateAsync({
        scheduleId: scheduleId,
        attendanceItems: attendancePayload,  // BE expects AttendanceItems, not attendance
      });

      appAlert.success('Attendance saved', 'Attendance marked successfully.');
    } catch {
      appAlert.error('Save failed', 'Could not save attendance to backend. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Loading state
  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 text-lg">Loading attendance records...</p>
        </div>
      </div>
    );
  }

  // Check if sessionId is missing
  if (!scheduleId) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg border border-red-200 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Invalid URL</h1>
          <p className="text-slate-600 mb-4">Session ID is missing from the URL.</p>
          <button
            onClick={() => navigate('/attendance')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-semibold"
          >
            Back to Attendance
          </button>
        </div>
      </div>
    );
  }

  // No students found (after loading is complete)
  if (!sessionLoading && (!students || students.length === 0)) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg border border-red-200 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Session Not Found</h1>
          <p className="text-slate-600 mb-4">This session does not exist or has been deleted.</p>
          <button
            onClick={() => navigate('/attendance')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-semibold"
          >
            Back to Attendance
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/attendance')}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !isEditable}
              className={`flex items-center gap-2 text-white px-6 py-2.5 rounded-xl font-semibold shadow-md transition-all ${!isEditable
                ? 'bg-slate-400 cursor-not-allowed'
                : isSaving
                  ? 'bg-slate-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'
                }`}
            >
              {!isEditable ? (
                <>
                  <Lock className="w-5 h-5" />
                  <span>Read Only</span>
                </>
              ) : isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Save Attendance</span>
                </>
              )}
            </button>
          </div>

          {/* Session Info */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
              <div className="flex items-center gap-2 text-slate-600 mb-1">
                <MapPin className="w-4 h-4" />
                <span className="text-xs font-medium uppercase">Schedule ID</span>
              </div>
              <p className="text-sm font-bold text-slate-900">
                {scheduleId || 'N/A'}
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
              <div className="flex items-center gap-2 text-slate-600 mb-1">
                <Users className="w-4 h-4" />
                <span className="text-xs font-medium uppercase">Students</span>
              </div>
              <p className="text-sm font-bold text-slate-900">
                {students.length} total
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Warning Banner for Past Sessions */}
      {!isEditable && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <p className="text-sm text-amber-800">
                <strong>Read-Only Mode:</strong> This session is from a past date. Attendance can only be updated on the same day as the session.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 tabular-nums">{stats.total}</p>
                <p className="text-xs text-slate-600 font-medium">Total</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-emerald-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-900 tabular-nums">{stats.present}</p>
                <p className="text-xs text-emerald-700 font-medium">Present</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-900 tabular-nums">{stats.absent}</p>
                <p className="text-xs text-red-700 font-medium">Absent</p>
              </div>
            </div>
          </div>

        </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by name, student ID, or email..."
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Bulk Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={markAllPresent}
                disabled={!isEditable}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-colors ${isEditable
                  ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
              >
                <CheckCheck className="w-4 h-4" />
                <span>All Present</span>
              </button>
              <button
                onClick={markAllAbsent}
                disabled={!isEditable}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-colors ${isEditable
                  ? 'bg-red-100 hover:bg-red-200 text-red-700'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
              >
                <UserX className="w-4 h-4" />
                <span>All Absent</span>
              </button>
              <button
                onClick={clearAll}
                disabled={!isEditable}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-colors ${isEditable
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
              >
                <RotateCcw className="w-4 h-4" />
                <span>Clear</span>
              </button>
            </div>
          </div>
        </div>

        {/* Student List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Table Header */}
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 grid grid-cols-12 gap-4 items-center font-semibold text-sm text-slate-700">
            <div className="col-span-1 text-center">#</div>
            <div className="col-span-4">Student</div>
            <div className="col-span-3">Student ID</div>
            <div className="col-span-4 text-center">Attendance Status</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-slate-200">
            {filteredStudents.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600 font-medium">No students found</p>
                <p className="text-sm text-slate-500 mt-1">Try adjusting your search query</p>
              </div>
            ) : (
              filteredStudents.map((student, index) => {
                const status = attendanceRecords[student.id];
                return (
                  <div
                    key={student.id}
                    className="px-6 py-4 grid grid-cols-12 gap-4 items-center hover:bg-slate-50 transition-colors"
                  >
                    {/* Number */}
                    <div className="col-span-1 text-center">
                      <span className="text-sm font-semibold text-slate-500">{index + 1}</span>
                    </div>

                    {/* Student Info */}
                    <div className="col-span-4 flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-blue-700">
                          {getInitials(student.name)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 truncate">{student.name}</p>
                        <p className="text-xs text-slate-500 truncate">{student.email}</p>
                      </div>
                    </div>

                    {/* Student ID */}
                    <div className="col-span-3">
                      <p className="text-sm font-mono font-semibold text-slate-700">
                        {student.studentId}
                      </p>
                    </div>

                    {/* Status Buttons */}
                    <div className="col-span-4 flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleStatusChange(student.id, 'present')}
                        disabled={!isEditable}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${!isEditable
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : status === 'present'
                            ? 'bg-emerald-600 text-white shadow-md'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                          }`}
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Present</span>
                      </button>

                      <button
                        onClick={() => handleStatusChange(student.id, 'absent')}
                        disabled={!isEditable}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${!isEditable
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : status === 'absent'
                            ? 'bg-red-600 text-white shadow-md'
                            : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                          }`}
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Absent</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center text-sm text-slate-500">
          <p>
            💡 <strong>Tip:</strong> QR-scanned students are auto-filled as Present when this page opens.
          </p>
          <p className="mt-1">
            Mock data: 30 students · Will be replaced with real Student Group data
          </p>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Xác Nhận Nộp Điểm Danh</h3>
                  <p className="text-sm text-slate-600">Vui lòng kiểm tra lại thông tin</p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Session Info */}
              <div className="bg-slate-50 rounded-xl p-4 mb-4 border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-slate-600" />
                  <p className="text-sm font-semibold text-slate-900">
                    Schedule: {scheduleId}
                  </p>
                </div>
              </div>

              {/* Stats Summary */}
              <div className="mb-4">
                <p className="text-sm font-semibold text-slate-700 mb-3">Tóm tắt điểm danh:</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-medium text-emerald-700">Có mặt</span>
                    </div>
                    <p className="text-2xl font-bold text-emerald-900 tabular-nums">{stats.present}</p>
                  </div>

                  <div className="bg-red-50 rounded-xl p-3 border border-red-200">
                    <div className="flex items-center gap-2 mb-1">
                      <XCircle className="w-4 h-4 text-red-600" />
                      <span className="text-xs font-medium text-red-700">Vắng</span>
                    </div>
                    <p className="text-2xl font-bold text-red-900 tabular-nums">{stats.absent}</p>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-4 h-4 text-slate-600" />
                      <span className="text-xs font-medium text-slate-700">Tổng số</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900 tabular-nums">{stats.total}</p>
                  </div>
                </div>
              </div>

              {/* Total */}
              <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-blue-900">Tổng số sinh viên:</span>
                  <span className="text-xl font-bold text-blue-900 tabular-nums">{stats.total}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-slate-200">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl border border-slate-300 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={confirmAndSave}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Save className="w-5 h-5" />
                <span>Xác Nhận Nộp</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import React, { useEffect, useState } from 'react';
import { AlertCircle, Download, Clock, Users } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { FaceScanContainer } from '../../features/attendance/components/FaceScanContainer';
import { scheduleApi } from '../../features/schedules/api/scheduleApi';
import type { ScheduleDto } from '../../features/schedules/types/schedule.type';

interface ScannedStudent {
  studentId: string;
  scanTime: string;
  confidence: number;
}

export const CameraAttendancePage: React.FC = () => {
  const { roomNo } = useParams<{ roomNo: string }>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [schedules, setSchedules] = useState<ScheduleDto[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleDto | null>(null);
  const [scannedStudents, setScannedStudents] = useState<ScannedStudent[]>([]);
  const [totalScanned, setTotalScanned] = useState(0);

  const loadActiveSchedules = async (room: string) => {
    if (!room?.trim()) {
      setError('Room number is missing in route');
      setSchedules([]);
      setSelectedSchedule(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await scheduleApi.getCurrentSchedule(room.trim());
      const activeNow = (data ?? []).filter((schedule: ScheduleDto) => {
        const now = Date.now();
        const start = new Date(schedule.startTime).getTime();
        const end = new Date(schedule.endTime).getTime();
        return start <= now && end >= now;
      });

      setSchedules(activeNow);
      setSelectedSchedule(activeNow.length === 1 ? activeNow[0] : null);

      if (activeNow.length === 0) {
        setError('No schedules are currently running in this room');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load schedules';
      setError(errorMsg);
      setSchedules([]);
      setSelectedSchedule(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (roomNo) {
      loadActiveSchedules(roomNo);
    }
  }, [roomNo]);

  const handleFaceScanned = (result: { success: boolean; studentId: string; date: string }) => {
    if (!result.success || !result.studentId) return;

    setScannedStudents((prev) => [
      {
        studentId: result.studentId,
        scanTime: new Date(result.date).toLocaleTimeString(),
        confidence: 0.95,
      },
      ...prev,
    ]);
    setTotalScanned((prev) => prev + 1);
    setError(null);
  };

  const handleExportAttendance = () => {
    const data = {
      timestamp: new Date().toISOString(),
      roomNo,
      schedule: selectedSchedule,
      totalScanned,
      students: scannedStudents,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${roomNo ?? 'room'}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Face Recognition Attendance</h1>
          <p className="text-gray-600 mt-1">Room: {roomNo ?? 'Unknown'} · Quick attendance tracking using facial recognition</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-100">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Current schedules in room</h2>
              <p className="text-sm text-gray-600">Auto-loaded from the route room number.</p>
            </div>
            <button
              onClick={() => roomNo && loadActiveSchedules(roomNo)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
              disabled={loading || !roomNo}
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          <div className="mt-4">
            {loading ? (
              <div className="text-gray-500 text-sm">Loading schedules...</div>
            ) : schedules.length === 0 ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
                <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                <p className="text-red-800 text-sm">{error ?? 'No active schedules found.'}</p>
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {schedules.map((schedule) => (
                  <button
                    key={schedule.id}
                    onClick={() => setSelectedSchedule(schedule)}
                    className={`w-full p-4 border-2 rounded-lg text-left transition ${
                      selectedSchedule?.id === schedule.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {schedule.subjectCode} - {schedule.lecturerName}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">{schedule.slotName}</p>
                        <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {new Date(schedule.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(schedule.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users size={14} />
                            {schedule.studentCount} students
                          </span>
                        </div>
                      </div>
                      <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                        {schedule.status}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {selectedSchedule && (
          <>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="font-semibold text-blue-900">{selectedSchedule.subjectCode}</h3>
                  <p className="text-sm text-blue-700 mt-1">Lecturer: {selectedSchedule.lecturerName}</p>
                  <p className="text-sm text-blue-700">Slot: {selectedSchedule.slotName}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">Face Scanner</h2>
                  <FaceScanContainer
                    onFaceScanned={handleFaceScanned}
                    onError={(message: string) => {
                      setError(message);
                      setTimeout(() => setError(null), 3000);
                    }}
                    isLoading={false}
                    scheduleId={String(selectedSchedule.id)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
                  <h3 className="text-lg font-semibold">Statistics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-gray-700">Total Scanned</span>
                      <span className="text-2xl font-bold text-blue-600">{totalScanned}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-gray-700">Present</span>
                      <span className="text-2xl font-bold text-green-600">{totalScanned}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <span className="text-gray-700">Absent</span>
                      <span className="text-2xl font-bold text-red-600">0</span>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
                    <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                    <p className="text-red-800 text-sm">{error}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Scanned Students ({scannedStudents.length})</h3>
                {scannedStudents.length > 0 && (
                  <button
                    onClick={handleExportAttendance}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Download size={16} />
                    Export
                  </button>
                )}
              </div>

              {scannedStudents.length === 0 ? (
                <p className="text-center py-8 text-gray-500">No students scanned yet.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr className="border-b">
                      <th className="text-left p-3">Student ID</th>
                      <th className="text-left p-3">Scan Time</th>
                      <th className="text-left p-3">Confidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scannedStudents.map((student, i) => (
                      <tr key={i} className="border-b hover:bg-gray-50">
                        <td className="p-3">{student.studentId}</td>
                        <td className="p-3">{student.scanTime}</td>
                        <td className="p-3">{(student.confidence * 100).toFixed(0)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CameraAttendancePage;

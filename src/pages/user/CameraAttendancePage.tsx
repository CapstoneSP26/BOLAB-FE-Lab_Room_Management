import React, { useEffect, useState } from 'react';
import { AlertCircle, Camera } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { FaceScanContainer } from '../../features/attendance/components/FaceScanContainer';
import { scheduleApi } from '../../features/schedules/api/scheduleApi';
import type { ScheduleDto } from '../../features/schedules/types/schedule.type';

export const CameraAttendancePage: React.FC = () => {
  const { roomNo } = useParams<{ roomNo: string }>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [schedules, setSchedules] = useState<ScheduleDto[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleDto | null>(null);

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

  return (
    <div className="relative flex flex-col items-center justify-start w-full h-screen px-8 py-6 md:px-10 md:py-12 pt-0 bg-slate-50">
      {/* Header - Outside container */}
      <div className="absolute top-3 left-0 right-0 px-4 md:px-6 pointer-events-none">
        <div className="max-w-4xl mx-auto rounded-2xl border border-slate-200 bg-white/95 shadow-sm backdrop-blur px-6 py-4">
          <div className="flex items-center justify-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
              <Camera size={20} />
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">Face Recognition Attendance</h1>
          </div>
          <div className="mt-3 flex items-center justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-5 py-2">
              <span className="text-sm font-semibold text-blue-700 uppercase tracking-wide">Room</span>
              <span className="text-2xl md:text-3xl font-black text-blue-900 leading-none">{roomNo ?? 'Unknown'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container - Fixed size centered */}
      <div className="flex flex-col w-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden" style={{ width: '900px', height: '700px', marginTop: '150px', marginBottom: 'auto' }}>
        
        {/* Schedules Section */}
        <div className="flex-none px-6 py-4 border-b border-gray-200 bg-gray-50 max-h-40">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Select Schedule</h2>
          
          {loading ? (
            <div className="text-gray-500 text-sm">Loading schedules...</div>
          ) : schedules.length === 0 ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
              <p className="text-red-800 text-sm">{error ?? 'No active schedules found.'}</p>
            </div>
          ) : (
            <div className="grid gap-2 grid-cols-1 md:grid-cols-2">
              {schedules.map((schedule) => (
                <button
                  key={schedule.id}
                  onClick={() => setSelectedSchedule(schedule)}
                  className={`w-full p-3 border-2 rounded-lg text-left text-sm transition ${
                    selectedSchedule?.id === schedule.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <h3 className="font-semibold text-gray-900">
                    {schedule.subjectCode} - {schedule.lecturerName}
                  </h3>
                  <p className="text-xs text-gray-600">{schedule.slotName}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Face Scanner - Main content */}
        {selectedSchedule ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 px-6 py-6">
              <FaceScanContainer
                onFaceScanned={() => {}}
                onError={(message: string) => {
                  setError(message);
                  setTimeout(() => setError(null), 3000);
                }}
                isLoading={false}
                scheduleId={String(selectedSchedule.id)}
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <p>Select a schedule to start scanning</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CameraAttendancePage;

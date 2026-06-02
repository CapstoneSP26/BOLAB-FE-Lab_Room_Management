import React, { useState } from 'react';
import { AlertCircle, Camera } from 'lucide-react';
import { useLocation, useParams } from 'react-router-dom';
import { FaceScanContainer } from '../../features/attendance/components/FaceScanContainer';
import { useActiveSession } from '../../context/ActiveSessionContext';

export const CameraAttendancePage: React.FC = () => {
  const { roomNo } = useParams<{ roomNo: string }>();
  const location = useLocation();
  const { activeSession } = useActiveSession();
  const [error, setError] = useState<string | null>(null);
  const scheduleId = activeSession?.scheduleId ?? (location.state as { scheduleId?: string } | undefined)?.scheduleId;
  const sessionReady = Boolean(scheduleId);

  return (
    <div className="relative flex flex-col items-center justify-start w-full h-screen px-8 py-6 md:px-10 md:py-12 pt-0 bg-slate-50">
      <div className="absolute top-3 left-0 right-0 px-4 md:px-6 pointer-events-none">
        <div className="max-w-4xl mx-auto rounded-2xl border border-slate-200 bg-white/95 shadow-sm backdrop-blur px-6 py-4">
          <div className="flex items-center justify-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
              <Camera size={20} />
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
              Face Recognition Attendance
            </h1>
          </div>
          <div className="mt-3 flex items-center justify-center gap-3 flex-wrap">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-5 py-2">
              <span className="text-sm font-semibold text-blue-700 uppercase tracking-wide">Room</span>
              <span className="text-2xl md:text-3xl font-black text-blue-900 leading-none">{roomNo ?? 'Unknown'}</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2">
              <span className="text-sm font-semibold text-emerald-700 uppercase tracking-wide">Session</span>
              <span className="text-sm md:text-base font-bold text-emerald-900 leading-none">{scheduleId ?? 'Loading...'}</span>
            </div>
          </div>
        </div>
      </div>

      <div
        className="flex flex-col w-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
        style={{ width: '900px', height: '700px', marginTop: '150px', marginBottom: 'auto' }}
      >
        <div className="flex-1 flex flex-col overflow-hidden">
          {!roomNo ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3 max-w-md w-full">
                <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                <p className="text-red-800 text-sm">Room number is missing from the route.</p>
              </div>
            </div>
          ) : !sessionReady || !scheduleId ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 max-w-md w-full">
                <AlertCircle className="text-amber-600 flex-shrink-0" size={20} />
                <p className="text-amber-800 text-sm">Session is not ready yet. Please open this page from the active attendance session.</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 px-6 py-6">
              <FaceScanContainer
                scheduleId={scheduleId}
                onFaceScanned={() => {}}
                onError={(message: string) => {
                  setError(message);
                  setTimeout(() => setError(null), 3000);
                }}
                isLoading={false}
              />
              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3">
                  <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CameraAttendancePage;

import { CheckCircle, Users, XCircle } from 'lucide-react';

interface AttendanceStatsProps {
  totalStudents: number;
  presentStudents: number;
  absentStudents: number;
}

export function AttendanceStats({ totalStudents, presentStudents, absentStudents }: AttendanceStatsProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="px-5 py-2.5 bg-blue-50 rounded-xl border border-blue-200 min-w-[130px]">
        <p className="text-xs text-blue-700 font-semibold">Total</p>
        <p className="text-2xl font-bold text-blue-900 tabular-nums flex items-center gap-1.5">
          <Users className="w-5 h-5" />
          {totalStudents}
        </p>
      </div>
      <div className="px-5 py-2.5 bg-emerald-50 rounded-xl border border-emerald-200 min-w-[130px]">
        <p className="text-xs text-emerald-700 font-semibold">Present</p>
        <p className="text-2xl font-bold text-emerald-900 tabular-nums flex items-center gap-1.5">
          <CheckCircle className="w-5 h-5" />
          {presentStudents}
        </p>
      </div>
      <div className="px-5 py-2.5 bg-red-50 rounded-xl border border-red-200 min-w-[130px]">
        <p className="text-xs text-red-700 font-semibold">Absent</p>
        <p className="text-2xl font-bold text-red-900 tabular-nums flex items-center gap-1.5">
          <XCircle className="w-5 h-5" />
          {absentStudents}
        </p>
      </div>
    </div>
  );
}

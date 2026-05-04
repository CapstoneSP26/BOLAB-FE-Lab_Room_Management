import { GraduationCap, Mail } from "lucide-react";
import { formatDate } from "../../../utils/formatDate";
import type { DashboardStatsDto } from "../types/dashboard.type";

interface LecturerBookingRequestsPanelProps {
  stats: DashboardStatsDto;
}

export default function LecturerBookingRequestsPanel({
  stats,
}: LecturerBookingRequestsPanelProps) {
  const lecturers = [...stats.lecturerBookingRequests].sort(
    (left, right) => right.bookingRequestCount - left.bookingRequestCount,
  );

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Lecturer Booking Requests
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Each lecturer created how many booking requests today.
          </p>
        </div>
        <div className="rounded-xl bg-brand-50 p-3 text-brand-500 dark:bg-brand-500/10 dark:text-brand-300">
          <GraduationCap className="h-5 w-5" />
        </div>
      </div>

      {lecturers.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 px-4 py-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
          No lecturer booking request data is available yet.
        </div>
      ) : (
        <div className="space-y-3">
          {lecturers.map((lecturer, index) => (
            <div
              key={lecturer.lecturerId || `${lecturer.lecturerName}-${index}`}
              className="rounded-xl border border-gray-200 p-4 dark:border-gray-800"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                      {index + 1}
                    </span>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {lecturer.lecturerName || "Unknown lecturer"}
                    </h4>
                  </div>

                  {lecturer.lecturerEmail && (
                    <p className="mt-2 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Mail className="h-4 w-4" />
                      {lecturer.lecturerEmail}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-500 dark:bg-brand-500/10 dark:text-brand-300">
                    {lecturer.bookingRequestCount} request(s)
                  </span>
                  {typeof lecturer.approvedBookingCount === "number" &&
                    lecturer.approvedBookingCount > 0 && (
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
                        {lecturer.approvedBookingCount} approved
                      </span>
                    )}
                  {typeof lecturer.roomCount === "number" &&
                    lecturer.roomCount > 0 && (
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
                        {lecturer.roomCount} room(s)
                      </span>
                    )}
                </div>
              </div>

              {lecturer.latestRequestAt && (
                <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                  Latest request: {formatDate(lecturer.latestRequestAt, "DD/MM/YYYY")}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

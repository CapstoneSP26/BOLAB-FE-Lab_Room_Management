import { Building2 } from "lucide-react";
import type { DashboardStatsDto } from "../types/dashboard.type";
import { UtilizationBar } from "./DashboardUiParts";

interface RoomBookingStatsTableProps {
  stats: DashboardStatsDto;
}

export default function RoomBookingStatsTable({
  stats,
}: RoomBookingStatsTableProps) {
  const rooms = [...stats.roomBookingStats].sort(
    (left, right) => right.bookingCount - left.bookingCount,
  );

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Booking Stats By Room
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {stats.scope === "LAB_MANAGER"
              ? "Showing rooms managed by the current lab manager."
              : "Showing booking activity across all rooms."}
          </p>
        </div>
        <div className="rounded-xl bg-blue-50 p-3 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
          <Building2 className="h-5 w-5" />
        </div>
      </div>

      {rooms.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 px-4 py-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
          No room booking statistics are available yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-gray-200 text-xs uppercase text-gray-500 dark:border-gray-800 dark:text-gray-400">
              <tr>
                <th className="pb-3 pr-4">Room</th>
                <th className="pb-3 pr-4">Bookings</th>
                <th className="pb-3 pr-4">Approved</th>
                <th className="pb-3 pr-4">Incidents</th>
                <th className="pb-3">Utilization</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {rooms.map((room) => (
                <tr key={room.roomId || room.roomName}>
                  <td className="py-4 pr-4">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {room.roomName || "Unknown room"}
                    </p>
                    {room.buildingName && (
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {room.buildingName}
                      </p>
                    )}
                  </td>
                  <td className="py-4 pr-4 font-semibold text-gray-900 dark:text-white">
                    {room.bookingCount}
                  </td>
                  <td className="py-4 pr-4 text-gray-700 dark:text-gray-300">
                    {room.approvedBookingCount ?? 0}
                  </td>
                  <td className="py-4 pr-4 text-gray-700 dark:text-gray-300">
                    {room.incidentReportCount ?? 0}
                  </td>
                  <td className="py-4">
                    <UtilizationBar value={room.utilizationRate ?? 0} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

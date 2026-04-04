import { useMemo } from "react";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";

import DropdownMenu, {
  type DropdownMenuItem,
} from "../../../components/common/DropdownMenu";
import type { DashboardStatsDto } from "../types/dashboard.type";

type MonthlyTargetProps = {
  value?: number;
  stats?: DashboardStatsDto;
};

export default function MonthlyTarget({
  value = 0,
  stats,
}: MonthlyTargetProps) {
  const menuItems: DropdownMenuItem[] = useMemo(
    () => [
      { label: "View More", onClick: () => console.log("View More clicked") },
      { label: "Delete", onClick: () => console.log("Delete clicked") },
    ],
    [],
  );

  const approvedBookingsToday = stats?.approvedBookingsToday ?? 0;
  const checkedInBookingsToday = stats?.checkedInBookingsToday ?? 0;
  const noCheckInBookingsToday = stats?.noCheckInBookingsToday ?? 0;
  const complianceValue = stats?.checkInCompliancePercentage ?? value;
  const series = useMemo(() => [complianceValue], [complianceValue]);

  const options: ApexOptions = useMemo(
    () => ({
      colors: ["#465FFF"],
      chart: {
        fontFamily: "Outfit, sans-serif",
        sparkline: { enabled: true },
      },
      plotOptions: {
        radialBar: {
          startAngle: -90,
          endAngle: 90,
          hollow: { size: "80%" },
          track: {
            background: "#E4E7EC",
            strokeWidth: "100%",
            margin: 5,
          },
          dataLabels: {
            name: { show: false },
            value: {
              fontSize: "28px",
              fontWeight: 600,
              offsetY: -55,
              color: "#1D2939",
              formatter: (val: number) => `${val.toFixed(2)}%`,
            },
          },
        },
      },
      fill: { type: "solid", colors: ["#465FFF"] },
      stroke: { lineCap: "round" },
      labels: ["Progress"],
    }),
    [],
  );

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="rounded-2xl bg-white px-5 pb-11 pt-5 shadow-default dark:bg-gray-900 sm:px-6 sm:pt-6">
        <div className="flex justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Check-in Compliance (Today)
            </h3>
            <p className="mt-1 text-theme-sm text-gray-500 dark:text-gray-400">
              Percentage of approved bookings that have at least one successful
              check-in today.
            </p>
          </div>

          <DropdownMenu
            menuItems={menuItems}
            icon={
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-gray-700 dark:text-gray-200"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M10.2441 6C10.2441 5.0335 11.0276 4.25 11.9941 4.25H12.0041C12.9706 4.25 13.7541 5.0335 13.7541 6C13.7541 6.9665 12.9706 7.75 12.0041 7.75H11.9941C11.0276 7.75 10.2441 6.9665 10.2441 6ZM10.2441 18C10.2441 17.0335 11.0276 16.25 11.9941 16.25H12.0041C12.9706 16.25 13.7541 17.0335 13.7541 18C13.7541 18.9665 12.9706 19.75 12.0041 19.75H11.9941C11.0276 19.75 10.2441 18.9665 10.2441 18ZM11.9941 10.25C11.0276 10.25 10.2441 11.0335 10.2441 12C10.2441 12.9665 11.0276 13.75 11.9941 13.75H12.0041C12.9706 13.75 13.7541 12.9665 13.7541 12C13.7541 11.0335 12.9706 10.25 12.0041 10.25H11.9941Z"
                  fill="currentColor"
                />
              </svg>
            }
          />
        </div>

        <div className="relative max-h-[195px]">
          <div className="h-full">
            <div className="mx-auto w-full max-w-[330px]">
              <Chart
                type="radialBar"
                height={330}
                options={options}
                series={series}
              />
            </div>
          </div>

          <span className="absolute left-1/2 top-[100%] -translate-x-1/2 -translate-y-[100%] rounded-full bg-success-50 px-3 py-1 text-xs font-medium text-success-600 dark:bg-success-500/15 dark:text-success-500">
            {checkedInBookingsToday}/{approvedBookingsToday} checked in
          </span>
        </div>

        <p className="mx-auto mt-1.5 w-full max-w-[380px] text-center text-sm text-gray-500 sm:text-base">
          {noCheckInBookingsToday} booking(s) still missing check-in. Review
          now.
        </p>
      </div>

      <div className="flex items-center justify-center gap-5 px-6 py-3.5 sm:gap-8 sm:py-5">
        {/* Target */}
        <div>
          <p className="mb-1 text-center text-theme-xs text-gray-500 dark:text-gray-400 sm:text-sm">
            Approved Today
          </p>
          <p className="text-center text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
            {approvedBookingsToday}
          </p>
        </div>

        <div className="h-7 w-px bg-gray-200 dark:bg-gray-800" />

        {/* Revenue */}
        <div>
          <p className="mb-1 text-center text-theme-xs text-gray-500 dark:text-gray-400 sm:text-sm">
            Checked-in
          </p>
          <p className="text-center text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
            {checkedInBookingsToday}
          </p>
        </div>

        <div className="h-7 w-px bg-gray-200 dark:bg-gray-800" />

        {/* Today */}
        <div>
          <p className="mb-1 text-center text-theme-xs text-gray-500 dark:text-gray-400 sm:text-sm">
            No Check-in
          </p>
          <p className="text-center text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
            {noCheckInBookingsToday}
          </p>
        </div>
      </div>
    </div>
  );
}

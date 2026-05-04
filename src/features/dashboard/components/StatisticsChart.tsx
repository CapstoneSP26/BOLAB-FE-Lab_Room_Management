import { useMemo, useState } from "react";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import type { DashboardStatsDto } from "../types/dashboard.type";

type OptionValue = "optionOne" | "optionTwo" | "optionThree";

const options = [
  { value: "optionOne" as const, label: "Monthly" },
  { value: "optionTwo" as const, label: "Quarterly" },
  { value: "optionThree" as const, label: "Annually" },
];

type Series = {
  name: string;
  data: number[];
};

interface StatisticsChartProps {
  stats?: DashboardStatsDto;
}

const FALLBACK_CATEGORIES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const normalizeToTwelveMonths = (values: number[]) => {
  if (values.length >= 12) return values.slice(0, 12);
  return [...values, ...Array(12 - values.length).fill(0)];
};

export default function StatisticsCard({ stats }: StatisticsChartProps) {
  const [selected, setSelected] = useState<OptionValue>("optionOne");

  const monthlyBookings = stats?.monthlyBookings ?? [];
  const monthlyIncidents = stats?.monthlyIncidents ?? [];

  const hasData = monthlyBookings.length > 0 || monthlyIncidents.length > 0;

  const series: Series[] = useMemo(
    () => [
      {
        name: "Bookings",
        data: normalizeToTwelveMonths(monthlyBookings),
      },
      {
        name: "Incidents",
        data: normalizeToTwelveMonths(monthlyIncidents),
      },
    ],
    [monthlyBookings, monthlyIncidents],
  );

  const chartOptions: ApexOptions = useMemo(
    () => ({
      legend: {
        show: false,
        position: "top",
        horizontalAlign: "left",
      },
      colors: ["#465FFF", "#9CB9FF"],
      chart: {
        fontFamily: "Outfit, sans-serif",
        type: "area",
        toolbar: { show: false },
      },
      fill: {
        type: "gradient",
        gradient: {
          opacityFrom: 0.55,
          opacityTo: 0,
        },
      },
      stroke: {
        curve: "straight",
        width: [2, 2],
      },
      markers: { size: 0 },
      grid: {
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } },
      },
      dataLabels: { enabled: false },
      tooltip: {
        x: {
          format: "dd MMM yyyy",
        },
      },
      xaxis: {
        type: "category",
        categories: FALLBACK_CATEGORIES,
        axisBorder: { show: false },
        axisTicks: { show: false },
        tooltip: { enabled: false },
      },
      yaxis: {
        title: {
          style: { fontSize: "0px" },
        },
      },
    }),
    [],
  );

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="mb-6 flex flex-col gap-5 sm:flex-row sm:justify-between">
        <div className="w-full">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Statistics
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Monthly booking and incident trend from backend
          </p>
          {!hasData && (
            <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900/60 dark:text-gray-300">
              No monthly statistics available from the API yet.
            </div>
          )}
        </div>

        <div className="relative">
          <div className="inline-flex items-center gap-0.5 rounded-lg bg-gray-100 p-0.5 dark:bg-gray-900">
            {options.map((opt) => {
              const active = selected === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSelected(opt.value)}
                  className={[
                    active
                      ? "shadow-theme-xs bg-white text-gray-900 dark:bg-gray-800 dark:text-white"
                      : "text-gray-500 dark:text-gray-400",
                    "rounded-md px-3 py-2 text-theme-sm font-medium hover:text-gray-900 hover:shadow-theme-xs dark:hover:bg-gray-800 dark:hover:text-white",
                  ].join(" ")}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="custom-scrollbar max-w-full overflow-x-auto">
        <div
          id="chartThree"
          className="-ml-4 min-w-[1000px] pl-2 xl:min-w-full"
        >
          {hasData ? (
            <Chart
              type="area"
              height={310}
              options={chartOptions}
              series={series}
            />
          ) : (
            <div className="flex h-[310px] items-center justify-center rounded-2xl border border-dashed border-gray-300 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
              Waiting for statistics data from backend
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

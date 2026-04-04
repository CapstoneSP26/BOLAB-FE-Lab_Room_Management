import { useMemo, useState } from "react";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import type { DashboardStatsDto } from "../services/dashboardService";

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

export default function StatisticsCard({ stats }: StatisticsChartProps) {
  const [selected, setSelected] = useState<OptionValue>("optionOne");

  const statistics = stats?.statistics;
  const monthlyApproved = statistics?.monthlyApprovedBookings ?? [];
  const monthlyIncidents = statistics?.monthlyIncidents ?? [];

  const isUsingFallbackData =
    monthlyApproved.length === 0 || monthlyIncidents.length === 0;

  const categories = useMemo(
    () =>
      monthlyApproved.length > 0
        ? monthlyApproved.map((point) => point.label.slice(0, 3))
        : FALLBACK_CATEGORIES,
    [monthlyApproved],
  );

  const series: Series[] = useMemo(
    () => [
      {
        name: "Approved Bookings",
        data:
          monthlyApproved.length > 0
            ? monthlyApproved.map((point) => point.value)
            : [160, 180, 190, 210, 170, 200, 220, 205, 215, 230, 240, 225],
      },
      {
        name: "Incidents",
        data:
          monthlyIncidents.length > 0
            ? monthlyIncidents.map((point) => point.value)
            : [5, 3, 8, 4, 6, 7, 9, 5, 4, 6, 8, 7],
      },
    ],
    [monthlyApproved, monthlyIncidents],
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
        categories,
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
    [categories],
  );

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="mb-6 flex flex-col gap-5 sm:flex-row sm:justify-between">
        <div className="w-full">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Statistics
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Target you’ve set for each month
          </p>
          {isUsingFallbackData && (
            <div className="mt-3 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-200">
              Showing sample data. Monthly statistics are not available yet.
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
          <Chart
            type="area"
            height={310}
            options={chartOptions}
            series={series}
          />
        </div>
      </div>
    </div>
  );
}

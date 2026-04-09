import type { ReactNode } from "react";

type MetricCardTone = "blue" | "emerald" | "amber" | "violet";

interface MetricCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: ReactNode;
  tone: MetricCardTone;
}

interface BarProps {
  value: number;
}

const clampPercentage = (value: number) => Math.max(0, Math.min(100, value));

export function MetricCard({
  title,
  value,
  description,
  icon,
  tone,
}: MetricCardProps) {
  const toneClasses = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300",
    emerald:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300",
    amber:
      "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300",
    violet:
      "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300",
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </p>
          <h3 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {value}
          </h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {description}
          </p>
        </div>

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${toneClasses[tone]}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

export function ProgressBar({ value }: BarProps) {
  return (
    <div className="h-3 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
      <div
        className="h-full rounded-full bg-brand-500 transition-all"
        style={{ width: `${clampPercentage(value)}%` }}
      />
    </div>
  );
}

export function UtilizationBar({ value }: BarProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
        <div
          className="h-full rounded-full bg-brand-500"
          style={{ width: `${clampPercentage(value)}%` }}
        />
      </div>
      <span className="w-12 text-right text-xs font-semibold text-gray-700 dark:text-gray-300">
        {value.toFixed(0)}%
      </span>
    </div>
  );
}

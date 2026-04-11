import type { ReactNode } from "react";

type InfoCardProps = {
  title: string;
  children: ReactNode;
};

export function InfoCard({ title, children }: InfoCardProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50">
      <div className="border-b border-gray-200 bg-gray-50 px-5 py-3 dark:border-gray-700 dark:bg-gray-800">
        <h4 className="text-sm font-bold text-gray-900 dark:text-white">
          {title}
        </h4>
      </div>
      <div className="space-y-4 p-5">{children}</div>
    </div>
  );
}

type InfoRowProps = {
  label: string;
  value: string;
  mono?: boolean;
  highlight?: boolean;
};

export function InfoRow({ label, value, mono, highlight }: InfoRowProps) {
  return (
    <div>
      <div className="text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
        {label}
      </div>
      <div
        className={`mt-1 break-words text-sm font-semibold ${
          mono ? "font-mono text-xs" : ""
        } ${
          highlight
            ? "text-emerald-700 dark:text-emerald-400"
            : "text-gray-900 dark:text-white"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

export function Skeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700"
          >
            <div className="h-12 animate-pulse bg-gray-100 dark:bg-gray-800" />
            <div className="space-y-4 p-5">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="space-y-2">
                  <div className="h-3 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="h-12 animate-pulse bg-gray-100 dark:bg-gray-800" />
        <div className="p-6">
          <div className="h-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>

      <div className="flex justify-end gap-3 rounded-xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800/30">
        <div className="h-10 w-24 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
        <div className="h-10 w-24 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
        <div className="h-10 w-24 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
      </div>
    </div>
  );
}

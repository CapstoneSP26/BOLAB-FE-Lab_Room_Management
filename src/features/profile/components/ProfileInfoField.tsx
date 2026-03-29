import type { ReactNode } from "react";

type Props = {
  label: string;
  value?: string | number | null;
  icon: ReactNode;
};

export default function ProfileInfoField({ label, value, icon }: Props) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700/30">
      <div className="mb-3 flex items-center gap-2 text-gray-600 dark:text-gray-400">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wide">
          {label}
        </span>
      </div>
      <p className="break-words text-sm font-semibold text-gray-900 dark:text-white">
        {value ?? "-"}
      </p>
    </div>
  );
}

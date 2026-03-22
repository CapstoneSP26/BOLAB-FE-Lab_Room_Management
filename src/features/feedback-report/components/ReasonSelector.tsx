/**
 * ReasonSelector Component
 * Dropdown/Radio selector for report reasons
 */

import React from 'react';
import type { ReportReason, ReportReasonOption } from '../types';

interface ReasonSelectorProps {
  value: ReportReason | '';
  onChange: (reason: ReportReason) => void;
  reasons: ReportReasonOption[];
  isLoading?: boolean;
  disabled?: boolean;
  error?: string;
}

export const ReasonSelector: React.FC<ReasonSelectorProps> = ({
  value,
  onChange,
  reasons,
  isLoading = false,
  disabled = false,
  error,
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Lý do báo cáo <span className="text-red-500">*</span>
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value as ReportReason)}
        disabled={disabled || isLoading}
        className={`
          w-full px-4 py-3 rounded-lg border
          bg-white text-gray-900
          focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
          disabled:bg-gray-100 disabled:cursor-not-allowed
          transition-all duration-200
          ${error ? 'border-red-500' : 'border-gray-300'}
        `}
      >
        <option value="">
          {isLoading ? '-- Đang tải lý do --' : '-- Chọn lý do --'}
        </option>
        {reasons.map((reasonOption) => (
          <option key={reasonOption.value} value={reasonOption.value}>
            {reasonOption.label}
          </option>
        ))}
      </select>

      {error && (
        <p className="text-sm text-red-500 flex items-center gap-1">
          <svg
            className="w-4 h-4"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

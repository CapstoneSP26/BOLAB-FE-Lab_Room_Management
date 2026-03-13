/**
 * ReportSuccessModal Component
 * Success confirmation modal after submitting report
 */

import React from 'react';
import type { Report } from '../types';
import { REPORT_REASON_LABELS } from '../types';

interface ReportSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: Report | null;
  onViewMyReports?: () => void;
  onCreateAnother?: () => void;
}

export const ReportSuccessModal: React.FC<ReportSuccessModalProps> = ({
  isOpen,
  onClose,
  report,
  onViewMyReports,
  onCreateAnother,
}) => {
  if (!isOpen || !report) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
          {/* Success Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
            Gửi báo cáo thành công!
          </h2>

          {/* Description */}
          <p className="text-center text-gray-600 mb-6">
            Báo cáo của bạn đã được gửi đi. Chúng tôi sẽ xem xét và xử lý trong thời gian sớm nhất.
          </p>

          {/* Report Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Mã báo cáo:</span>
              <span className="text-sm font-semibold text-gray-900">
                #{report.id}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Phòng:</span>
              <span className="text-sm font-medium text-gray-900">
                {report.roomName} - {report.buildingName}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Lý do:</span>
              <span className="text-sm font-medium text-gray-900">
                {REPORT_REASON_LABELS[report.reason]}
              </span>
            </div>

            {report.images.length > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Số ảnh:</span>
                <span className="text-sm font-medium text-gray-900">
                  {report.images.length} ảnh
                </span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <span className="text-sm text-gray-600">Trạng thái:</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Chờ xử lý
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            {onViewMyReports && (
              <button
                onClick={() => {
                  onViewMyReports();
                  onClose();
                }}
                className="w-full px-4 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium transition-colors"
              >
                Xem báo cáo của tôi
              </button>
            )}

            {onCreateAnother && (
              <button
                onClick={() => {
                  onCreateAnother();
                  onClose();
                }}
                className="w-full px-4 py-3 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 rounded-lg font-medium transition-colors"
              >
                Tạo báo cáo khác
              </button>
            )}

            <button
              onClick={onClose}
              className="w-full px-4 py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

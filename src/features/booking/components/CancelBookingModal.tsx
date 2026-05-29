import { useState, useEffect } from 'react';
import { AlertCircle, X, MessageSquare } from 'lucide-react';
import type { Booking } from '../types/booking.type';

interface CancelBookingModalProps {
  isOpen: boolean;
  booking: Booking | null;
  isLoading: boolean;
  onConfirm: (reason: string | null) => void; // Chuyển giao lý do hủy ra ngoài handler
  onCancel: () => void;
}

export function CancelBookingModal({
  isOpen,
  booking,
  isLoading,
  onConfirm,
  onCancel,
}: CancelBookingModalProps) {
  const [reason, setReason] = useState('');

  // Tự động làm sạch ô nhập lý do cũ mỗi khi đóng/mở hoặc chuyển đổi ô đặt lịch
  useEffect(() => {
    if (isOpen) {
      setReason('');
    }
  }, [isOpen, booking]);

  if (!isOpen || !booking) return null;

  // Xác định trạng thái xem đơn này đã thành Schedule chính thức trên lưới chưa
  const isApproved = booking.status === 'Approved' || String(booking.status) === '2';

  const handleFormSubmit = () => {
    if (isApproved && !reason.trim()) return;
    onConfirm(isApproved ? reason.trim() : null);
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-900/40 via-indigo-900/40 to-purple-900/40 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-150">

        {/* Header Phối Màu Hệ Thống */}
        <div className="px-6 py-5 bg-gradient-to-r from-red-600 to-orange-500 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-white/20 rounded-lg">
              <AlertCircle className="w-5 h-5 text-white animate-pulse" />
            </div>
            <h2 className="text-base font-bold uppercase tracking-wider">
              {isApproved ? 'Hủy lịch chính thức' : 'Rút đơn đăng ký'}
            </h2>
          </div>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded-lg transition-colors duration-150"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thân biểu mẫu thông tin */}
        <div className="p-6 space-y-4">
          <p className="text-sm font-medium text-gray-600">
            {isApproved
              ? 'Lịch đặt phòng Lab này đã được phê duyệt công bố công khai. Hành động hủy sẽ làm giải phóng phòng và gửi mail báo động.'
              : 'Bạn có chắc chắn muốn hủy đơn đăng ký đang nằm trong hàng đợi chờ duyệt này không?'}
          </p>

          {/* Hộp tóm tắt thông tin phòng máy */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2 border border-gray-200 text-xs text-gray-700">
            <div className="flex justify-between">
              <span className="text-gray-500 font-medium">📍 Phòng Lab:</span>
              <span className="font-bold text-gray-900">{booking.roomName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 font-medium">🏢 Tòa nhà:</span>
              <span className="font-bold text-gray-900">{booking.buildingName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 font-medium">📅 Ngày sử dụng:</span>
              <span className="font-bold text-gray-900">
                {new Date(booking.date).toLocaleDateString('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 font-medium">⏰ Khung giờ (VN):</span>
              <span className="font-bold text-orange-600">{booking.startTime} - {booking.endTime}</span>
            </div>
          </div>

          {/* 🚨 PHÂN CHIA RẼ NHÁNH GIAO DIỆN THEO ĐÚNG Ý BẠN */}
          {isApproved ? (
            <div className="space-y-2 animate-in fade-in duration-200">
              <label className="flex items-center gap-1.5 text-xs font-black text-gray-700 uppercase tracking-wide">
                <MessageSquare className="w-4 h-4 text-orange-500" />
                Lý do hủy lịch trình <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Nhập lý do chi tiết (Ví dụ: Dời lịch học bù, thay đổi tiến độ bài học...)"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm bg-white hover:border-gray-400 font-medium resize-none transition-all placeholder:text-gray-400"
              />
            </div>
          ) : (
            <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3.5 leading-relaxed flex gap-2">
              <span>⚠️</span>
              <span>Đơn chờ duyệt sẽ được rút khỏi hàng xếp bận ngay lập tức, hệ thống không yêu cầu bạn phải cung cấp lý do giải trình hành chính.</span>
            </div>
          )}
        </div>

        {/* Thanh Footer Nút Hành Động */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-bold uppercase text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-100 font-medium transition-all disabled:opacity-50"
          >
            Quay lại
          </button>
          <button
            type="button"
            onClick={handleFormSubmit}
            disabled={isLoading || (isApproved && !reason.trim())}
            className="px-4 py-2 text-xs font-bold uppercase text-white bg-red-600 border border-red-600 rounded-xl hover:bg-red-700 shadow-md transition-all disabled:bg-gray-300 disabled:border-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Đang xử lý...
              </>
            ) : (
              'Xác nhận hủy'
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
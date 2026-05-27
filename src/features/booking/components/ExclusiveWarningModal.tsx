import React, { useState, useEffect } from "react";
import { AlertTriangle } from "lucide-react";

interface ExclusiveWarningModalProps {
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ExclusiveWarningModal: React.FC<ExclusiveWarningModalProps> = ({
  isOpen,
  isLoading,
  onClose,
  onConfirm,
}) => {
  const [confirmTextInput, setConfirmTextInput] = useState("");

  // Reset input mỗi khi modal được mở/đóng
  useEffect(() => {
    if (!isOpen) {
      setConfirmTextInput("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const TARGET_TEXT = "XÁC NHẬN HỦY LỊCH TRÙNG";

  return (
    <div className="fixed inset-0 z-[11112] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md overflow-hidden rounded-xl bg-white p-6 shadow-2xl border border-red-200 transform transition-all animate-scale-in">

        {/* Header Alert */}
        <div className="flex items-center gap-3 border-b border-red-100 pb-4 text-red-600">
          <div className="rounded-full bg-red-100 p-2">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">CẢNH BÁO LỊCH ĐỘC QUYỀN</h3>
            <p className="text-xs text-red-500 font-medium">Hành động này có tác động lớn đến hệ thống</p>
          </div>
        </div>

        {/* Nội dung quy chế điều phối */}
        <div className="mt-4 space-y-3 bg-red-50/50 p-4 rounded-lg border border-red-100 text-sm text-gray-700">
          <p className="font-semibold text-red-900">Quyền hạn Bypass trực tiếp từ Phòng Đào tạo:</p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-gray-600">
            <li>Yêu cầu này sẽ <span className="font-bold text-red-600">bỏ qua bước phê duyệt</span> và chuyển thành lịch chính thức (<span className="italic">Schedule</span>) ngay lập tức.</li>
            <li>Hệ thống tự động quét và <span className="font-bold text-red-600">HỦY BỎ/TỪ CHỐI TOÀN BỘ</span> các lịch học khác, yêu cầu tự học của sinh viên bị trùng khung giờ tại phòng máy này.</li>
            <li>Các đối tượng bị ảnh hưởng sẽ nhận thông báo tự động đền bù qua email.</li>
          </ul>
        </div>

        {/* Khối nhập văn bản chứng thực bảo mật */}
        <div className="mt-5 space-y-2">
          <label className="text-xs font-bold text-gray-700 block uppercase tracking-wider">
            Vui lòng gõ lại văn bản dưới đây để xác nhận:
          </label>
          <div className="bg-gray-100 border border-gray-300 rounded px-3 py-1.5 text-center font-mono text-sm text-gray-600 tracking-widest font-bold+">
            {TARGET_TEXT}
          </div>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-center uppercase tracking-wide font-semibold placeholder:normal-case placeholder:font-normal"
            placeholder="Nhập đúng cụm từ trên"
            value={confirmTextInput}
            onChange={(e) => setConfirmTextInput(e.target.value)}
            disabled={isLoading}
          />
        </div>

        {/* Khối Action Buttons */}
        <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-4">
          <button
            type="button"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            onClick={onClose}
            disabled={isLoading}
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            className={`rounded-lg px-5 py-2 text-sm font-semibold text-white shadow-md transition-all ${confirmTextInput === TARGET_TEXT && !isLoading
              ? "bg-red-600 hover:bg-red-700 active:scale-95 cursor-pointer"
              : "bg-gray-300 cursor-not-allowed opacity-60"
              }`}
            disabled={confirmTextInput !== TARGET_TEXT || isLoading}
            onClick={onConfirm}
          >
            {isLoading ? "Đang xử lý..." : "Xác nhận duyệt thẳng"}
          </button>
        </div>

      </div>
    </div>
  );
};
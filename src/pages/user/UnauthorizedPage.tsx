import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react'; // Sử dụng lucide-react cho icon

const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 rounded-2xl shadow-xl border border-gray-100">

        {/* Icon cảnh báo */}
        <div className="flex justify-center">
          <div className="p-4 bg-red-50 rounded-full">
            <ShieldAlert className="w-16 h-16 text-red-500" strokeWidth={1.5} />
          </div>
        </div>

        {/* Nội dung thông báo */}
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Truy cập bị từ chối
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            Rất tiếc, tài khoản của bạn không có quyền hạn để truy cập vào trang này.
            Vui lòng liên hệ quản trị viên nếu bạn cho rằng đây là một sự nhầm lẫn.
          </p>
        </div>

        {/* Các nút hành động */}
        <div className="flex flex-col gap-3 pt-4">
          <button
            onClick={() => navigate(-1)} // Quay lại trang trước đó
            className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all active:scale-95"
          >
            <ArrowLeft size={18} />
            Quay lại trang trước
          </button>

          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-all active:scale-95"
          >
            <Home size={18} />
            Về trang chủ
          </button>
        </div>

        {/* Footer nhỏ */}
        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">
          Error Code: 403 Forbidden
        </p>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Users,
  Loader2,
  Image as ImageIcon,
  CalendarPlus,
  AlertTriangle,
} from 'lucide-react';
import { labroomApi } from '../../features/labroom/api/labroom.api';
import type { LabRoomDto } from '../../features/labroom/types/room.type';

const fallbackImage =
  'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=1200';

const SkeletonBlock = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse rounded-xl bg-slate-200/80 ${className}`} />
);

const LabRoomDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { id = '' } = useParams<{ id: string }>();
  const roomId = Number(id);

  const [room, setRoom] = useState<LabRoomDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoom = async () => {
      if (!Number.isFinite(roomId) || roomId <= 0) {
        setError('ID phòng không hợp lệ. Vui lòng mở lại từ danh sách phòng.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await labroomApi.getRoomById(roomId);
        setRoom(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không thể tải thông tin phòng');
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [roomId]);

  const primaryImage = useMemo(() => {
    if (!room?.images?.length) return fallbackImage;
    return room.images.find((img) => img.isPrimary)?.url || room.images[0].url;
  }, [room]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-100 via-orange-50/30 to-amber-100/60 pb-10">
        <div className="max-w-5xl mx-auto px-6 lg:px-12 py-8">
          <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-sm bg-white">
            <SkeletonBlock className="h-[280px] w-full" />
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <SkeletonBlock className="h-28" />
            <SkeletonBlock className="h-28" />
            <SkeletonBlock className="h-28" />
          </div>

          <div className="mt-6 rounded-2xl p-6 bg-white border border-slate-200 shadow-sm">
            <SkeletonBlock className="h-6 w-40 mb-4" />
            <SkeletonBlock className="h-4 w-full mb-2" />
            <SkeletonBlock className="h-4 w-11/12 mb-2" />
            <SkeletonBlock className="h-4 w-4/6" />
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-slate-600">
            <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
            <span>Đang tải chi tiết phòng...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-6 bg-gradient-to-b from-slate-100 via-orange-50/30 to-amber-100/60">
        <div className="max-w-lg w-full bg-white rounded-3xl border border-orange-100 p-8 text-center shadow-lg">
          <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Không tìm thấy phòng</h1>
          <p className="text-slate-600 mb-6">
            {error || 'Phòng bạn mở có thể đã bị xoá, ngừng hoạt động hoặc đường dẫn không còn hợp lệ.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium transition-colors"
            >
              Quay lại
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors"
            >
              Về trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-orange-50/30 to-amber-100/60 pb-10">
      <section className="relative h-[280px] overflow-hidden">
        <img src={primaryImage} alt={room.roomName} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/10" />

        <div className="absolute inset-0 px-6 lg:px-12 py-8 flex flex-col justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-white/90 hover:text-white w-fit px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div>
            <p className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.15em] font-bold text-orange-100 bg-orange-500/30 px-3 py-1 rounded-full mb-3">
              <Building2 className="w-3 h-3" />
              {room.buildingName || 'Building'}
            </p>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-white">{room.roomName}</h1>
            <p className="text-white/90 mt-2">Mã phòng: {room.roomNo}</p>
          </div>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-6 lg:px-12 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="rounded-2xl p-5 bg-white border border-slate-200 shadow-sm">
            <p className="text-sm text-slate-500 mb-1">Sức chứa</p>
            <p className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-500" />
              {room.capacity}
            </p>
          </div>

          <div className="rounded-2xl p-5 bg-white border border-slate-200 shadow-sm">
            <p className="text-sm text-slate-500 mb-1">Thiết bị</p>
            <p className="text-lg font-semibold text-slate-900">{room.hasEquipment ? 'Có' : 'Không'}</p>
          </div>

          <div className="rounded-2xl p-5 bg-white border border-slate-200 shadow-sm">
            <p className="text-sm text-slate-500 mb-1">Trạng thái</p>
            <p className="text-lg font-semibold text-slate-900">{room.isActive ? 'Active' : 'Inactive'}</p>
          </div>
        </div>

        <div className="rounded-2xl p-6 bg-white border border-slate-200 shadow-sm mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">Mô tả</h2>
          <p className="text-slate-700">{room.description || 'Chưa có mô tả cho phòng này.'}</p>

          <button
            onClick={() =>
              navigate(
                `/book-room?buildingId=${encodeURIComponent(String(room.buildingId))}&roomId=${encodeURIComponent(String(room.id))}`,
              )
            }
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors"
          >
            <CalendarPlus className="w-4 h-4" />
            Book Room
          </button>
        </div>

        {!!room.images?.length && (
          <div className="rounded-2xl p-6 bg-white border border-slate-200 shadow-sm mt-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-orange-500" />
              Hình ảnh phòng
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {room.images.map((img) => (
                <img
                  key={img.id}
                  src={img.url}
                  alt={room.roomName}
                  className="w-full h-28 object-cover rounded-lg border border-slate-200"
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default LabRoomDetailsPage;

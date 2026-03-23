import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock3,
  MapPin,
  Monitor,
  Users,
  Wifi,
  Wrench,
  Loader2,
} from 'lucide-react';
import { useLabRooms, useAvailableSlots } from '../../features/booking/hooks/useRoomBooking';
import {
  getMockRoomById,
  getMockSlotsByRoomAndRange,
} from '../../features/booking/mocks/roomBookingMockData';
import { formatDate } from '../../utils/formatDate';
import type { TimeSlot } from '../../features/slot/types/slot.types';

interface BuildingRoomState {
  id: string | number;
  name: string;
  building: string;
  capacity: number;
  status: 'Available' | 'Occupied' | 'Maintenance';
  image: string;
  images?: string[];
  features: string[];
  nextAvailable?: string;
}

interface LocationState {
  room?: BuildingRoomState;
}

const slotStatusClass: Record<TimeSlot['status'], string> = {
  Available: 'bg-emerald-100 text-emerald-800',
  Booked: 'bg-orange-100 text-orange-800',
  Pending: 'bg-amber-100 text-amber-800',
  Maintenance: 'bg-slate-200 text-slate-700',
};

const LabRoomDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { roomId = '' } = useParams<{ roomId: string }>();
  const location = useLocation();
  const state = (location.state as LocationState | undefined) ?? {};
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);

  const today = useMemo(() => new Date(), []);
  const startDate = useMemo(() => today.toISOString().split('T')[0], [today]);
  const endDate = useMemo(() => {
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    return nextWeek.toISOString().split('T')[0];
  }, [today]);

  const { data: roomsData, isLoading: roomsLoading } = useLabRooms();
  const rooms = roomsData?.rooms ?? [];

  const apiRoom = rooms.find((room) => room.id === roomId);
  const fallbackRoomRaw = getMockRoomById(roomId);
  const fallbackRoom: BuildingRoomState | null = fallbackRoomRaw
    ? {
      id: fallbackRoomRaw.id,
      name: fallbackRoomRaw.name,
      building: fallbackRoomRaw.buildingName,
      capacity: fallbackRoomRaw.capacity,
      status: fallbackRoomRaw.status,
      image: fallbackRoomRaw.image,
      images: fallbackRoomRaw.images,
      features: fallbackRoomRaw.features,
      nextAvailable: fallbackRoomRaw.nextAvailable,
    }
    : null;

  const resolvedRoom = state.room
    ? {
      ...state.room,
      id: String(state.room.id),
    }
    : apiRoom
      ? {
        id: apiRoom.id,
        name: apiRoom.name,
        building: apiRoom.building,
        capacity: apiRoom.capacity,
        status: 'Available' as const,
        image: apiRoom.image ?? 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200',
        features: apiRoom.features,
        nextAvailable: 'Now',
      }
      : fallbackRoom;

  const galleryImages = useMemo(() => {
    if (!resolvedRoom) {
      return [];
    }

    const fromState = resolvedRoom.images ?? [];
    const combined = [resolvedRoom.image, ...fromState].filter(Boolean);

    return Array.from(new Set(combined));
  }, [resolvedRoom]);

  useEffect(() => {
    setActiveGalleryIndex(0);
  }, [roomId]);

  const { data: slotsData, isLoading: slotsLoading } = useAvailableSlots({
    params: {
      roomId,
      startDate,
      endDate,
    },
    enabled: !!roomId,
  });

  const slots = slotsData?.slots?.length
    ? slotsData.slots
    : getMockSlotsByRoomAndRange(roomId, startDate, endDate);

  const sortedUpcoming = [...slots]
    .sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`))
    .slice(0, 10);

  const availableCount = slots.filter((slot) => slot.status === 'Available').length;
  const bookedCount = slots.filter((slot) => slot.status === 'Booked').length;
  const pendingCount = slots.filter((slot) => slot.status === 'Pending').length;

  const statusTone =
    resolvedRoom?.status === 'Available'
      ? {
        labelClass: 'text-emerald-700',
        chipClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        subTextClass: 'text-emerald-700/80',
      }
      : resolvedRoom?.status === 'Occupied'
        ? {
          labelClass: 'text-rose-700',
          chipClass: 'bg-rose-100 text-rose-800 border-rose-200',
          subTextClass: 'text-rose-700/80',
        }
        : {
          labelClass: 'text-amber-700',
          chipClass: 'bg-amber-100 text-amber-800 border-amber-200',
          subTextClass: 'text-amber-700/80',
        };

  if (roomsLoading && !resolvedRoom) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-orange-500 mx-auto mb-3" />
          <p className="text-gray-600">Loading room details...</p>
        </div>
      </div>
    );
  }

  if (!resolvedRoom) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200 p-6 text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Room not found</h1>
          <p className="text-gray-600 mb-5">The selected lab room does not exist or is no longer available.</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-medium"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-orange-50/30 to-amber-100/60">
      <section className="relative h-[280px] overflow-hidden">
        <img src={resolvedRoom.image} alt={resolvedRoom.name} className="w-full h-full object-cover" />
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
              <MapPin className="w-3 h-3" />
              {resolvedRoom.building}
            </p>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-white">{resolvedRoom.name}</h1>
            <p className="text-white/90 mt-2">View room profile, current availability, and upcoming schedule at a glance.</p>
          </div>
        </div>
      </section>

      <main className="relative max-w-7xl mx-auto px-6 lg:px-12 py-8 space-y-6">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-3xl">
          <div className="absolute -top-16 -left-20 h-72 w-72 rounded-full bg-orange-300/20 blur-3xl" />
          <div className="absolute top-48 -right-24 h-80 w-80 rounded-full bg-amber-300/25 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-sky-200/20 blur-3xl" />
        </div>

        {galleryImages.length > 0 && (
          <section
            className="bg-white/95 border border-gray-200 rounded-2xl p-4 lg:p-5 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 animate-fade-in"
            style={{ animationDelay: '0.04s' }}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900">Room Photos</h2>
              <p className="text-xs text-gray-500">{galleryImages.length} images</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              <div className="lg:col-span-2">
                <div className="rounded-xl overflow-hidden border border-gray-200 h-[340px] lg:h-[420px]">
                  <img
                    src={galleryImages[activeGalleryIndex]}
                    alt={`${resolvedRoom.name} view ${activeGalleryIndex + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-[1.03]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-2 gap-3 auto-rows-[82px] sm:auto-rows-[96px] lg:auto-rows-[100px]">
                {galleryImages.slice(0, 4).map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    onClick={() => setActiveGalleryIndex(index)}
                    className={`rounded-lg overflow-hidden border-2 transition-all ${activeGalleryIndex === index
                      ? 'border-orange-500 ring-2 ring-orange-200'
                      : 'border-gray-200 hover:border-orange-300 hover:scale-[1.03]'
                      }`}
                    title={`Open photo ${index + 1}`}
                  >
                    <img
                      src={image}
                      alt={`${resolvedRoom.name} thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="grid grid-cols-1 lg:grid-cols-4 gap-4 animate-fade-in" style={{ animationDelay: '0.08s' }}>
          <div className="rounded-2xl p-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white border border-slate-700 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
            <p className="text-sm text-slate-300 mb-1">Capacity</p>
            <p className="text-2xl font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-300" />
              {resolvedRoom.capacity} seats
            </p>
          </div>

          <div className="rounded-2xl p-5 bg-gradient-to-br from-white to-slate-50 border border-slate-200 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <p className="text-sm text-slate-500 mb-1">Current status</p>
            <div className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold ${statusTone.chipClass}`}>
              {resolvedRoom.status}
            </div>
            <p className={`text-sm mt-2 font-medium ${statusTone.subTextClass}`}>Next available: {resolvedRoom.nextAvailable ?? 'Unknown'}</p>
          </div>

          <div className="lg:col-span-2 relative overflow-hidden rounded-2xl p-5 border border-orange-300 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white shadow-[0_20px_45px_rgba(249,115,22,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_60px_rgba(249,115,22,0.45)]">
            <div className="absolute -right-12 -top-10 h-36 w-36 rounded-full bg-white/20 blur-2xl" />
            <div className="absolute -left-8 -bottom-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            <div>
              <p className="text-sm text-white/80 mb-1 uppercase tracking-wide font-semibold">Booking</p>
              <p className="text-2xl font-black leading-tight">Reserve this room now</p>
              <p className="text-sm text-white/90 mt-1">Prioritize this room quickly with one click booking.</p>
            </div>
            <button
              onClick={() => navigate(`/book-room?roomId=${encodeURIComponent(String(resolvedRoom.id))}`)}
              className="cursor-pointer px-5 py-2.5 rounded-xl bg-white text-orange-700 hover:bg-orange-50 font-bold shadow-lg transition-all duration-200 hover:scale-105"
            >
              Book Room
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in" style={{ animationDelay: '0.12s' }}>
          <div className="lg:col-span-1 rounded-2xl p-5 border border-orange-100 bg-gradient-to-b from-white to-orange-50/50 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Facilities</h2>
            <div className="space-y-2">
              {resolvedRoom.features.map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-gray-700 rounded-lg px-2.5 py-2 transition-colors hover:bg-orange-100/70">
                  {feature.toLowerCase().includes('wifi') ? (
                    <Wifi className="w-4 h-4 text-orange-500" />
                  ) : feature.toLowerCase().includes('screen') || feature.toLowerCase().includes('projector') ? (
                    <Monitor className="w-4 h-4 text-orange-500" />
                  ) : (
                    <Wrench className="w-4 h-4 text-orange-500" />
                  )}
                  <span className="capitalize">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 rounded-2xl p-5 border border-slate-200 bg-gradient-to-b from-slate-50 to-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming 7-day schedule</h2>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-800">Available: {availableCount}</span>
                <span className="px-2 py-1 rounded-full bg-orange-100 text-orange-800">Booked: {bookedCount}</span>
                <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-800">Pending: {pendingCount}</span>
              </div>
            </div>

            {slotsLoading ? (
              <div className="py-10 text-center text-gray-500">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-orange-500" />
                Loading schedule...
              </div>
            ) : sortedUpcoming.length === 0 ? (
              <div className="py-10 text-center text-gray-500">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                No schedule entries found for the next 7 days.
              </div>
            ) : (
              <div className="space-y-2 max-h-[420px] overflow-auto pr-1">
                {sortedUpcoming.map((slot) => (
                  <div key={slot.id} className="border border-gray-200 rounded-xl p-3 flex items-center justify-between gap-3 bg-white/85 transition-all duration-200 hover:border-orange-200 hover:bg-white hover:shadow-sm hover:-translate-y-0.5">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{formatDate(slot.date, 'MMM dd, yyyy')}</p>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Clock3 className="w-4 h-4" />
                        {slot.startTime} - {slot.endTime}
                      </p>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${slotStatusClass[slot.status]}`}>
                      {slot.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default LabRoomDetailsPage;
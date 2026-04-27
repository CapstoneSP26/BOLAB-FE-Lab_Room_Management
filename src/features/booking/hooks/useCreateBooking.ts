import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingApi } from '../api/bookingApi';
import type { Booking, CreateBookingCommand, CreateBookingResponse } from '../types/booking.type';

const makePendingBooking = (
  command: CreateBookingCommand,
  bookingId: string,
): Booking => {
  const start = new Date(command.startTime);
  const end = new Date(command.endTime);

  return {
    id: bookingId,
    roomId: command.labRoomId,
    roomName: '',
    buildingName: '',
    startTime: start.toISOString(),
    endTime: end.toISOString(),
    date: start.toISOString().slice(0, 10),
    status: 'PendingApproval',
    purpose: '',
    userName: '',
    studentCount: command.studentCount,
    createdAt: new Date().toISOString(),
  };
};

const upsertPendingBooking = (
  current:
    | { data: Booking[]; total: number; page: number; limit: number }
    | undefined,
  pendingBooking: Booking,
) => {
  if (!current) return current;

  const nextData = [pendingBooking, ...current.data.filter((item) => String(item.id) !== String(pendingBooking.id))];

  return {
    ...current,
    data: nextData,
    total: Math.max(current.total + 1, nextData.length),
  };
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation<CreateBookingResponse, unknown, CreateBookingCommand>({
    mutationFn: (command: CreateBookingCommand) => bookingApi.createBooking(command),

    onSuccess: async (data, command) => {
      const pendingBooking = makePendingBooking(command, data.id);

      queryClient.setQueriesData(
        { queryKey: ['bookingHistory'] },
        (current) => upsertPendingBooking(current as { data: Booking[]; total: number; page: number; limit: number } | undefined, pendingBooking),
      );

      queryClient.setQueriesData(
        { queryKey: ['bookingHistoryPage'] },
        (current) => upsertPendingBooking(current as { data: Booking[]; total: number; page: number; limit: number } | undefined, pendingBooking),
      );

      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['bookingHistory'] });
      queryClient.invalidateQueries({ queryKey: ['bookingHistoryPage'] });
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      void queryClient.refetchQueries({ queryKey: ['bookingHistory'] });
      void queryClient.refetchQueries({ queryKey: ['bookingHistoryPage'] });
    },
  });
};

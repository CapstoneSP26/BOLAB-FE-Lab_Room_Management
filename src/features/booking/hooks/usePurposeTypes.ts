// src/features/booking/hooks/usePurposeTypes.ts
import { useQuery } from "@tanstack/react-query";
import { bookingApi } from "../api/bookingApi";

export const usePurposeTypes = () => {
  return useQuery({
    queryKey: ['purpose-types'],
    queryFn: () => bookingApi.getPurposes(),
    staleTime: 24 * 60 * 60 * 1000, // Cache 24h
  });
};
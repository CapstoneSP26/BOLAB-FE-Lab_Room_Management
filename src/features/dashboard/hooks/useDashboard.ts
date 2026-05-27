import { useQuery } from "@tanstack/react-query";
import {
  getDashboardStats,
  getPendingRequests,
  getUnresolvedIncidents,
  getUserProfile,
} from "../api/dashboardApi";
import type { DateRange, TimeFilter } from "../types/dashboard.type";

export const useDashboardStats = (timeType?: TimeFilter, dateRange?: DateRange) => {
  return useQuery({
    queryKey: ["dashboard-stats", timeType, dateRange?.startDate, dateRange?.endDate],
    queryFn: () => getDashboardStats(timeType, dateRange),
    retry: false,
  });
};

export const usePendingRequests = () => {
  return useQuery({
    queryKey: ["pending-requests"],
    queryFn: getPendingRequests,
  });
};

export const useUnresolvedIncidents = () => {
  return useQuery({
    queryKey: ["unresolved-incidents"],
    queryFn: getUnresolvedIncidents,
  });
};

export const useUserProfile = () => {
  return useQuery({
    queryKey: ["user-profile"],
    queryFn: getUserProfile,
  });
};

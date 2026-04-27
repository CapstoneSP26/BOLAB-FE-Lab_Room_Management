import { useQuery } from "@tanstack/react-query";
import {
  getDashboardStats,
  getPendingRequests,
  getUnresolvedIncidents,
  getUserProfile,
} from "../api/dashboardApi";

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: getDashboardStats,
    retry: false,
    refetchOnReconnect: true,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    staleTime: 15000,
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

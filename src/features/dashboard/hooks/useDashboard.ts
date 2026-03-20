import { useQuery } from '@tanstack/react-query';
import {
  getDashboardStats,
  getPendingRequests,
  getUnresolvedIncidents,
  getUserProfile,
} from '../services/dashboardService';

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
    refetchInterval: 30 * 1000, // Refresh every 30 seconds
  });
};

export const usePendingRequests = () => {
  return useQuery({
    queryKey: ['pending-requests'],
    queryFn: getPendingRequests,
    refetchInterval: 10 * 1000, // Refresh every 10 seconds
  });
};

export const useUnresolvedIncidents = () => {
  return useQuery({
    queryKey: ['unresolved-incidents'],
    queryFn: getUnresolvedIncidents,
    refetchInterval: 15 * 1000, // Refresh every 15 seconds
  });
};

export const useUserProfile = () => {
  return useQuery({
    queryKey: ['user-profile'],
    queryFn: getUserProfile,
  });
};

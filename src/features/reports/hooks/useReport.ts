/**
 * Report Hooks
 * React Query hooks for report operations
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createReport,
  getReportReasons,
  getMyReports,
  getReportDetail,
  getReports,
  resolveReport,
} from "../api/reportApi";
import type {
  CreateReportRequest,
  GetMyReportsRequest,
  GetReportDetailRequest,
  ReportReasonOption,
  GetReportsRequest,
  Report,
  CreateReportResponse,
  ResolveReportResponse,
} from "../types/report.type";
import type { PagedResponse } from "../../../types/pagination.types";

// Query keys for cache management
export const QUERY_KEYS = {
  REPORT_REASONS: "report-reasons",
  MY_REPORTS: "my-reports",
  REPORT_DETAIL: "report-detail",
  REPORTS: "reports",
} as const;

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Hook to get my reports
 */
export interface UseMyReportsOptions extends GetMyReportsRequest {
  enabled?: boolean;
}

export const useMyReports = (options: UseMyReportsOptions = {}) => {
  const { enabled = true, ...params } = options;

  return useQuery({
    queryKey: [QUERY_KEYS.MY_REPORTS, params],
    queryFn: () => getMyReports(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled,
  });
};

/**
 * Hook to get report detail
 */
export interface UseReportDetailOptions extends GetReportDetailRequest {
  enabled?: boolean;
}

export const useReportDetail = (options: UseReportDetailOptions) => {
  const { enabled = true, ...params } = options;

  return useQuery({
    queryKey: [QUERY_KEYS.REPORT_DETAIL, params.reportId],
    queryFn: () => getReportDetail(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: enabled && !!params.reportId,
  });
};

/**
 * Hook to get report reasons list
 */
export const useReportReasons = () => {
  return useQuery<ReportReasonOption[]>({
    queryKey: [QUERY_KEYS.REPORT_REASONS],
    queryFn: async () => {
      const response = await getReportReasons();
      return response.data;
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
};

/**
 * Hook to get reports list
 * Use for both unresolved list page and resolved history page
 */
export interface UseReportsOptions extends GetReportsRequest {
  enabled?: boolean;
}
export const useReports = (options: UseReportsOptions = {}) => {
  const { enabled = true, ...params } = options;

  return useQuery<PagedResponse<Report>>({
    queryKey: [QUERY_KEYS.REPORTS, params],
    queryFn: async () => {
      const response = await getReports(params);
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    enabled,
  });
};

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Hook to create a new report
 */
export interface UseCreateReportOptions {
  onSuccess?: (data: CreateReportResponse) => void;
  onError?: (error: Error) => void;
}

export const useCreateReport = (options: UseCreateReportOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReportRequest) => createReport(data),
    onSuccess: (data) => {
      // Invalidate my reports cache to refetch
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.MY_REPORTS],
      });

      // Call custom success handler if provided
      options.onSuccess?.(data);
    },
    onError: (error: Error) => {
      // Call custom error handler if provided
      options.onError?.(error);
    },
  });
};

/**
 * Hook to resolve a report
 */
export interface UseResolveReportOptions {
  onSuccess?: (data: ResolveReportResponse) => void;
  onError?: (error: Error) => void;
}

export const useResolveReport = (options: UseResolveReportOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isResolved }: { id: string; isResolved: boolean }) =>
      resolveReport(id, { isResolved }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.REPORTS],
      });

      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.REPORT_DETAIL],
      });

      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.MY_REPORTS],
      });

      options.onSuccess?.(data);
    },
    onError: (error: Error) => {
      options.onError?.(error);
    },
  });
};

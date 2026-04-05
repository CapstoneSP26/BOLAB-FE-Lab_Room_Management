import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { scheduleManagementApi } from "../api/scheduleManagementApi";
import type { ScheduleManagementListParams } from "../types/scheduleManagement.type";

export const scheduleManagementQueryKey = (
  params: ScheduleManagementListParams,
) => ["schedule-management", params] as const;

export function useScheduleManagementList(
  params: ScheduleManagementListParams,
  enabled = true,
) {
  return useQuery({
    queryKey: scheduleManagementQueryKey(params),
    queryFn: () => scheduleManagementApi.getPaged(params),
    placeholderData: keepPreviousData,
    enabled,
  });
}

import { useCallback, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSignalRListener } from "../../../hooks/useSignalRListener";
import { useRealtime } from "../../../app/providers/RealtimeProvider";

export const useDashboardRealtime = () => {
  const queryClient = useQueryClient();
  const connection = useRealtime();
  const debounceRef = useRef<number | null>(null);
  const lastRefreshAtRef = useRef(0);

  const refreshDashboard = useCallback(() => {
    if (debounceRef.current !== null) {
      window.clearTimeout(debounceRef.current);
    }

    debounceRef.current = window.setTimeout(() => {
      const now = Date.now();
      const isCoolingDown = now - lastRefreshAtRef.current < 5000;
      const isDashboardFetching =
        queryClient.getQueryState(["dashboard-stats"])?.fetchStatus === "fetching";

      if (isCoolingDown || isDashboardFetching) {
        return;
      }

      lastRefreshAtRef.current = now;

      void queryClient.invalidateQueries({
        queryKey: ["dashboard-stats"],
        refetchType: "active",
      });
      void queryClient.invalidateQueries({
        queryKey: ["pending-requests"],
        refetchType: "active",
      });
      void queryClient.invalidateQueries({
        queryKey: ["unresolved-incidents"],
        refetchType: "active",
      });
    }, 500);
  }, [queryClient]);

  // Listen only to dedicated dashboard events to avoid noisy refetch loops.
  useSignalRListener("dashboard.updated", refreshDashboard);
  useSignalRListener("dashboard.overview.updated", refreshDashboard);

  useEffect(() => {
    if (!connection) {
      return;
    }

    connection.onreconnected(refreshDashboard);
  }, [connection, refreshDashboard]);

  useEffect(() => {
    return () => {
      if (debounceRef.current !== null) {
        window.clearTimeout(debounceRef.current);
      }
    };
  }, []);
};

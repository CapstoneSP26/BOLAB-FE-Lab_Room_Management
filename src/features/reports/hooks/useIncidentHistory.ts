import { useCallback, useEffect, useState } from "react";
import { getIncidentList } from "../api/incidentHistoryApi";
import type { Incident } from "../types/type";

export function useIncidentHistory() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Incident[]>([]);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getIncidentList();
      setItems(response?.data ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return {
    loading,
    items,
    setItems,
    reload,
  };
}

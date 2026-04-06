import { useMemo } from "react";
import { useBuildings } from "../../building/hooks/useBuildings";

export type CampusOption = { id: number; name: string };

/**
 * Danh sách campus (id + name) suy từ buildings — UI chọn theo tên, API dùng id.
 */
export function useCampusSelectOptions() {
  const { data, isLoading, isFetching } = useBuildings({
    params: { pageNumber: 1, pageSize: 1000 },
  });

  const options = useMemo((): CampusOption[] => {
    const items = data?.items ?? [];
    const map = new Map<number, string>();
    for (const b of items) {
      if (b.campusId != null && b.campusName?.trim()) {
        map.set(b.campusId, b.campusName.trim());
      }
    }
    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
      );
  }, [data?.items]);

  return {
    options,
    isLoading: isLoading || isFetching,
  };
}

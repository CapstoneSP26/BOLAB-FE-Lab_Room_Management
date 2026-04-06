import { useMemo } from "react";
import { useManagedLabRooms } from "./useLabRooms";

type ResolveLabRoomOptions = {
  /** Đã có từ API schedule — ưu tiên dùng trực tiếp */
  labRoomId?: number | null;
  /** Tên phòng hiển thị khi không có id — tra cứu qua danh sách LabRoom */
  labRoomName?: string | null;
  enabled: boolean;
};

/**
 * Khi DTO schedule không có `labRoomId` nhưng có `labRoomName`,
 * tra cứu id phòng phù hợp qua GET /LabRoom (tìm theo keyword).
 */
export function useResolveLabRoomIdForSchedule(options: ResolveLabRoomOptions) {
  const { labRoomId, labRoomName, enabled } = options;
  const name = labRoomName?.trim() ?? "";

  const hasExplicitId = labRoomId != null && labRoomId > 0;
  const needsLookup = enabled && !hasExplicitId && name.length > 0;

  const listQuery = useManagedLabRooms({
    pageNumber: 1,
    pageSize: 50,
    searchTerm: name,
    includeBuilding: true,
  });

  const resolvedLabRoomId = useMemo(() => {
    if (hasExplicitId) return labRoomId!;
    if (!name || !listQuery.data?.items?.length) return undefined;
    const items = listQuery.data.items;
    const lower = name.toLowerCase();
    const exact = items.find(
      (r) =>
        r.roomName?.trim().toLowerCase() === lower ||
        r.roomNo?.trim().toLowerCase() === lower,
    );
    return exact?.id ?? items[0]?.id;
  }, [hasExplicitId, labRoomId, name, listQuery.data?.items]);

  return {
    resolvedLabRoomId,
    isResolving: needsLookup && listQuery.isFetching,
  };
}

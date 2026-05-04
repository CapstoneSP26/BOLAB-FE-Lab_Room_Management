type ResolveLabRoomOptions = {
  /** Đã có từ API schedule — ưu tiên dùng trực tiếp */
  labRoomId?: number | null;
  enabled: boolean;
};

/**
 * Resolve nhanh nếu schedule đã có labRoomId.
 * Với endpoint public hiện tại, FE không nên gọi GET /LabRoom vì bị authorize.
 */
export function useResolveLabRoomIdForSchedule(options: ResolveLabRoomOptions) {
  const { labRoomId } = options;

  return {
    resolvedLabRoomId: labRoomId != null && labRoomId > 0 ? labRoomId : undefined,
    isResolving: false,
  };
}

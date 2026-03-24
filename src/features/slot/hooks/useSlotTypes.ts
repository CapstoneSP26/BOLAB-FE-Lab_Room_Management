import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { slotApi } from "../api/slotApi";
import { useSlotStore } from "../../../store/slotStore";

export const useSlotTypes = (campusId?: number) => {
  const setSlotTypes = useSlotStore(state => state.setSlotTypes);

  const query = useQuery({
    queryKey: ['slotTypes', campusId],
    queryFn: () => slotApi.getSlotTypes(campusId),
    staleTime: Infinity, // Vì dữ liệu hiếm khi thay đổi
  });

  // Đồng bộ vào Store khi có dữ liệu mới
  useEffect(() => {
    if (query.data?.data) {
      setSlotTypes(query.data.data);
    }
  }, [query.data, setSlotTypes]);

  return query;
};
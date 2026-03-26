import { useQuery } from "@tanstack/react-query";
import { labroomApi } from "../api/labroom.api";
import type { PolicyType } from "../types/policy.type";

export const useLabPolicies = (labRoomId?: number) => {
  return useQuery({
    queryKey: ['labPolicies', labRoomId],
    queryFn: () => labroomApi.getLabPolicies(labRoomId || 0), // Truyền 0 hoặc một giá trị mặc định nếu labRoomId không hợp lệ
    staleTime: Infinity,
    enabled: !!labRoomId, // Chỉ chạy query khi có labRoomId hợp lệ
    select: (data) => {
      // Chuyển đổi mảng thành một Object/Map để FE truy xuất nhanh hơn O(1)
      return data.data.reduce((acc, policy) => {
        acc[policy.policyKey] = policy.value;
        return acc;
      }, {} as Record<PolicyType, string>);
    }
  });
};
import { useQuery } from "@tanstack/react-query";
import { labroomApi } from "../api/labroom.api";
import type { PolicyTypeEnum } from "../types/policy.type";
import { isPolicyType } from "../utils/policy.util";

export const useLabPolicies = (labRoomId: number) => {
  return useQuery({
    queryKey: ["labPolicies", labRoomId],
    queryFn: () => labroomApi.getLabPolicies(labRoomId),
    staleTime: Infinity,
    enabled: !!labRoomId && labRoomId > 0,

    select: (data) => {
      return data.reduce((acc, policy) => {
        const policyKey = policy.policyKeyName || policy.policyKey;

        if (isPolicyType(policyKey)) {
          acc[policyKey] = policy.policyValue;
        }

        return acc;
      }, {} as Record<PolicyTypeEnum, string>);
    },
  });
};

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { groupImportApi } from "../api/groupImportApi";
import type {
  CommitGroupImportRequest,
  ValidateGroupImportRequest,
} from "../types/importGroup.type";

export const useGroupImport = () => {
  const queryClient = useQueryClient();

  const validateGroupImportMutation = useMutation({
    mutationFn: (payload: ValidateGroupImportRequest) =>
      groupImportApi.validateGroupImport(payload),
  });

  const commitGroupImportMutation = useMutation({
    mutationFn: (payload: CommitGroupImportRequest) =>
      groupImportApi.commitGroupImport(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["groupMembers"] });
    },
  });

  return {
    validateGroupImportMutation,
    commitGroupImportMutation,
    validateGroupRows: validateGroupImportMutation.mutateAsync,
    commitGroupRows: commitGroupImportMutation.mutateAsync,
  };
};

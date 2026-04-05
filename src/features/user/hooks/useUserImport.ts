import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userImportApi } from "../api/userImportApi";
import type {
  CommitUserImportRequest,
  ValidateUserImportRequest,
} from "../types/importUser.type";

export const useUserImport = () => {
  const queryClient = useQueryClient();

  const validateUserImportMutation = useMutation({
    mutationFn: (payload: ValidateUserImportRequest) =>
      userImportApi.validateUserImport(payload),
  });

  const commitUserImportMutation = useMutation({
    mutationFn: (payload: CommitUserImportRequest) =>
      userImportApi.commitUserImport(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
  });

  return {
    validateUserImportMutation,
    commitUserImportMutation,
    validateUserRows: validateUserImportMutation.mutateAsync,
    commitUserRows: commitUserImportMutation.mutateAsync,
  };
};

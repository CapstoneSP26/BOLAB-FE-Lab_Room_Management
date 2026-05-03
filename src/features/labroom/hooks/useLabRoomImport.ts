import { useMutation, useQueryClient } from "@tanstack/react-query";
import { labRoomImportApi } from "../api/labRoomImportApi";
import type {
  CommitLabRoomImportRequest,
  ValidateLabRoomImportRequest,
} from "../types/importLabRoom.type";

export const useLabRoomImport = () => {
  const queryClient = useQueryClient();

  const validateLabRoomImportMutation = useMutation({
    mutationFn: (payload: ValidateLabRoomImportRequest) =>
      labRoomImportApi.validateLabRoomImport(payload),
  });

  const commitLabRoomImportMutation = useMutation({
    mutationFn: (payload: CommitLabRoomImportRequest) =>
      labRoomImportApi.commitLabRoomImport(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["labrooms"] });
      queryClient.invalidateQueries({ queryKey: ["buildings"] });
    },
  });

  return {
    validateLabRoomImportMutation,
    commitLabRoomImportMutation,
    validateLabRoomRows: validateLabRoomImportMutation.mutateAsync,
    commitLabRoomRows: commitLabRoomImportMutation.mutateAsync,
  };
};

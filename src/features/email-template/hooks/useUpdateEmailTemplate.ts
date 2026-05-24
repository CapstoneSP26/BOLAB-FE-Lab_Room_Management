import { useMutation, useQueryClient } from "@tanstack/react-query";
import { emailTemplateApi } from "../api/emailtemplate.api";

export const useUpdateEmailTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: {
        content: string;
      };
    }) => emailTemplateApi.updateTemplate(id, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["emailTemplates"],
        type: "active"
      });
    },
  });
};
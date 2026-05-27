import { useQuery } from "@tanstack/react-query";
import { emailTemplateApi } from "../api/emailtemplate.api";
import type { EmailTemplate } from "../types/email-template.type";

export const useEmailTemplates = () => {
  return useQuery<EmailTemplate[]>({
    queryKey: ["emailTemplates"],
    queryFn: emailTemplateApi.getTemplates,
    staleTime: Infinity,
  });
};
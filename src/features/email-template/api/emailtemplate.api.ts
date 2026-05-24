import axiosInstance from "../../../api/axios";

export const emailTemplateApi = {
  getTemplates: () => axiosInstance.get("/EmailTemplate").then((res) => res.data),
  getTemplateById: (id: number) => axiosInstance.get(`/EmailTemplate/${id}`).then((res) => res.data),
  updateTemplate: (id: number, payload: { content: string }) =>
    axiosInstance.put(`/EmailTemplate/${id}`, payload).then((res) => res.data),
};
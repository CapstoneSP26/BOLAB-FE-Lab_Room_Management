// features/ai/services/aiApi.ts
import { axiosInstance } from "../../../api";
import type { AIParseResponse, AIParseRequest } from "../types/ai.type";


export const aiApi = {
  /**
   * Phân tích câu lệnh của người dùng và gợi ý lịch đặt
   */
  parseAndSuggest: (data: AIParseRequest): Promise<AIParseResponse> =>
    axiosInstance.post<AIParseResponse>("/AI/parse-and-suggest", data)
      .then((res) => res.data)
  ,

  /**
   * Tạo đặt lịch dựa trên gợi ý của AI (nếu bạn có endpoint riêng)
   * Hoặc bạn có thể dùng chung với bookingApi.create
   */
  confirmAIBooking: (bookingData: any) =>
    axiosInstance.post("/AI/confirm-booking", bookingData)
      .then((res) => res.data)

};
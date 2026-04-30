// features/ai/hooks/useAISmartBooking.ts
import { useMutation } from "@tanstack/react-query";
import { aiApi } from "../api/aiApi";
import { useToast } from "../../../hooks/useToast"; // Nếu bạn có hook toast

export const useAISmartBooking = () => {
  const toast = useToast();

  // Mutation cho việc phân tích văn bản
  const parseMutation = useMutation({
    mutationFn: aiApi.parseAndSuggest,
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Không thể phân tích yêu cầu AI", "error");
    }
  });

  // Mutation cho việc xác nhận đặt phòng
  const confirmMutation = useMutation({
    mutationFn: aiApi.confirmAIBooking,
    onSuccess: () => {
      toast.success("Đặt phòng thành công!", "success");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Đặt phòng thất bại", "error");
    }
  });

  return {
    // Phase 1: Phân tích
    parse: parseMutation.mutate,
    parseAsync: parseMutation.mutateAsync,
    isParsing: parseMutation.isPending,
    parseData: parseMutation.data,

    // Phase 2: Xác nhận
    confirm: confirmMutation.mutate,
    isConfirming: confirmMutation.isPending,
    resetAI: () => {
      parseMutation.reset();
      confirmMutation.reset();
    }
  };
};
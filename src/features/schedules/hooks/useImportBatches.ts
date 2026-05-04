import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ImportBatchDto } from "../types/import-batch.type";
import { axiosInstance } from "../../../api";
import type { PagedList } from "../../profile";

export const useImportBatches = (semesterCode: string) => {
  const queryClient = useQueryClient();

  const batchesQuery = useQuery({
    // 1. Query Key chứa semesterCode để tự động fetch lại khi người dùng đổi kỳ trong dropdown
    queryKey: ["import-batches", semesterCode],
    queryFn: async () => {
      const response = await axiosInstance.get<PagedList<ImportBatchDto>>(`/schedules/import-batch`, {
        params: {
          // 2. Map đúng với tên field "SemesterName" trong GetImportBatchesQuery của BE
          SemesterName: semesterCode,
          PageNumber: 1,
          PageSize: 100 // Lấy đủ danh sách đợt trong kỳ (BE của bạn để mặc định là 0)
        }
      });

      // Vì BE trả về PagedList, chúng ta lấy trường Items (hoặc data tùy cấu trúc PagedList của bạn)
      return response.data.items ?? [];
    },
    // Chỉ fetch khi có semesterCode
    enabled: !!semesterCode,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => axiosInstance.delete(`/schedules/import-batch/${id}`),
    onSuccess: () => {
      // Invalidate để cập nhật lại danh sách sau khi xóa
      queryClient.invalidateQueries({ queryKey: ["import-batches"] });
    },
  });

  return { batchesQuery, deleteMutation };
};
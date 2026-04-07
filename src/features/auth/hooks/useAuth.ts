import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../../../store/useAuthStore";
import { authApi } from "../api/auth.api";
import { useEffect } from "react";

export const useAuth = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const query = useQuery({
    queryKey: ["auth"],
    queryFn: () => authApi.getProfile(), // API này sẽ dựa vào Cookie HttpOnly để nhận diện User
    staleTime: Infinity, // Vì thông tin user hiếm khi thay đổi trong 1 phiên làm việc
  })

  useEffect(() => {
    if (query.data) {
      setAuth(query.data);
    }
  }, [query.data, setAuth]);

  return query;
}
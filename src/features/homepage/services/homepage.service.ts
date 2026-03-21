import axiosInstance from '../../../api/axios';
import type {
  GetRoomsRequest,
  GetRoomsResponse,
  GetBuildingsRequest,
  GetBuildingsResponse,
  GetStatsResponse,
} from '../types';

/**
 * ===== DATA ACCESS LAYER =====
 * Rules:
 * - Chỉ dùng axiosInstance
 * - Phải định nghĩa TypeScript Interface cho cả Request và Response
 * - Không được catch error (để UI hoặc React Query xử lý)
 */

const HOMEPAGE_API = {
  ROOMS: '/rooms',
  BUILDINGS: '/buildings',
  STATS: '/stats',
};

/**
 * Lấy danh sách phòng/lab
 */
export const getRooms = async (
  params: GetRoomsRequest = {}
): Promise<GetRoomsResponse> => {
  const response = await axiosInstance.get<GetRoomsResponse>(
    HOMEPAGE_API.ROOMS,
    { params }
  );
  return response.data;
};

/**
 * Lấy danh sách tòa nhà
 */
export const getBuildings = async (
  params: GetBuildingsRequest = {}
): Promise<GetBuildingsResponse> => {
  const response = await axiosInstance.get<any>(
    HOMEPAGE_API.BUILDINGS,
    { params }
  );
  // Backend có thể trả về array trực tiếp hoặc wrapped { data: [...] }
  const rawData = response.data;
  const buildingsArray = Array.isArray(rawData) ? rawData : (rawData?.data ?? []);
  return {
    data: buildingsArray,
    total: buildingsArray.length,
  };
};

/**
 * Lấy thống kê tổng quan
 */
export const getStats = async (): Promise<GetStatsResponse> => {
  const response = await axiosInstance.get<GetStatsResponse>(
    HOMEPAGE_API.STATS
  );
  return response.data;
};

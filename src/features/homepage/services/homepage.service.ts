import axiosInstance from '../../../config/axios';
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
  ROOMS: '/api/rooms',
  BUILDINGS: '/api/buildings',
  STATS: '/api/stats',
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
  const response = await axiosInstance.get<GetBuildingsResponse>(
    HOMEPAGE_API.BUILDINGS,
    { params }
  );
  return response.data;
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

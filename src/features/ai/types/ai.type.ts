/**
 * Request gửi lên AI để phân tích
 */
export interface AIParseRequest {
  userPrompt: string;
}

/**
 * Cấu trúc một gợi ý đặt phòng từ AI
 */
export interface AISuggestion {
  title: string;
  description: string;
  labRoomId: number;
  date: string; // Định dạng YYYY-MM-DD
  startTime: string; // Định dạng HH:mm
  endTime: string; // Định dạng HH:mm
  reasonForSuggestion: string;
  matchScore: number;
}

/**
 * Thông tin chi tiết về đặt phòng chính (nếu AI trích xuất thành công)
 */
export interface AIPrimaryBooking {
  labRoomId: number | null;
  roomName: string | null;
  baseDate: string | null;
  startTime: string | null;
  endTime: string | null;
  studentCount: number;
  recurringCount: number;
  purposeTypeId: number | null;
}

/**
 * Response trả về từ AI Controller
 */
export interface AIParseResponse {
  status: 'Success' | 'MissingRoom' | 'ConflictDetected' | 'ParseError' | 'SystemError' | 'QuotaExceeded';
  message: string;
  confidence: number;
  primaryBooking: AIPrimaryBooking | null;
  suggestions: AISuggestion[];
  conflictDetails: string[];
  requiresUserConfirmation: boolean;
}

export type AIChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};
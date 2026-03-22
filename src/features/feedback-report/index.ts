/**
 * Feedback & Report Feature
 * Public API exports
 */

// Types
export type {
  Report,
  ReportReason,
  ReportReasonOption,
  ReportStatus,
  CreateReportRequest,
  GetMyReportsRequest,
  ImagePreview,
} from './types';

export {
  REPORT_REASON_LABELS,
  REPORT_STATUS_LABELS,
  FALLBACK_REPORT_REASONS,
} from './types';

// Hooks
export {
  useMyReports,
  useReportDetail,
  useCreateReport,
  useReportReasons,
  QUERY_KEYS,
} from './hooks/useReport';

// Components
export { ImageUploadArea } from './components/ImageUploadArea';
export { ReasonSelector } from './components/ReasonSelector';
export { ReportSuccessModal } from './components/ReportSuccessModal';

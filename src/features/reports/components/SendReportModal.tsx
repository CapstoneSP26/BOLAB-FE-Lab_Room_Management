/**
 * Send Report Modal
 * Modal for lecturers to send lab room reports with images
 */

import React, { useState, useCallback, useEffect, useMemo } from "react";
import { X } from "lucide-react";
import { useBuildings } from "../../building/hooks/useBuildings";
import { useLabRooms } from "../../labroom/hooks/useLabRooms";
import type { Building, BuildingDto } from "../../building/types/building.type";
import type { LabRoomDto } from "../../labroom/types/room.type";

import { FALLBACK_REPORT_REASONS } from "../types/report.type";
import { ImageUploadArea } from "./ImageUploadArea";
import { ReasonSelector } from "./ReasonSelector";
import { ReportSuccessModal } from "./ReportSuccessModal";
import { useCreateReport } from "../hooks/useReport";
import { useReportReasons } from "../hooks/useReport";

import type {
  Report,
  CreateReportResponse,
  ImagePreview,
} from "../types/report.type";
import { useToast } from "../../../hooks/useToast";

interface SendReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SendReportModal: React.FC<SendReportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const toast = useToast();
  // Form state
  const [selectedBuildingId, setSelectedBuildingId] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [reason, setReason] = useState<string | "">("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Success modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submittedReport, setSubmittedReport] = useState<Report | null>(null);

  // Fetch rooms for dropdown
  const { data: buildingsData, isLoading: buildingsLoading } = useBuildings({});
  const { data: roomsData, isLoading: roomsLoading } = useLabRooms({});
  const { data: reasonsData, isLoading: reasonsLoading } = useReportReasons();

  // Create report mutation
  const createReportMutation = useCreateReport({
    onSuccess: (response: CreateReportResponse) => {
      setSubmittedReport(response.data);
      setShowSuccessModal(true);
      toast.success(
        "Báo cáo đã được gửi!",
        "Chúng tôi sẽ xem xét và xử lý báo cáo của bạn sớm nhất.",
      );
      // Reset form
      resetForm();
    },
    onError: (error: Error) => {
      console.error("Failed to create report:", error);
      toast.error(
        "Gửi báo cáo thất bại",
        "Vui lòng kiểm tra lại thông tin và thử lại.",
      );
    },
  });

  const resetForm = () => {
    setSelectedBuildingId("");
    setSelectedRoomId("");
    setReason("");
    setDescription("");
    setImages([]);
    setErrors({});
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  // Image handling
  const handleImagesAdd = useCallback((files: File[]) => {
    const newImages: ImagePreview[] = files.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...newImages]);
  }, []);

  const handleImageRemove = useCallback((id: string) => {
    setImages((prev) => {
      const image = prev.find((img) => img.id === id);
      if (image) {
        URL.revokeObjectURL(image.preview);
      }
      return prev.filter((img) => img.id !== id);
    });
  }, []);

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedBuildingId) {
      newErrors.building = "Vui lòng chọn tòa nhà";
    }

    if (!selectedRoomId) {
      newErrors.room = "Vui lòng chọn phòng";
    }

    if (!reason) {
      newErrors.reason = "Vui lòng chọn lý do báo cáo";
    }

    if (!description.trim()) {
      newErrors.description = "Vui lòng nhập mô tả chi tiết";
    } else if (description.trim().length < 10) {
      newErrors.description = "Mô tả phải có ít nhất 10 ký tự";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    createReportMutation.mutate({
      roomId: selectedRoomId,
      reason: reason as string,
      description: description.trim(),
      images: images.map((img) => img.file),
    });
  };

  const buildings = buildingsData ?? [];
  const selectedBuilding = useMemo(
    () =>
      buildings.find(
        (item: BuildingDto) => String(item.id) === selectedBuildingId,
      ),
    [buildings, selectedBuildingId],
  );

  const rooms = roomsData?.items || [];
  const filteredRooms = useMemo(() => {
    if (!selectedBuilding) {
      return [];
    }

    const selectedBuildingName = selectedBuilding.buildingName.toLowerCase();
    const selectedBuildingIdNormalized = String(
      selectedBuilding.id,
    ).toLowerCase();

    return rooms.filter((room: LabRoomDto) => {
      const roomBuilding = String(room.buildingName).toLowerCase();
      return (
        roomBuilding === selectedBuildingName ||
        roomBuilding === selectedBuildingIdNormalized ||
        roomBuilding.includes(selectedBuildingName)
      );
    });
  }, [rooms, selectedBuilding]);

  useEffect(() => {
    if (!selectedRoomId) {
      return;
    }

    const roomExists = filteredRooms.some(
      (room: LabRoomDto) => String(room.id) === selectedRoomId,
    );

    if (!roomExists) {
      setSelectedRoomId("");
    }
  }, [filteredRooms, selectedRoomId]);

  const reasonOptions = useMemo(() => {
    if (!reasonsData || reasonsData.length === 0) {
      return FALLBACK_REPORT_REASONS;
    }

    const fallbackMap = new Map(
      FALLBACK_REPORT_REASONS.map((reason) => [reason.value, reason]),
    );

    const merged = FALLBACK_REPORT_REASONS.map(
      (reason) =>
        reasonsData.find((item) => item.value === reason.value) ?? reason,
    );

    const extraReasons = reasonsData.filter(
      (reason) => !fallbackMap.has(reason.value),
    );

    return [...merged, ...extraReasons];
  }, [reasonsData]);

  const isSubmitting = createReportMutation.isPending;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl flex-shrink-0">
            <div>
              <h2 className="text-2xl font-bold">Báo cáo vấn đề phòng Lab</h2>
              <p className="text-purple-100 text-sm mt-1">
                Gửi báo cáo về các vấn đề thiết bị, vệ sinh hoặc hư hỏng
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              disabled={isSubmitting}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden modal-scrollbar">
            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Building Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Chọn tòa nhà <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedBuildingId}
                  onChange={(e) => {
                    setSelectedBuildingId(e.target.value);
                    setSelectedRoomId("");
                    setErrors((prev) => ({ ...prev, building: "", room: "" }));
                  }}
                  disabled={buildingsLoading || isSubmitting}
                  className={`
                  w-full px-4 py-3 rounded-lg border
                  bg-white text-gray-900
                  focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                  disabled:bg-gray-100 disabled:cursor-not-allowed
                  transition-all duration-200
                  ${errors.building ? "border-red-500" : "border-gray-300"}
                `}
                >
                  <option value="">-- Chọn tòa nhà --</option>
                  {buildings.map((building: BuildingDto) => (
                    <option key={building.id} value={building.id}>
                      {building.buildingName}
                    </option>
                  ))}
                </select>
                {errors.building && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {errors.building}
                  </p>
                )}
              </div>

              {/* Room Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Chọn phòng <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedRoomId}
                  onChange={(e) => {
                    setSelectedRoomId(e.target.value);
                    setErrors((prev) => ({ ...prev, room: "" }));
                  }}
                  disabled={roomsLoading || isSubmitting || !selectedBuildingId}
                  className={`
                  w-full px-4 py-3 rounded-lg border
                  bg-white text-gray-900
                  focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                  disabled:bg-gray-100 disabled:cursor-not-allowed
                  transition-all duration-200
                  ${errors.room ? "border-red-500" : "border-gray-300"}
                `}
                >
                  <option value="">
                    {selectedBuildingId
                      ? "-- Chọn phòng --"
                      : "-- Chọn tòa nhà trước --"}
                  </option>
                  {filteredRooms.map((room: LabRoomDto) => (
                    <option key={room.id} value={room.id}>
                      {room.roomName} - {room.buildingName}
                    </option>
                  ))}
                </select>
                {errors.room && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {errors.room}
                  </p>
                )}
              </div>

              {/* Reason Selection */}
              <ReasonSelector
                value={reason}
                onChange={(newReason: string) => {
                  setReason(newReason);
                  setErrors((prev) => ({ ...prev, reason: "" }));
                }}
                reasons={reasonOptions}
                isLoading={reasonsLoading && reasonOptions.length === 0}
                disabled={isSubmitting}
                error={errors.reason}
              />

              {/* Description */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Mô tả chi tiết <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setErrors((prev) => ({ ...prev, description: "" }));
                  }}
                  disabled={isSubmitting}
                  rows={6}
                  placeholder="Mô tả chi tiết về vấn đề bạn gặp phải..."
                  className={`
                  w-full px-4 py-3 rounded-lg border
                  bg-white text-gray-900
                  focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                  disabled:bg-gray-100 disabled:cursor-not-allowed
                  transition-all duration-200 resize-none
                  ${errors.description ? "border-red-500" : "border-gray-300"}
                `}
                />
                <div className="flex justify-between items-start">
                  <div>
                    {errors.description && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {errors.description}
                      </p>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {description.length} ký tự
                  </p>
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Hình ảnh (Tùy chọn)
                </label>
                <p className="text-sm text-gray-500 mb-3">
                  Thêm hình ảnh để mô tả rõ hơn về vấn đề
                </p>
                <ImageUploadArea
                  images={images}
                  onImagesAdd={handleImagesAdd}
                  onImageRemove={handleImageRemove}
                  maxImages={10}
                  disabled={isSubmitting}
                />
              </div>

              {/* Help Text */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <svg
                    className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="text-sm text-purple-800">
                    <p className="font-medium mb-1">Lưu ý khi gửi báo cáo:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Mô tả chi tiết và chính xác vấn đề bạn gặp phải</li>
                      <li>Thêm ảnh để giúp bộ phận kỹ thuật hiểu rõ hơn</li>
                      <li>Báo cáo sẽ được xử lý trong vòng 24-48 giờ</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="
                  px-6 py-3 
                  bg-white hover:bg-gray-50 
                  text-gray-700 border-2 border-gray-300 
                  rounded-lg font-medium 
                  transition-colors
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="
                  flex-1 px-6 py-3 
                  bg-gradient-to-r from-purple-600 to-pink-600
                  hover:from-purple-700 hover:to-pink-700
                  text-white rounded-lg font-medium 
                  transition-all
                  disabled:opacity-50 disabled:cursor-not-allowed
                  flex items-center justify-center gap-2
                "
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                        />
                      </svg>
                      Gửi báo cáo
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <ReportSuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          onClose(); // Close main modal too
        }}
        report={null}
        onCreateAnother={() => {
          setShowSuccessModal(false);
          resetForm();
        }}
      />
    </>
  );
};

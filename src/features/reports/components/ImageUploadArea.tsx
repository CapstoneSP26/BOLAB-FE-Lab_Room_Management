/**
 * ImageUploadArea Component
 * Drag & drop and click to upload multiple images
 */

import React, { useCallback, useRef } from 'react';
import type { ImagePreview } from '../types/report.type';

interface ImageUploadAreaProps {
  images: ImagePreview[];
  onImagesAdd: (files: File[]) => void;
  onImageRemove: (id: string) => void;
  maxImages?: number;
  disabled?: boolean;
}

export const ImageUploadArea: React.FC<ImageUploadAreaProps> = ({
  images,
  onImagesAdd,
  onImageRemove,
  maxImages = 10,
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const handleFileSelect = useCallback(
    (files: FileList | null) => {
      if (!files || disabled) return;

      const validFiles: File[] = [];
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (allowedTypes.includes(file.type)) {
          validFiles.push(file);
        }
      }

      // Check max images limit
      const remaining = maxImages - images.length;
      const filesToAdd = validFiles.slice(0, remaining);

      if (filesToAdd.length > 0) {
        onImagesAdd(filesToAdd);
      }
    },
    [images.length, maxImages, onImagesAdd, disabled]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (!disabled) {
        handleFileSelect(e.dataTransfer.files);
      }
    },
    [handleFileSelect, disabled]
  );

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
    // Reset input value to allow re-uploading the same file
    e.target.value = '';
  };

  const canAddMore = images.length < maxImages;

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {canAddMore && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
          className={`
            relative border-2 border-dashed rounded-lg p-8
            transition-all duration-200 cursor-pointer
            ${isDragging
              ? 'border-brand-500 bg-brand-50'
              : 'border-gray-300 hover:border-brand-400 hover:bg-gray-50'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/jpg,image/webp"
            multiple
            onChange={handleInputChange}
            disabled={disabled}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center text-center">
            <svg
              className="w-12 h-12 text-gray-400 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>

            <p className="text-gray-700 font-medium mb-1">
              Kéo thả ảnh vào đây hoặc nhấn để chọn
            </p>

            <p className="text-sm text-gray-500">
              PNG, JPG, JPEG, WEBP (Tối đa {maxImages} ảnh)
            </p>

            <p className="text-xs text-gray-400 mt-2">
              Đã thêm {images.length}/{maxImages} ảnh
            </p>
          </div>
        </div>
      )}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <div
              key={image.id}
              className="relative group aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-brand-400 transition-colors"
            >
              <img
                src={image.preview}
                alt={image.file.name}
                className="w-full h-full object-cover"
              />

              {/* Remove button */}
              <button
                type="button"
                onClick={() => onImageRemove(image.id)}
                disabled={disabled}
                className="
                  absolute top-2 right-2 
                  bg-red-500 hover:bg-red-600 
                  text-white rounded-full p-1.5
                  opacity-0 group-hover:opacity-100
                  transition-opacity duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
                title="Xóa ảnh"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              {/* File name overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-2 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                {image.file.name}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

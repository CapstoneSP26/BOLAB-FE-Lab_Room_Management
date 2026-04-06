import React, { useEffect, useState, useRef } from 'react';
import { Camera, X, CheckCircle } from 'lucide-react';
import { useCameraStream } from '../hooks/useCameraStream';
import { useMl5FaceDetection } from '../hooks/useMl5FaceDetection';

interface RecognitionResult {
  success: boolean;
  studentId: string;
  date: string;
  image?: string; // base64 encoded image from backend
}

interface PendingRecognition {
  result: RecognitionResult;
}

interface FaceScanContainerProps {
  onFaceScanned?: (data: RecognitionResult) => void;
  onError?: (error: string) => void;
  isLoading?: boolean;
  onCaptureComplete?: () => void;
}

export const FaceScanContainer: React.FC<FaceScanContainerProps> = ({
  onFaceScanned,
  onError,
  isLoading = false,
  onCaptureComplete,
}) => {
  const { videoRef, isStreaming, error: cameraError, startCamera, stopCamera, captureFrame } = useCameraStream();
  const { isModelLoaded, loadModel, detectFaces, clearTrackedFaces } = useMl5FaceDetection();
  const [status, setStatus] = useState<'loading' | 'ready' | 'detecting' | 'error'>('loading');
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectedCount, setDetectedCount] = useState(0);
  const [pendingRecognition, setPendingRecognition] = useState<PendingRecognition | null>(null);
  const detectionIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastCaptureRef = useRef<number>(0);
  const CAPTURE_COOLDOWN = 500; // ms between detection checks

  // Initialize camera and load ml5 model
  useEffect(() => {
    const initialize = async () => {
      try {
        setStatus('loading');
        console.log('🚀 Initializing camera and face detection...');
        
        await loadModel();
        console.log('✅ Models loaded');
        
        await startCamera();
        console.log('✅ Camera started');
        
        clearTrackedFaces();
        setStatus('ready');
        console.log('✅ Ready for scanning');
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Initialization failed';
        console.error('❌ Init error:', errorMsg);
        setStatus('error');
        onError?.(errorMsg);
      }
    };

    initialize();

    return () => {
      console.log('🛑 Cleaning up camera');
      stopCamera();
    };
  }, [loadModel, startCamera, stopCamera, clearTrackedFaces, onError]);

  // Smart face detection with tracking - only send NEW faces
  useEffect(() => {
    if (!isStreaming || !isModelLoaded || isProcessing) return;

    console.log('📹 Starting face detection loop...');
    let detectionCount = 0;

    detectionIntervalRef.current = setInterval(async () => {
      detectionCount++;
      const now = Date.now();
      if (now - lastCaptureRef.current < CAPTURE_COOLDOWN) return;

      const canvas = captureFrame();
      if (!canvas) return;

      try {
        setStatus('detecting');

        // Run ml5 face detection
        const detectionResult = await detectFaces(canvas);
        
        if (detectionCount % 10 === 0) {
          console.log(`📊 Detection #${detectionCount}:`, {
            success: detectionResult.success,
            faces: detectionResult.faces.length,
            isNewFace: detectionResult.isNewFace,
          });
        }

        if (!detectionResult.success || detectionResult.faces.length === 0) {
          setDetectedCount(0);
          setStatus('ready');
          return;
        }

        setDetectedCount(detectionResult.faces.length);

        // KEY OPTIMIZATION: Only send if this is a NEW face
        if (!detectionResult.isNewFace) {
          // Face already tracked, skip sending
          setStatus('ready');
          return;
        }

        console.log('🎯 NEW FACE DETECTED! Sending to backend...');

        // New face detected! Mark time and send to backend
        lastCaptureRef.current = now;

        // Convert canvas to blob and send to backend
        canvas.toBlob(
          async (blob) => {
            if (!blob) {
              setStatus('ready');
              return;
            }

            setIsProcessing(true);
            const formData = new FormData();
            formData.append('image', blob, 'face.png');

            try {
              console.log('📤 Sending face to backend API...');
              const response = await fetch('/api/attendance/recognize-face', {
                method: 'POST',
                body: formData,
              });

              if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
              }

              const result: RecognitionResult = await response.json();
              console.log('✅ API Response:', result);

              // Process successful face recognition - show confirmation modal
              if (result.success && result.studentId) {
                console.log('👤 Student matched:', result.studentId);
                setPendingRecognition({ result });
                console.log('🖼️ Showing confirmation modal...');
              }

              setStatus('ready');
              setIsProcessing(false);
            } catch (err) {
              console.error('❌ Capture error:', err);
              const errorMsg = err instanceof Error ? err.message : 'Failed to send frame to backend';
              onError?.(errorMsg);
              setStatus('ready');
              setIsProcessing(false);
            }
          },
          'image/png'
        );
      } catch (err) {
        console.error('❌ Detection error:', err);
        setStatus('ready');
      }
    }, CAPTURE_COOLDOWN);

    return () => {
      console.log('🛑 Stopping detection loop');
      if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
    };
  }, [isStreaming, isModelLoaded, isProcessing, captureFrame, detectFaces, onFaceScanned, onCaptureComplete, onError]);

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'bg-yellow-500';
      case 'ready':
        return 'bg-green-500';
      case 'detecting':
        return 'bg-blue-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'loading':
        return 'Initializing camera...';
      case 'ready':
        return isProcessing ? 'Processing face...' : 'Ready - Position your face';
      case 'detecting':
        return 'Scanning face...';
      case 'error':
        return 'Camera error';
      default:
        return 'Unknown status';
    }
  };

  const handleConfirmRecognition = () => {
    if (pendingRecognition) {
      console.log('✅ Confirmed recognition for:', pendingRecognition.result.studentId);
      onFaceScanned?.(pendingRecognition.result);
      onCaptureComplete?.();
      setPendingRecognition(null);
    }
  };

  const handleRejectRecognition = () => {
    if (pendingRecognition) {
      console.log('❌ Rejected recognition');
      setPendingRecognition(null);
      setStatus('ready');
      // Allow re-scanning: reset the timeout so we can detect this face again
      clearTrackedFaces();
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Status Bar */}
      <div className={`flex items-center gap-2 p-4 rounded-lg text-white ${getStatusColor()}`}>
        {status === 'loading' && <Camera className="animate-spin" size={20} />}
        {status === 'detecting' && <CheckCircle size={20} />}
        <span className="font-medium">{getStatusText()}</span>
      </div>

      {/* Error Messages */}
      {cameraError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
          <X size={20} className="flex-shrink-0 mt-0.5" />
          <div>
            <p>{cameraError}</p>
          </div>
        </div>
      )}

      {/* Video Container */}
      <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden shadow-lg">
        {/* Main Video Feed */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          style={{ transform: 'scaleX(-1)' }} // Mirror for selfie view
        />

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
              <p className="text-white text-sm">Processing...</p>
            </div>
          </div>
        )}

        {/* Corner Guides for Face Positioning */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-16 h-16 border-4 border-green-500 rounded-lg opacity-50" />
          <div className="absolute top-1/4 right-1/4 w-16 h-16 border-4 border-green-500 rounded-lg opacity-50" />
          <div className="absolute bottom-1/4 left-1/4 w-16 h-16 border-4 border-green-500 rounded-lg opacity-50" />
          <div className="absolute bottom-1/4 right-1/4 w-16 h-16 border-4 border-green-500 rounded-lg opacity-50" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-gray-100 rounded-lg p-3 text-center">
          <p className="text-sm text-gray-600">Status</p>
          <p className="text-lg font-bold text-gray-900">
            {status === 'detecting' ? 'Scanning' : status === 'ready' ? 'Ready' : 'Init'}
          </p>
        </div>
        <div className="bg-purple-100 rounded-lg p-3 text-center">
          <p className="text-sm text-purple-600">Faces Detected</p>
          <p className="text-lg font-bold text-purple-900">{detectedCount}</p>
        </div>
        <div className="bg-blue-100 rounded-lg p-3 text-center">
          <p className="text-sm text-blue-600">Processing</p>
          <p className="text-lg font-bold text-blue-900">{isProcessing ? 'Yes' : 'No'}</p>
        </div>
        <div className="bg-green-100 rounded-lg p-3 text-center">
          <p className="text-sm text-green-600">Camera</p>
          <p className="text-lg font-bold text-green-900">{isStreaming ? 'On' : 'Off'}</p>
        </div>
      </div>

      {/* Confirmation Modal */}
      {pendingRecognition && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 space-y-4">
            {/* Title */}
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Xác nhận nhận diện sinh viên</h3>
              <button
                onClick={handleRejectRecognition}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Captured Image */}
            <div className="rounded-lg overflow-hidden bg-gray-100">
              <img
                src={
                  pendingRecognition.result.image
                    ? `data:image/png;base64,${pendingRecognition.result.image}`
                    : 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect fill="%23f0f0f0" width="300" height="300"/><text x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23999">No image</text></svg>'
                }
                alt="Captured face"
                className="w-full h-auto"
                style={{ maxHeight: '300px', objectFit: 'cover' }}
              />
            </div>

            {/* Student Information */}
            <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Mã sinh viên:</span>
                <span className="text-lg font-bold text-blue-600">{pendingRecognition.result.studentId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Thời gian:</span>
                <span className="text-sm text-gray-700">
                  {new Date(pendingRecognition.result.date).toLocaleTimeString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Trạng thái:</span>
                <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm font-semibold">✓ Thành công</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleRejectRecognition}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors"
              >
                Bỏ qua
              </button>
              <button
                onClick={handleConfirmRecognition}
                className="flex-1 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle size={18} />
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FaceScanContainer;

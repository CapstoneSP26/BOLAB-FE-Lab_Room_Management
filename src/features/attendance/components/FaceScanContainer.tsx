import React, { useEffect, useState, useRef } from 'react';
import { Camera, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useCameraStream } from '../hooks/useCameraStream';
import { useFaceApiDetection } from '../hooks/useFaceApiDetection';

interface RecognitionResult {
  success: boolean;
  studentCode?: string;
  studentId?: string;
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
  scheduleId?: string;
}

export const FaceScanContainer: React.FC<FaceScanContainerProps> = ({
  onFaceScanned,
  onError,
  onCaptureComplete,
  scheduleId,
}) => {
  const { videoRef, isStreaming, error: cameraError, startCamera, stopCamera, captureFrame } = useCameraStream();
  const { isModelLoaded, loadModel, detectFaces, clearTrackedFaces } = useFaceApiDetection();
  const [status, setStatus] = useState<'loading' | 'ready' | 'detecting' | 'error'>('loading');
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectedCount, setDetectedCount] = useState(0);
  const [pendingRecognition, setPendingRecognition] = useState<PendingRecognition | null>(null);
  const [isDetectionActive, setIsDetectionActive] = useState(true);
  const detectionIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastCaptureRef = useRef<number>(0);
  const CAPTURE_COOLDOWN = 500; // ms between detection checks

  // Initialize camera and load face-api model
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
    if (!isStreaming || !isModelLoaded || isProcessing || !isDetectionActive) return;

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

        // Run face-api detection
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
            formData.append('file', blob, 'face.png');
            if (scheduleId) {
              formData.append('scheduleId', scheduleId);
            }

            try {
              console.log('📤 Sending face to backend API...');
              const response = await fetch('https://chance-unpledged-coauthor.ngrok-free.dev/api/recognize', {
                method: 'POST',
                body: formData,
              });

              if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
              }

              const result: RecognitionResult = await response.json();
              console.log('✅ API Response:', result);

              // Process successful or failed face recognition - show result modal
              if (result.studentCode) {
                console.log('👤 Recognition result:', result);
                setIsDetectionActive(false);
                setPendingRecognition({ result });
                console.log('🖼️ Showing result modal...');
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
  }, [isStreaming, isModelLoaded, isProcessing, isDetectionActive, captureFrame, detectFaces, onFaceScanned, onCaptureComplete, onError]);

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

  const handleContinueScan = () => {
    if (pendingRecognition) {
      console.log('🔄 Continuing scan...');
      onFaceScanned?.(pendingRecognition.result);
      setPendingRecognition(null);
      setDetectedCount(0);
      clearTrackedFaces();
      setIsDetectionActive(true);
      setStatus('ready');
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
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          style={{ transform: 'scaleX(-1)' }}
        />

        {/* Detection Count Overlay */}
        {detectedCount > 0 && (
          <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
            {detectedCount} face{detectedCount > 1 ? 's' : ''} detected
          </div>
        )}
      </div>

      {/* Result Modal */}
      {pendingRecognition && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full space-y-6">
            {/* Status Header */}
            <div className="flex items-center gap-4">
              {pendingRecognition.result.success ? (
                <CheckCircle size={48} className="text-green-500 flex-shrink-0" />
              ) : (
                <AlertCircle size={48} className="text-red-500 flex-shrink-0" />
              )}
              <h3 className="text-2xl font-bold">
                {pendingRecognition.result.success ? 'Điểm danh thành công' : 'Điểm danh thất bại'}
              </h3>
            </div>

            {/* Scanned Image */}
            {pendingRecognition.result.image && (
              <div className="flex justify-center bg-gray-100 p-4 rounded-lg">
                <img
                  src={`data:image/png;base64,${pendingRecognition.result.image}`}
                  alt="Scanned face"
                  className="w-80 h-80 object-cover rounded-lg border-4 border-gray-300 shadow-lg"
                />
              </div>
            )}

            {/* Student Info */}
            <div className="space-y-3 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
              <p className="text-base text-gray-700">
                <span className="font-bold text-lg">Mã sinh viên:</span>
                <span className="ml-3 text-lg font-semibold text-blue-600">{pendingRecognition.result.studentCode || 'N/A'}</span>
              </p>
              <p className="text-base text-gray-700">
                <span className="font-bold text-lg">Thời gian quét:</span>
                <span className="ml-3 text-lg">{new Date(pendingRecognition.result.date).toLocaleString('vi-VN', { timeZone: 'UTC' })}</span>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={handleContinueScan}
                className="flex-1 px-6 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition"
              >
                Tiếp tục quét?
              </button>
              <button
                onClick={() => {
                  onCaptureComplete?.();
                  setPendingRecognition(null);
                }}
                className="flex-1 px-6 py-3 bg-gray-500 text-white text-lg font-semibold rounded-lg hover:bg-gray-600 transition"
              >
                Dừng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

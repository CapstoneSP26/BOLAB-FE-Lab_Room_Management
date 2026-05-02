import React, { useEffect, useState, useRef } from 'react';
import { Camera, X, CheckCircle } from 'lucide-react';
import { useCameraStream } from '../hooks/useCameraStream';
import { useFaceApiDetection } from '../hooks/useFaceApiDetection';

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
  scheduleId?: string;
}

export const FaceScanContainer: React.FC<FaceScanContainerProps> = ({
  onFaceScanned,
  onError,
  isLoading = false,
  onCaptureComplete,
  scheduleId,
}) => {
  const { videoRef, isStreaming, error: cameraError, startCamera, stopCamera, captureFrame } = useCameraStream();
  const { isModelLoaded, loadModel, detectFaces, clearTrackedFaces } = useFaceApiDetection();
  const [status, setStatus] = useState<'loading' | 'ready' | 'detecting' | 'error'>('loading');
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectedCount, setDetectedCount] = useState(0);
  const [pendingRecognition, setPendingRecognition] = useState<PendingRecognition | null>(null);
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
            formData.append('image', blob, 'face.png');
            if (scheduleId) {
              formData.append('scheduleId', scheduleId);
            }

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

      {/* Confirmation Modal */}
      {pendingRecognition && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4 space-y-4">
            <h3 className="text-lg font-semibold">Confirm Recognition</h3>
            <p className="text-gray-600">Student ID: <strong>{pendingRecognition.result.studentId}</strong></p>
            <div className="flex gap-2">
              <button
                onClick={handleConfirmRecognition}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Confirm
              </button>
              <button
                onClick={handleRejectRecognition}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

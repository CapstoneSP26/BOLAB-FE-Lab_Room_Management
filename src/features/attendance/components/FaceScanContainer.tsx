import React, { useEffect, useRef, useState } from 'react';
import { Camera, X, CheckCircle } from 'lucide-react';
import { useCameraStream } from '../hooks/useCameraStream';
import { useMl5FaceDetection } from '../hooks/useMl5FaceDetection';

interface RecognitionResult {
  success: boolean;
  studentId: string;
  date: string;
  image?: string;
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
  onCaptureComplete,
}) => {
  const { videoRef, isStreaming, error: cameraError, startCamera, stopCamera, captureFrame } = useCameraStream();
  const { isModelLoaded, loadModel, detectFaces, clearTrackedFaces } = useMl5FaceDetection();
  const [status, setStatus] = useState<'loading' | 'ready' | 'detecting' | 'error'>('loading');
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectedCount, setDetectedCount] = useState(0);
  const detectionIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastCaptureRef = useRef<number>(0);
  const CAPTURE_COOLDOWN = 1200;

  useEffect(() => {
    const initialize = async () => {
      try {
        setStatus('loading');
        await loadModel();
        await startCamera();
        clearTrackedFaces();
        setStatus('ready');
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Initialization failed';
        setStatus('error');
        onError?.(errorMsg);
      }
    };

    initialize();
    return () => {
      stopCamera();
    };
  }, [loadModel, startCamera, stopCamera, clearTrackedFaces, onError]);

  useEffect(() => {
    if (!isStreaming || !isModelLoaded || isProcessing) return;

    detectionIntervalRef.current = setInterval(async () => {
      const now = Date.now();
      if (now - lastCaptureRef.current < CAPTURE_COOLDOWN) return;

      const canvas = captureFrame();
      if (!canvas || !canvas.width || !canvas.height) return;

      try {
        setStatus('detecting');
        const detectionResult = await detectFaces(canvas);

        if (!detectionResult.success || detectionResult.faces.length === 0) {
          setDetectedCount(0);
          setStatus('ready');
          return;
        }

        setDetectedCount(detectionResult.faces.length);
        lastCaptureRef.current = now;

        canvas.toBlob(async (blob) => {
          if (!blob) {
            setStatus('ready');
            return;
          }

          setIsProcessing(true);

          try {
            const formData = new FormData();
            formData.append('file', blob, 'face.png');

            console.log('[FaceScan] sending POST /api/recognize', { fileSize: blob.size });
            const response = await fetch('https://chance-unpledged-coauthor.ngrok-free.dev/api/recognize', {
              method: 'POST',
              body: formData,
            });

            if (!response.ok) {
              throw new Error(`API error: ${response.status}`);
            }

            const result: RecognitionResult = await response.json();
            if (result.success && result.studentId) {
              onFaceScanned?.(result);
              onCaptureComplete?.();
            }

            setStatus('ready');
          } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to send frame to backend';
            onError?.(errorMsg);
            setStatus('ready');
          } finally {
            setIsProcessing(false);
          }
        }, 'image/png');
      } catch {
        setStatus('ready');
      }
    }, 100);

    return () => {
      if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
    };
  }, [isStreaming, isModelLoaded, isProcessing, captureFrame, detectFaces, onFaceScanned, onCaptureComplete, onError]);

  return (
    <div className="w-full space-y-4">
      <div className={`flex items-center gap-2 p-4 rounded-lg text-white ${status === 'loading' ? 'bg-yellow-500' : status === 'detecting' ? 'bg-blue-500' : status === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
        {status === 'loading' && <Camera className="animate-spin" size={20} />}
        {status === 'detecting' && <CheckCircle size={20} />}
        <span className="font-medium">
          {status === 'loading'
            ? 'Initializing camera...'
            : status === 'detecting'
              ? 'Scanning face...'
              : isProcessing
                ? 'Sending face to API...'
                : 'Ready - Position your face'}
        </span>
      </div>

      {cameraError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
          <X size={20} className="flex-shrink-0 mt-0.5" />
          <p>{cameraError}</p>
        </div>
      )}

      <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden shadow-lg">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          style={{ transform: 'scaleX(-1)' }}
        />

        {detectedCount > 0 && (
          <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
            {detectedCount} face{detectedCount > 1 ? 's' : ''} detected
          </div>
        )}
      </div>
    </div>
  );
};

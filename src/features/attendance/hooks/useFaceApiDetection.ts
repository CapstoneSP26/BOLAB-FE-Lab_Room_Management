import { useCallback, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';

interface DetectedFace {
  confidence: number;
  box: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface FaceScanResult {
  success: boolean;
  faces: DetectedFace[];
  isNewFace: boolean;
  faceId?: string;
}

const FACE_CONFIDENCE_THRESHOLD = 0.5;
const FACE_TRACKING_TIMEOUT = 5000;
const FACE_API_MODEL_URL =
  import.meta.env.VITE_FACE_API_MODEL_URL ||
  'https://justadudewhohacks.github.io/face-api.js/models';

/**
 * Hook for face detection using face-api.js.
 * Includes smart tracking to only process newly detected faces.
 */
export const useFaceApiDetection = () => {
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const trackedFacesRef = useRef<Map<string, number>>(new Map());
  const loadingRef = useRef(false);

  const loadModel = useCallback(async () => {
    if (loadingRef.current || isModelLoaded) {
      setIsModelLoaded(true);
      return;
    }

    loadingRef.current = true;

    try {
      setError(null);
      console.log('🚀 Loading face-api.js model...');

      await faceapi.nets.tinyFaceDetector.loadFromUri(FACE_API_MODEL_URL);

      console.log('✅ face-api.js model loaded');
      setIsModelLoaded(true);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to load face-api.js model';
      console.error('❌ Model loading error:', errorMessage);
      setError(errorMessage);
    } finally {
      loadingRef.current = false;
    }
  }, [isModelLoaded]);

  const generateFaceId = (box: { x: number; y: number }): string => {
    const gridX = Math.floor(box.x / 20);
    const gridY = Math.floor(box.y / 20);
    return `face_${gridX}_${gridY}`;
  };

  const detectFaces = useCallback(
    async (canvas: HTMLCanvasElement): Promise<FaceScanResult> => {
      if (!isModelLoaded) {
        return {
          success: false,
          faces: [],
          isNewFace: false,
        };
      }

      try {
        const detections = await faceapi.detectAllFaces(
          canvas,
          new faceapi.TinyFaceDetectorOptions({
            inputSize: 416,
            scoreThreshold: FACE_CONFIDENCE_THRESHOLD,
          }),
        );

        if (!detections || detections.length === 0) {
          return {
            success: true,
            faces: [],
            isNewFace: false,
          };
        }

        const now = Date.now();
        const trackedFaces = trackedFacesRef.current;

        for (const [faceId, timestamp] of trackedFaces.entries()) {
          if (now - timestamp > FACE_TRACKING_TIMEOUT) {
            trackedFaces.delete(faceId);
          }
        }

        const faces: DetectedFace[] = [];
        let isNewFace = false;

        for (const detection of detections) {
          const box = detection.box;
          const faceId = generateFaceId({ x: box.x, y: box.y });

          faces.push({
            confidence: detection.score,
            box: {
              x: box.x,
              y: box.y,
              width: box.width,
              height: box.height,
            },
          });

          if (!trackedFaces.has(faceId)) {
            isNewFace = true;
          }
          trackedFaces.set(faceId, now);
        }

        return {
          success: true,
          faces,
          isNewFace,
          faceId:
            faces.length > 0
              ? generateFaceId({ x: faces[0].box.x, y: faces[0].box.y })
              : undefined,
        };
      } catch (err) {
        console.error('Detection error:', err);
        return {
          success: false,
          faces: [],
          isNewFace: false,
        };
      }
    },
    [isModelLoaded],
  );

  const clearTrackedFaces = useCallback(() => {
    trackedFacesRef.current.clear();
  }, []);

  return {
    isModelLoaded,
    error,
    loadModel,
    detectFaces,
    clearTrackedFaces,
  };
};

export default useFaceApiDetection;
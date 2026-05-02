import { useCallback, useRef, useState, useEffect } from 'react';

declare global {
  interface Window {
    ml5: any;
  }
}

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

export const useMl5FaceDetection = () => {
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const detectorRef = useRef<any>(null);
  const trackedFacesRef = useRef<Map<string, number>>(new Map());
  const loadingRef = useRef(false);

  useEffect(() => {
    const checkMl5 = setInterval(() => {
      if (window.ml5) {
        console.log('✅ ml5.js loaded from CDN');
        clearInterval(checkMl5);
      }
    }, 100);

    return () => clearInterval(checkMl5);
  }, []);

  const loadModel = useCallback(async () => {
    if (loadingRef.current || isModelLoaded || detectorRef.current) {
      setIsModelLoaded(true);
      return;
    }

    loadingRef.current = true;
    try {
      setError(null);
      console.log('🚀 Loading ml5.js face detection...');

      if (!window.ml5) {
        throw new Error('ml5.js not loaded yet. Wait for CDN to load.');
      }

      console.log('⏳ Initializing detector...');
      const detector = await window.ml5.faceApi({
        withLandmarks: true,
        withDescriptors: false,
        maxFaces: 5,
      });

      console.log('✅ ml5.js face detection ready');
      detectorRef.current = detector;
      setIsModelLoaded(true);
      loadingRef.current = false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load model';
      console.error('❌ Model loading error:', errorMessage);
      setError(errorMessage);
      loadingRef.current = false;
    }
  }, [isModelLoaded]);

  const generateFaceId = (box: { x: number; y: number; width: number; height: number }): string => {
    const gridX = Math.floor(box.x / 20);
    const gridY = Math.floor(box.y / 20);
    return `face_${gridX}_${gridY}`;
  };

  const detectFaces = useCallback(async (canvas: HTMLCanvasElement): Promise<FaceScanResult> => {
    if (!detectorRef.current) {
      return { success: false, faces: [], isNewFace: false };
    }

    try {
      const predictions: any[] = await detectorRef.current.detect(canvas);

      if (!predictions || predictions.length === 0) {
        return { success: true, faces: [], isNewFace: false };
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

      for (const prediction of predictions) {
        const detection = prediction?.detection ?? prediction;
        const confidence = detection?.confidence ?? 0;
        if (confidence < FACE_CONFIDENCE_THRESHOLD) {
          continue;
        }

        const box = detection?.box;
        if (!box) {
          continue;
        }

        const normalizedBox = Array.isArray(box)
          ? { x: box[0], y: box[1], width: box[2], height: box[3] }
          : {
              x: box.x ?? 0,
              y: box.y ?? 0,
              width: box.width ?? 0,
              height: box.height ?? 0,
            };

        const faceId = generateFaceId(normalizedBox);
        faces.push({ confidence, box: normalizedBox });

        if (!trackedFaces.has(faceId)) {
          isNewFace = true;
        }
        trackedFaces.set(faceId, now);
      }

      return {
        success: true,
        faces,
        isNewFace,
        faceId: faces.length > 0 ? generateFaceId(faces[0].box) : undefined,
      };
    } catch (err) {
      console.error('Detection error:', err);
      return { success: false, faces: [], isNewFace: false };
    }
  }, []);

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

export default useMl5FaceDetection;

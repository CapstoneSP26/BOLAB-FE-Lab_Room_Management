import { useCallback, useRef, useState, useEffect } from 'react';

// ml5.js loads from CDN/window
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
  isNewFace: boolean; // True if this is a face we haven't seen before
  faceId?: string;
}

const FACE_CONFIDENCE_THRESHOLD = 0.5;
const FACE_TRACKING_TIMEOUT = 5000; // Forget face after 5 seconds

/**
 * Hook for face detection using ml5.js
 * Includes smart face tracking - only detects NEW faces
 */
export const useMl5FaceDetection = () => {
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const detectorRef = useRef<any>(null);
  const trackedFacesRef = useRef<Map<string, number>>(new Map()); // faceId -> last seen timestamp
  const loadingRef = useRef(false);

  // Wait for ml5 to be available
  useEffect(() => {
    const checkMl5 = setInterval(() => {
      if (window.ml5) {
        console.log('✅ ml5.js loaded from CDN');
        clearInterval(checkMl5);
      }
    }, 100);

    return () => clearInterval(checkMl5);
  }, []);

  // Initialize ml5 face detection
  const loadModel = useCallback(async () => {
    if (loadingRef.current || isModelLoaded || detectorRef.current) {
      setIsModelLoaded(true);
      return;
    }

    loadingRef.current = true;
    try {
      setError(null);
      console.log('🚀 Loading ml5.js face detection...');

      // Wait for ml5 to be loaded
      if (!window.ml5) {
        throw new Error('ml5.js not loaded yet. Wait for CDN to load.');
      }

      // ml5.faceApi returns a promise directly
      console.log('⏳ Initializing detector...');
      const detector = await window.ml5.faceApi({
        withLandmarks: true,
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

  // Generate unique face ID based on position
  const generateFaceId = (box: any): string => {
    const gridX = Math.floor(box.x / 20);
    const gridY = Math.floor(box.y / 20);
    return `face_${gridX}_${gridY}`;
  };

  // Detect faces in canvas and track which ones are new
  const detectFaces = useCallback(
    async (canvas: HTMLCanvasElement): Promise<FaceScanResult> => {
      if (!detectorRef.current) {
        return {
          success: false,
          faces: [],
          isNewFace: false,
        };
      }

      try {
        // Run detection
        const predictions: any[] = await detectorRef.current.detect(canvas);

        if (!predictions || predictions.length === 0) {
          return {
            success: true,
            faces: [],
            isNewFace: false,
          };
        }

        // Clean up old tracked faces (timeout after 5 seconds)
        const now = Date.now();
        const trackedFaces = trackedFacesRef.current;
        for (const [faceId, timestamp] of trackedFaces.entries()) {
          if (now - timestamp > FACE_TRACKING_TIMEOUT) {
            trackedFaces.delete(faceId);
          }
        }

        // Process detections
        const faces: DetectedFace[] = [];
        let isNewFace = false;

        for (const prediction of predictions) {
          // Filter by confidence
          if (prediction.detection.confidence < FACE_CONFIDENCE_THRESHOLD) {
            continue;
          }

          const box = prediction.detection.box;
          const faceId = generateFaceId(box);

          const detectedFace: DetectedFace = {
            confidence: prediction.detection.confidence,
            box: {
              x: box[0],
              y: box[1],
              width: box[2],
              height: box[3],
            },
          };

          faces.push(detectedFace);

          // Check if this is a new face
          if (!trackedFaces.has(faceId)) {
            isNewFace = true;
            trackedFaces.set(faceId, now);
          } else {
            // Update timestamp for existing face
            trackedFaces.set(faceId, now);
          }
        }

        return {
          success: true,
          faces,
          isNewFace,
          faceId: faces.length > 0 ? generateFaceId(faces[0].box) : undefined,
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
    []
  );

  // Clear tracked faces
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

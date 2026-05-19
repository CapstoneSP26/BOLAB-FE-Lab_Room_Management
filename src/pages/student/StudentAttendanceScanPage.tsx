/**
 * StudentAttendanceScanPage - Student QR Code Scanner for Attendance
 * Student scans QR code using device camera to mark attendance
 * Features: Camera access, QR scanning, success/fail notifications
 */

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router';
import { CheckCircle, XCircle, Loader2, Camera, SwitchCamera, MapPinned, MapPin, ShieldCheck, WifiOff, TriangleAlert } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { useScanQRCode } from '../../features/attendance';
import { useToast } from '../../hooks/useToast';
import { useAuthStore } from '../../store/useAuthStore';
import { useProfile } from '../../features/profile';

type ScanState = 'idle' | 'requesting-camera' | 'scanning' | 'processing' | 'success' | 'error' | 'no-camera' | 'location-check' | 'location-denied';
type CameraFacing = 'front' | 'back';

type LocationStatus = 'idle' | 'checking' | 'allowed' | 'blocked' | 'denied';

const CAMPUS_ZONE = {
  name: 'Campus area',
  latitude: 0,
  longitude: 0,
  radiusMeters: 50,
} as const;

const ACCURACY_THRESHOLD_METERS = 30;

const toRadians = (value: number) => (value * Math.PI) / 180;

const getDistanceMeters = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) => {
  const earthRadius = 6371000;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;

  return earthRadius * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

export default function StudentAttendanceScanPage() {
  const { scheduleId } = useParams<{ scheduleId: string }>();
  const toast = useToast();
  const { user } = useAuthStore();
  const { data: profileData } = useProfile();

  const [scanState, setScanState] = useState<ScanState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [, setScannedData] = useState('');
  const [cameraFacing, setCameraFacing] = useState<CameraFacing>('back');
  const [availableCameras, setAvailableCameras] = useState<{ id: string; label: string }[]>([]);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('idle');
  const [locationError, setLocationError] = useState('');
  const [studentLocation, setStudentLocation] = useState<{ latitude: number; longitude: number; accuracy: number } | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isScanning = useRef(false);
  const scanAttempts = useRef(0);

  const scanQRCode = useScanQRCode();

  /**
   * Provide haptic/audio feedback on scan
   */
  const provideFeedback = (type: 'success' | 'error') => {
    if ('vibrate' in navigator) {
      if (type === 'success') {
        navigator.vibrate([100, 50, 100]);
      } else {
        navigator.vibrate(200);
      }
    }

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      if (type === 'success') {
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.linearRampToValueAtTime(1200, audioContext.currentTime + 0.1);
      } else {
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        oscillator.frequency.linearRampToValueAtTime(200, audioContext.currentTime + 0.2);
      }

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
    }
  };

  const checkCampusLocation = async () => {
    setLocationStatus('checking');
    setScanState('location-check');
    setLocationError('');

    if (!('geolocation' in navigator)) {
      setLocationStatus('denied');
      setScanState('location-denied');
      setLocationError('Your browser does not support location access.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const distance = getDistanceMeters(
          latitude,
          longitude,
          CAMPUS_ZONE.latitude,
          CAMPUS_ZONE.longitude,
        );

        const withinCampus = distance <= CAMPUS_ZONE.radiusMeters;
        const accuracyAllowed = accuracy <= ACCURACY_THRESHOLD_METERS;
        setStudentLocation({ latitude, longitude, accuracy });
        setLocationStatus(withinCampus && accuracyAllowed ? 'allowed' : 'blocked');
        setScanState(withinCampus && accuracyAllowed ? 'requesting-camera' : 'location-denied');

        if (withinCampus && accuracyAllowed) {
          startScanning();
        } else if (!withinCampus) {
          setLocationError('Bạn đang ở quá xa so với phòng học.');
        } else {
          setLocationError(
            `Location accuracy is too weak (±${Math.round(accuracy)}m). Please move to a more stable spot and try again.`,
          );
        }
      },
      (error) => {
        setLocationStatus('denied');
        setScanState('location-denied');

        if (error.code === error.PERMISSION_DENIED) {
          setLocationError('Location permission denied. Please allow location access to continue.');
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setLocationError('Unable to determine your location. Please try again near the campus.');
        } else {
          setLocationError('Location check timed out. Please try again.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  };

  // Start camera when component mounts
  useEffect(() => {
    const hasUserData = user?.id;
    const hasProfileData = (profileData as any)?.id;

    if (!hasUserData && !hasProfileData) {
      return;
    }

    const timer = setTimeout(() => {
      checkCampusLocation();
    }, 100);

    return () => {
      clearTimeout(timer);
      stopScanning();
    };
  }, [user, profileData]);

  // Apply mirror effect when camera facing changes or scanner starts
  useEffect(() => {
    if (scanState === 'scanning') {
      const timer = setTimeout(() => {
        applyMirrorEffect(cameraFacing === 'front');
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [scanState, cameraFacing]);

  /**
   * Start QR code scanner with camera
   */
  const startScanning = async (facing: CameraFacing = cameraFacing) => {
    if (isScanning.current) return;

    // Set flag immediately to prevent duplicate calls
    isScanning.current = true;

    setScanState('scanning');
    setErrorMessage('');

    await new Promise(resolve => setTimeout(resolve, 200));

    try {
      let element = document.getElementById('qr-reader');
      let retries = 0;
      while (!element && retries < 5) {
        await new Promise(resolve => setTimeout(resolve, 100));
        element = document.getElementById('qr-reader');
        retries++;
      }

      if (!element) {
        console.error('qr-reader element not found in DOM after retries');
        setScanState('no-camera');
        setErrorMessage('Scanner initialization failed. Please refresh the page.');
        return;
      }

      const scanner = new Html5Qrcode('qr-reader', true);
      scannerRef.current = scanner;

      const cameras = await Html5Qrcode.getCameras();

      if (!cameras || cameras.length === 0) {
        setScanState('no-camera');
        setErrorMessage('No camera detected on this device.');
        return;
      }

      setAvailableCameras(cameras);

      let selectedCameraId: string;

      if (facing === 'back') {
        const backCamera = cameras.find(cam =>
          cam.label.toLowerCase().includes('back') ||
          cam.label.toLowerCase().includes('rear') ||
          cam.label.toLowerCase().includes('environment')
        );
        selectedCameraId = backCamera?.id || cameras[0].id;
      } else {
        const frontCamera = cameras.find(cam =>
          cam.label.toLowerCase().includes('front') ||
          cam.label.toLowerCase().includes('user') ||
          cam.label.toLowerCase().includes('face')
        );
        selectedCameraId = frontCamera?.id || (cameras.length > 1 ? cameras[1].id : cameras[0].id);
      }

      await scanner.start(
        selectedCameraId,
        {
          fps: 30,
          qrbox: { width: 350, height: 350 },
          aspectRatio: 1.0,
        },
        onScanSuccess,
        onScanFailure
      );

      toast.success('Camera Ready', 'Position QR code within the frame', 3000);

      applyMirrorEffect(facing === 'front');
    } catch (err) {
      console.error('Camera error:', err);
      if (err instanceof Error && err.message.includes('Permission')) {
        setScanState('no-camera');
        setErrorMessage('Camera permission denied. Please allow camera access to scan QR code.');
        toast.error('Camera Access Denied', 'Please enable camera permissions in your browser settings', 5000);
      } else {
        setScanState('no-camera');
        setErrorMessage('Failed to access camera. Please check your device settings.');
        toast.error('Camera Error', 'Unable to access camera. Please check your device settings.', 5000);
      }
    }
  };

  /**
   * Apply mirror effect to camera video (for front camera selfie mode)
   */
  const applyMirrorEffect = (mirror: boolean) => {
    const videoElement = document.querySelector('#qr-reader video') as HTMLVideoElement;
    if (videoElement) {
      videoElement.style.transform = mirror ? 'scaleX(-1)' : 'scaleX(1)';
    }
  };

  /**
   * Switch between front and back camera
   */
  const handleSwitchCamera = async () => {
    if (scanState !== 'scanning') return;

    await stopScanning();

    const newFacing: CameraFacing = cameraFacing === 'back' ? 'front' : 'back';
    setCameraFacing(newFacing);

    toast.info('Switching Camera', `Activating ${newFacing} camera...`, 2000);

    setTimeout(() => {
      startScanning(newFacing);
    }, 300);
  };

  /**
   * Stop QR code scanner
   */
  const stopScanning = async () => {
    if (scannerRef.current && isScanning.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
        isScanning.current = false;
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
  };

  /**
   * Handle successful QR scan
   */
  const onScanSuccess = async (decodedText: string) => {
    if (scanState === 'processing' || scanState === 'success') return;

    provideFeedback('success');
    toast.info('QR Code Detected', 'Processing attendance...', 2000);

    scanAttempts.current = 0;
    setScannedData(decodedText);

    await stopScanning();
    await markAttendance(decodedText);
  };

  /**
   * Handle scan failure (not an error, just no QR detected in frame)
   */
  const onScanFailure = (_errorMessage: string) => {
    // Silently continue scanning without updating UI state to prevent re-renders and camera duplication
    scanAttempts.current++;
  };

  /**
   * Mark attendance after successful QR scan
   */
  const markAttendance = async (qrCodeData: string) => {
    setScanState('processing');
    setErrorMessage('');

    try {
      // QR code contains full URL from backend
      // Format: https://backend/api/attendances/scan-qrcode?qrId=GUID&scheduleId=GUID&isCheckIn=true&studentId=
      let qrId = '';
      let decodedScheduleId = '';
      let isCheckIn = true;

      try {
        const url = new URL(qrCodeData);

        // Extract query parameters
        qrId = url.searchParams.get('qrId') || '';
        decodedScheduleId = url.searchParams.get('scheduleId') || '';
        const checkInParam = url.searchParams.get('isCheckIn');
        isCheckIn = checkInParam !== 'false'; // Default to true if not specified
      } catch (urlError) {
        qrId = qrCodeData.trim();
      }

      if (!qrId || qrId.length === 0) {
        throw new Error('Invalid QR code - could not extract QR ID');
      }

      // Get studentId: Priority 1 = user.Id from JWT (backend claim), Priority 2 = profile.id from API  
      let studentId = user?.id;  // ← Changed from user?.sub to user?.Id

      // If no user.Id from JWT, try to get from profileData
      if (!studentId && profileData) {
        studentId = (profileData as any)?.id;
      }

      // Final fallback: make sure studentId is not empty
      if (!studentId) {
        throw new Error(`Student ID not found. Please refresh the page and login again. (JWT: ${user?.id}, Profile: ${(profileData as any)?.id})`);
      }

      // Use scheduleId from URL params if extracted from QR, otherwise use route param
      const finalScheduleId = decodedScheduleId || scheduleId || '';

      await scanQRCode.mutateAsync({
        qrId: qrId.trim(),
        scheduleId: finalScheduleId.trim(),
        studentId: studentId.trim(),
        isCheckIn,
        latitude: studentLocation?.latitude,
        longitude: studentLocation?.longitude,
        accuracy: studentLocation?.accuracy,
        timestamp: new Date().toISOString(),
      });

      setScanState('success');
      toast.success('Attendance Marked!', 'Your attendance has been recorded successfully', 4000);
      provideFeedback('success');
    } catch (error) {
      console.error('❌ Error marking attendance:', error);
      setScanState('error');

      let errorTitle = 'Attendance Failed';
      let errorMsg = 'Failed to mark attendance. Please try again.';

      // Extract message from Axios error or JavaScript Error
      let rawErrorMessage = '';
      if ((error as any)?.response?.data) {
        const responseData = (error as any).response.data;
        // Handle both string message and object with message property
        if (typeof responseData === 'string') {
          rawErrorMessage = responseData;
        } else if (responseData?.message) {
          rawErrorMessage = responseData.message;
        }
      } else if (error instanceof Error) {
        // JavaScript Error
        rawErrorMessage = error.message;
      }

      errorMsg = rawErrorMessage;
      const errMsg = (rawErrorMessage || '').toLowerCase();

      if (errMsg.includes('invalid') || errMsg.includes('format')) {
        errorTitle = 'Invalid QR Code';
      } else if (errMsg.includes('expired')) {
        errorTitle = 'QR Code Expired';
      } else if (errMsg.includes('already') || errMsg.includes('duplicate')) {
        errorTitle = 'Already Marked';
      } else if (errMsg.includes('session') || errMsg.includes('not found')) {
        errorTitle = 'Session Not Found';
      } else if (errMsg.includes('network') || errMsg.includes('fetch')) {
        errorTitle = 'Network Error';
      }

      setErrorMessage(errorMsg);
      console.error('Final error display:', { title: errorTitle, msg: errorMsg });

      toast.error(errorTitle, errorMsg, 6000);
      provideFeedback('error');
    }
  };

  /**
   * Retry scanning
   */
  const handleRetry = () => {
    setScanState('idle');
    setErrorMessage('');
    setLocationError('');
    setLocationStatus('idle');
    setScannedData('');
    setAvailableCameras([]);
    setCameraFacing('back');
    setStudentLocation(null);
    isScanning.current = false;

    setTimeout(() => {
      checkCampusLocation();
    }, 100);
  };

  // Main render
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Wait for profile data to load */}
      {!user && !profileData && (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-slate-700 font-medium">Loading attendance scanner...</p>
            <p className="text-sm text-slate-500 mt-2">Please wait while we prepare the camera</p>
          </div>
        </div>
      )}

      {/* Only render scanner when data is ready */}
      {(user || profileData) && (
        <>
          {scanState === 'requesting-camera' && (
            <div className="min-h-screen flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                <p className="text-slate-700 font-medium">Starting camera...</p>
                <p className="text-sm text-slate-500 mt-2">Please allow camera access if prompted</p>
              </div>
            </div>
          )}

          {/* No camera state */}
          {scanState === 'no-camera' && (
            <div className="min-h-screen flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                    <Camera className="w-8 h-8 text-amber-600" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-slate-900 text-center mb-2">Camera Not Available</h2>
                <p className="text-slate-600 text-center mb-6">{errorMessage}</p>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                  <p className="text-sm font-semibold text-amber-900 mb-2">Troubleshooting:</p>
                  <ul className="text-sm text-amber-800 space-y-1">
                    <li>• Check browser camera permissions</li>
                    <li>• Ensure camera is not used by another app</li>
                    <li>• Try using a different browser</li>
                    <li>• Reload the page</li>
                  </ul>
                </div>

                <button
                  onClick={handleRetry}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Success state */}
          {scanState === 'success' && (
            <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100">
              <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center animate-bounce">
                    <CheckCircle className="w-12 h-12 text-emerald-600" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">Attendance Marked!</h2>
                <p className="text-slate-600 text-center mb-6">Your attendance has been recorded successfully</p>

                <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Time:</span>
                    <span className="font-semibold text-slate-900">{new Date().toLocaleTimeString()}</span>
                  </div>
                </div>

                <button
                  onClick={handleRetry}
                  className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Scan Another QR Code
                </button>
              </div>
            </div>
          )}

          {/* Error state */}
          {scanState === 'error' && (
            <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-50 to-red-100">
              <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                    <XCircle className="w-8 h-8 text-red-600" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-slate-900 text-center mb-2">Scan Failed</h2>
                <p className="text-base font-semibold text-red-700 text-center mb-6">{errorMessage}</p>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-sm font-semibold text-red-900 mb-2">Possible issues:</p>
                  <ul className="text-sm text-red-800 space-y-1">
                    <li>• Invalid or expired QR code</li>
                    <li>• Wrong session or class</li>
                    <li>• Already marked attendance</li>
                    <li>• Network connection issue</li>
                  </ul>
                </div>

                <button
                  onClick={handleRetry}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Scan Again
                </button>
              </div>
            </div>
          )}

          {/* Campus location check state */}
          {(scanState === 'location-check' || scanState === 'location-denied') && (
            <div className="min-h-screen flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
                <div className="flex justify-center mb-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${locationStatus === 'allowed' ? 'bg-emerald-100' : 'bg-blue-100'}`}>
                    {locationStatus === 'allowed' ? (
                      <ShieldCheck className="w-8 h-8 text-emerald-600" />
                    ) : (
                      <MapPinned className="w-8 h-8 text-blue-600" />
                    )}
                  </div>
                </div>
                <h2 className="text-xl font-bold text-slate-900 text-center mb-2">Campus location check</h2>
                <div className="text-center mb-4">
                  {locationStatus === 'checking' ? (
                    <p className="text-slate-600">Checking if you are inside the campus area...</p>
                  ) : locationError ? (
                    <div className="space-y-3">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600 shadow-lg animate-bounce">
                        <TriangleAlert className="h-8 w-8" />
                      </div>
                      <p className="text-2xl font-extrabold leading-tight text-amber-700">
                        Bạn đang ở quá xa so với trường học.
                      </p>
                    </div>
                  ) : (
                    <p className="text-slate-600">Please stand inside {CAMPUS_ZONE.name} to continue.</p>
                  )}
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-sm text-slate-700 mb-5">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-500" />
                    <span>{CAMPUS_ZONE.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-slate-500" />
                    <span>Allowed radius: {CAMPUS_ZONE.radiusMeters}m</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <WifiOff className="w-4 h-4 text-slate-500" />
                    <span>Accuracy threshold: ±{ACCURACY_THRESHOLD_METERS}m</span>
                  </div>
                </div>

                <button
                  onClick={handleRetry}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                >
                  Retry location check
                </button>
              </div>
            </div>
          )}

          {/* Requesting camera / Processing state */}
          {(scanState === 'requesting-camera' || scanState === 'processing') && (
            <div className="min-h-screen flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                <p className="text-slate-700 font-medium">
                  {scanState === 'requesting-camera' ? 'Starting Camera...' : 'Processing...'}
                </p>
                <p className="text-sm text-slate-500 mt-2">
                  {scanState === 'requesting-camera'
                    ? 'Please allow camera access if prompted'
                    : 'Marking your attendance'}
                </p>
              </div>
            </div>
          )}

          {/* Scanning state - show camera */}
          {scanState === 'scanning' && (
            <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex flex-col">
              <div className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700/50 px-4 py-5">
                <div className="max-w-3xl mx-auto text-center space-y-2">
                  <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-200">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Campus verified
                  </div>
                  <h1 className="text-2xl font-bold text-white mb-1.5">Scan QR Code for Attendance</h1>
                  <p className="text-sm text-slate-300 flex items-center justify-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    You are inside the campus. Position the QR code within the frame.
                  </p>
                </div>
              </div>

              {/* Camera Scanner */}
              <div className="flex-1 flex items-center justify-center px-4 py-6">
                <div className="max-w-3xl w-full">
                  {/* Scanner Container */}
                  <div className="relative bg-black rounded-3xl shadow-2xl overflow-hidden border-4 border-blue-500/20" style={{ aspectRatio: '1', maxWidth: '480px', margin: '0 auto' }}>
                    <div 
                      id="qr-reader" 
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        borderRadius: '1.5rem',
                        overflow: 'hidden'
                      }}
                    ></div>

                    {/* Scanner overlay corners */}
                    <div className="absolute inset-0 pointer-events-none z-10">
                      <div className="absolute top-8 left-8 w-16 h-16 border-t-[6px] border-l-[6px] border-blue-400 rounded-tl-2xl"></div>
                      <div className="absolute top-8 right-8 w-16 h-16 border-t-[6px] border-r-[6px] border-blue-400 rounded-tr-2xl"></div>
                      <div className="absolute bottom-8 left-8 w-16 h-16 border-b-[6px] border-l-[6px] border-blue-400 rounded-bl-2xl"></div>
                      <div className="absolute bottom-8 right-8 w-16 h-16 border-b-[6px] border-r-[6px] border-blue-400 rounded-br-2xl"></div>

                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-[350px] h-[350px] border-2 border-green-400/50 rounded-2xl animate-pulse"></div>
                        <div className="absolute w-[350px] h-[2px] bg-gradient-to-r from-transparent via-green-400 to-transparent animate-scan"></div>
                      </div>
                    </div>

                    <style>{`
                  @keyframes scan {
                    0%, 100% {
                      transform: translateY(-175px);
                      opacity: 0.5;
                    }
                    50% {
                      transform: translateY(175px);
                      opacity: 1;
                    }
                  }
                  .animate-scan {
                    animation: scan 2s ease-in-out infinite;
                  }
                  #qr-reader video {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    display: block;
                  }
                  #qr-reader canvas {
                    display: none;
                  }
                `}</style>

                    {/* Switch Camera Button */}
                    {availableCameras.length > 1 && (
                      <button
                        onClick={handleSwitchCamera}
                        className="absolute top-6 right-6 z-20 bg-white/95 hover:bg-white backdrop-blur-sm p-3.5 rounded-full shadow-xl transition-all active:scale-95 hover:scale-105"
                        title="Switch Camera"
                      >
                        <SwitchCamera className="w-6 h-6 text-slate-900" />
                      </button>
                    )}

                    {/* Camera Mode Badge */}
                    <div className="absolute top-6 left-6 z-20 bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-full border border-slate-700/50 shadow-lg">
                      <span className="text-sm font-semibold text-white flex items-center gap-1.5">
                        <span>{cameraFacing === 'front' ? '📷' : '📸'}</span>
                        <span>{cameraFacing === 'front' ? 'Front Camera' : 'Back Camera'}</span>
                      </span>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="mt-6 bg-slate-800/60 backdrop-blur-md rounded-2xl px-5 py-4 border border-slate-700/50 shadow-xl">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                        <Camera className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-base font-semibold text-white mb-2">Quick Tips:</p>
                        <ul className="text-sm text-slate-300 space-y-1.5">
                          <li>• Hold steady and ensure good lighting</li>
                          <li>• Keep QR code within the blue frame</li>
                          <li>• Scanning happens automatically</li>
                          {availableCameras.length > 1 && (
                            <li>• Tap the <SwitchCamera className="w-3.5 h-3.5 inline mx-0.5" /> button to switch camera</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

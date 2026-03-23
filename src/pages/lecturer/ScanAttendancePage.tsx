/**
 * Scan Attendance Page - BOLAB-32
 * Student scans QR code using device camera to mark attendance
 * Features: Camera access, QR scanning, success/fail notifications
 */

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router';
import { CheckCircle, XCircle, Loader2, Camera, SwitchCamera } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { useQRSession } from '../../features/attendance/hooks/useQRSession';
import { useMarkAttendance } from '../../features/attendance/hooks/useAttendance';
import { MOCK_QR_SESSION } from '../../features/attendance/mocks/attendance.mock';
import { useToast } from '../../hooks/useToast';

type ScanState = 'idle' | 'requesting-camera' | 'scanning' | 'processing' | 'success' | 'error' | 'no-camera';
type CameraFacing = 'front' | 'back';

export default function ScanAttendancePage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const toast = useToast();

  const [scanState, setScanState] = useState<ScanState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [, setScannedData] = useState(''); // For future use - store decoded QR data
  const [cameraFacing, setCameraFacing] = useState<CameraFacing>('back');
  const [availableCameras, setAvailableCameras] = useState<{ id: string; label: string }[]>([]);
  const [scanCount, setScanCount] = useState(0); // Live counter for UI
  const [lastDetection, setLastDetection] = useState<string>(''); // Show what was detected
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isScanning = useRef(false);
  const scanAttempts = useRef(0); // Track scan attempts for debugging

  // Fetch QR session details (if sessionId provided in URL)
  const { data: sessionData, isLoading: isLoadingSession } = useQRSession(sessionId || null);
  const session = sessionData?.data || (sessionId === 'qr-session-001' ? MOCK_QR_SESSION : null);

  // Mark attendance mutation
  const markAttendanceMutation = useMarkAttendance();

  /**
   * Provide haptic/audio feedback on scan
   */
  const provideFeedback = (type: 'success' | 'error') => {
    // Haptic feedback (mobile devices)
    if ('vibrate' in navigator) {
      if (type === 'success') {
        navigator.vibrate([100, 50, 100]); // Two short vibrations
      } else {
        navigator.vibrate(200); // Single long vibration
      }
    }

    // Audio feedback
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      if (type === 'success') {
        // Success sound - ascending beeps
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.linearRampToValueAtTime(1200, audioContext.currentTime + 0.1);
      } else {
        // Error sound - descending beep
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        oscillator.frequency.linearRampToValueAtTime(200, audioContext.currentTime + 0.2);
      }

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      // Audio feedback not supported or failed - silent fail
      console.log('Audio feedback not available:', error);
    }
  };

  // Start camera when component mounts
  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      startScanning();
    }, 100);

    return () => {
      clearTimeout(timer);
      stopScanning();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Apply mirror effect when camera facing changes or scanner starts
  useEffect(() => {
    if (scanState === 'scanning') {
      // Small delay to ensure video element is injected by Html5Qrcode
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

    // Set to 'scanning' immediately so DOM element renders
    setScanState('scanning');
    setErrorMessage('');

    // Wait for DOM to be ready (increased delay for reliability)
    await new Promise(resolve => setTimeout(resolve, 200));

    try {
      // Check if element exists with retries
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

      // Initialize scanner with verbose mode
      const scanner = new Html5Qrcode('qr-reader', /* verbose= */ true);
      scannerRef.current = scanner;

      // Get available cameras
      const cameras = await Html5Qrcode.getCameras();
      console.log(`📷 Detected ${cameras?.length || 0} camera(s):`, cameras);

      if (!cameras || cameras.length === 0) {
        setScanState('no-camera');
        setErrorMessage('No camera detected on this device.');
        return;
      }

      setAvailableCameras(cameras);

      // Select camera based on facing mode
      let selectedCameraId: string;

      if (facing === 'back') {
        // Try to find back camera (environment-facing)
        const backCamera = cameras.find(cam =>
          cam.label.toLowerCase().includes('back') ||
          cam.label.toLowerCase().includes('rear') ||
          cam.label.toLowerCase().includes('environment')
        );
        selectedCameraId = backCamera?.id || cameras[0].id;
      } else {
        // Try to find front camera (user-facing)
        const frontCamera = cameras.find(cam =>
          cam.label.toLowerCase().includes('front') ||
          cam.label.toLowerCase().includes('user') ||
          cam.label.toLowerCase().includes('face')
        );
        selectedCameraId = frontCamera?.id || (cameras.length > 1 ? cameras[1].id : cameras[0].id);
      }

      console.log(`🎬 Starting scanner with camera: ${selectedCameraId}`);
      await scanner.start(
        selectedCameraId,
        {
          fps: 30, // Increased from 10 to 30 for faster scanning
          qrbox: { width: 350, height: 350 }, // Increased from 250 to 350 for larger scan area
          aspectRatio: 1.0,
        },
        onScanSuccess,
        onScanFailure
      );

      isScanning.current = true;
      setScanState('scanning');
      console.log('✅ Scanner started successfully! Ready to scan QR codes...');

      // Notify user that camera is ready
      toast.success('Camera Ready', 'Position QR code within the frame', 3000);

      // Apply mirror effect for front camera
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
    // Find video element injected by Html5Qrcode
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

    // Stop current scanner
    await stopScanning();

    // Toggle facing mode
    const newFacing: CameraFacing = cameraFacing === 'back' ? 'front' : 'back';
    setCameraFacing(newFacing);

    // Show notification
    toast.info('Switching Camera', `Activating ${newFacing} camera...`, 2000);

    // Restart with new camera
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

    console.log(`🎯 QR Code detected after ${scanAttempts.current} attempts!`);
    console.log('📱 Decoded text:', decodedText);
    console.log('📊 Current scan state:', scanState);

    // Provide immediate feedback
    provideFeedback('success');
    toast.info('QR Code Detected', 'Processing attendance...', 2000);

    // Update UI with detection
    setLastDetection(`✅ QR DETECTED! (${decodedText.substring(0, 50)}...)`);
    scanAttempts.current = 0; // Reset counter
    setScanCount(0);
    setScannedData(decodedText);

    // Stop scanner
    await stopScanning();
    console.log('⏹️ Scanner stopped');

    // Process attendance
    console.log('⏳ Starting attendance marking...');
    await markAttendance(decodedText);
  };

  /**
   * Handle scan failure (not an error, just no QR detected in frame)
   */
  const onScanFailure = (_errorMessage: string) => {
    // This is called continuously when no QR is detected
    // Update UI every 10 attempts
    scanAttempts.current++;
    if (scanAttempts.current % 10 === 0) {
      setScanCount(scanAttempts.current);
      setLastDetection(`🔍 Scanning... (${scanAttempts.current} attempts)`);
    }
    // Log every 100 attempts to console
    if (scanAttempts.current % 100 === 0) {
      console.log(`🔍 Scanner active - ${scanAttempts.current} scan attempts (no QR detected yet)`);
    }
  };

  /**
   * Mark attendance after successful QR scan
   */
  const markAttendance = async (qrCodeData: string) => {
    setScanState('processing');
    setErrorMessage('');

    try {
      console.log('🔍 Parsing QR code:', qrCodeData);

      // Parse QR code data (should contain sessionId and token)
      const url = new URL(qrCodeData);
      console.log('📍 URL pathname:', url.pathname);
      console.log('🔑 URL params:', url.searchParams.toString());

      const pathParts = url.pathname.split('/');
      const scannedSessionId = pathParts[pathParts.length - 1];
      const scannedToken = url.searchParams.get('token');

      console.log('🆔 Scanned Session ID:', scannedSessionId);
      console.log('🎫 Scanned Token:', scannedToken);

      if (!scannedSessionId || !scannedToken) {
        throw new Error('Invalid QR code format - missing sessionId or token');
      }

      // Mock mode: Simulate API call
      if (scannedSessionId === 'qr-session-001') {
        console.log('🎭 Using mock mode for qr-session-001');
        await new Promise((resolve) => setTimeout(resolve, 1500));
        console.log('✅ Mock attendance marked successfully!');
        setScanState('success');
        toast.success('Attendance Marked!', 'Your attendance has been recorded successfully', 4000);
        provideFeedback('success');
        return;
      }

      // Real API call
      console.log('🌐 Calling real API...');
      await markAttendanceMutation.mutateAsync({
        sessionId: scannedSessionId,
        qrToken: scannedToken,
      });

      console.log('✅ Real API attendance marked successfully!');
      setScanState('success');
      toast.success('Attendance Marked!', 'Your attendance has been recorded successfully', 4000);
      provideFeedback('success');
    } catch (error) {
      console.error('❌ Error marking attendance:', error);
      setScanState('error');

      // Determine specific error message
      let errorTitle = 'Attendance Failed';
      let errorMsg = 'Failed to mark attendance. Please try again.';

      if (error instanceof Error) {
        const errMsg = error.message.toLowerCase();

        if (errMsg.includes('invalid') || errMsg.includes('format')) {
          errorTitle = 'Invalid QR Code';
          errorMsg = 'This QR code is not valid. Please scan the correct QR code displayed by your lecturer.';
        } else if (errMsg.includes('expired')) {
          errorTitle = 'QR Code Expired';
          errorMsg = 'This QR code has expired. Please ask your lecturer for a new one.';
        } else if (errMsg.includes('already') || errMsg.includes('duplicate')) {
          errorTitle = 'Already Marked';
          errorMsg = 'Your attendance has already been recorded for this session.';
        } else if (errMsg.includes('session') || errMsg.includes('not found')) {
          errorTitle = 'Session Not Found';
          errorMsg = 'The session for this QR code could not be found. Please check with your lecturer.';
        } else if (errMsg.includes('network') || errMsg.includes('fetch')) {
          errorTitle = 'Network Error';
          errorMsg = 'Unable to connect to server. Please check your internet connection and try again.';
        } else {
          errorMsg = error.message;
        }
      }

      setErrorMessage(errorMsg);
      console.error('💥 Error details:', errorMsg);

      // Show error toast with specific message
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
    setScannedData('');
    startScanning();
  };

  // Main render
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Loading session state */}
      {isLoadingSession && !session && (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-slate-700 font-medium">Loading session...</p>
            <p className="text-sm text-slate-500 mt-2">Please wait</p>
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
      {scanState === 'success' && session && (
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
                <span className="text-slate-600">Room:</span>
                <span className="font-semibold text-slate-900">{session.roomName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Building:</span>
                <span className="font-semibold text-slate-900">{session.buildingName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Time:</span>
                <span className="font-semibold text-slate-900">{new Date().toLocaleTimeString()}</span>
              </div>
            </div>
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
            <p className="text-slate-600 text-center mb-6">{errorMessage}</p>

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
          {/* Header */}
          <div className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700/50 px-4 py-5">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-2xl font-bold text-white mb-1.5">Scan QR Code</h1>
              <p className="text-sm text-slate-300 flex items-center justify-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Scanning... Position the QR code within the frame
              </p>
            </div>
          </div>

          {/* Camera Scanner */}
          <div className="flex-1 flex items-center justify-center px-4 py-6">
            <div className="max-w-3xl w-full">
              {/* Scanner Container */}
              <div className="relative bg-black rounded-3xl shadow-2xl overflow-hidden border-4 border-blue-500/20" style={{ minHeight: '480px' }}>
                {/* QR Scanner element - Html5Qrcode injects video here */}
                <div id="qr-reader" style={{ width: '100%', minHeight: '480px', borderRadius: '1.5rem' }}></div>

                {/* Scanner overlay corners - larger and more prominent */}
                <div className="absolute inset-0 pointer-events-none z-10">
                  {/* Top left corner */}
                  <div className="absolute top-8 left-8 w-16 h-16 border-t-[6px] border-l-[6px] border-blue-400 rounded-tl-2xl"></div>
                  {/* Top right corner */}
                  <div className="absolute top-8 right-8 w-16 h-16 border-t-[6px] border-r-[6px] border-blue-400 rounded-tr-2xl"></div>
                  {/* Bottom left corner */}
                  <div className="absolute bottom-8 left-8 w-16 h-16 border-b-[6px] border-l-[6px] border-blue-400 rounded-bl-2xl"></div>
                  {/* Bottom right corner */}
                  <div className="absolute bottom-8 right-8 w-16 h-16 border-b-[6px] border-r-[6px] border-blue-400 rounded-br-2xl"></div>

                  {/* Center scanning area indicator - matches qrbox size (350x350) */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-[350px] h-[350px] border-2 border-green-400/50 rounded-2xl animate-pulse"></div>
                    {/* Animated scanning line */}
                    <div className="absolute w-[350px] h-[2px] bg-gradient-to-r from-transparent via-green-400 to-transparent animate-scan"></div>
                  </div>
                </div>

                {/* Add CSS animation for scanning line */}
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

                {/* Live Scan Status Badge */}
                <div className="absolute top-20 left-6 z-20 bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-lg border border-slate-700/50 shadow-lg max-w-[calc(100%-3rem)]">
                  <div className="text-xs font-mono text-green-400 flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="truncate">{lastDetection || '🔍 Waiting for QR code...'}</span>
                  </div>
                  {scanCount > 0 && (
                    <div className="text-xs font-mono text-slate-400 mt-1 flex items-center gap-1">
                      <span>Attempts: {scanCount}</span>
                      {scanCount > 50 && (
                        <span className="text-yellow-400">• Hold steady</span>
                      )}
                    </div>
                  )}
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

              {/* Test Buttons - For development */}
              <div className="mt-4 space-y-3">
                <p className="text-xs text-slate-300 font-semibold text-center mb-2">🧪 Test Scenarios (Development Only)</p>

                <div className="grid grid-cols-2 gap-3">
                  {/* Test Success */}
                  <button
                    onClick={() => {
                      const testUrl = `${window.location.origin}/scan-attendance/qr-session-001?token=test-token-123`;
                      console.log('✅ Testing SUCCESS scenario');
                      onScanSuccess(testUrl);
                    }}
                    className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-xl transition-all active:scale-95 shadow-lg text-sm"
                  >
                    ✅ Valid QR
                  </button>

                  {/* Test Invalid QR */}
                  <button
                    onClick={() => {
                      console.log('❌ Testing INVALID QR scenario');
                      const invalidUrl = 'https://invalid-qr-code';
                      onScanSuccess(invalidUrl);
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-xl transition-all active:scale-95 shadow-lg text-sm"
                  >
                    ❌ Invalid QR
                  </button>

                  {/* Test Already Marked */}
                  <button
                    onClick={async () => {
                      console.log('⚠️ Testing ALREADY MARKED scenario');
                      setScanState('processing');
                      await new Promise(resolve => setTimeout(resolve, 1000));
                      setScanState('error');
                      setErrorMessage('Attendance already marked for this session');
                      toast.error('Already Marked', 'Your attendance has already been recorded for this session.', 6000);
                      provideFeedback('error');
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 px-4 rounded-xl transition-all active:scale-95 shadow-lg text-sm"
                  >
                    ⚠️ Already Marked
                  </button>

                  {/* Test Network Error */}
                  <button
                    onClick={async () => {
                      console.log('🌐 Testing NETWORK ERROR scenario');
                      setScanState('processing');
                      await new Promise(resolve => setTimeout(resolve, 1000));
                      setScanState('error');
                      setErrorMessage('Unable to connect to server. Please check your internet connection and try again.');
                      toast.error('Network Error', 'Unable to connect to server. Please check your internet connection and try again.', 6000);
                      provideFeedback('error');
                    }}
                    className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-4 rounded-xl transition-all active:scale-95 shadow-lg text-sm"
                  >
                    🌐 Network Error
                  </button>
                </div>

                <p className="text-xs text-slate-400 text-center mt-2">Test buttons skip camera and simulate different scenarios</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

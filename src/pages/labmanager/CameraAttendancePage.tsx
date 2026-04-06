import React, { useState } from 'react';
import { AlertCircle, Download } from 'lucide-react';
import { FaceScanContainer } from '../../features/attendance/components/FaceScanContainer';

interface ScannedStudent {
  studentId: string;
  scanTime: string;
  confidence: number;
}

/**
 * Camera-based Face Recognition Attendance Page
 * Backend handles face recognition, FE just captures and sends frames
 */
export const CameraAttendancePage: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [scannedStudents, setScannedStudents] = useState<ScannedStudent[]>([]);

  // Handle face scanned from backend
  const handleFaceScanned = (result: { success: boolean; studentId: string; date: string }) => {
    if (result.success && result.studentId) {
      const newStudent: ScannedStudent = {
        studentId: result.studentId,
        scanTime: new Date(result.date).toLocaleTimeString(),
        confidence: 0.95, // Placeholder - can come from BE in future
      };

      setScannedStudents((prev) => [newStudent, ...prev]);
      setError(null);

      // Clear after 2 seconds
      setTimeout(() => {
        setError(null);
      }, 2000);
    }
  };

  // Export attendance data
  const handleExportAttendance = () => {
    const data = {
      timestamp: new Date().toISOString(),
      totalScanned: scannedStudents.length,
      students: scannedStudents,
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Get attendance statistics
  const stats = {
    total: scannedStudents.length,
    present: scannedStudents.length,
    absent: 0,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Camera Section */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Camera Scanner</h2>
              <FaceScanContainer
                onFaceScanned={handleFaceScanned}
                onError={(error: string) => {
                  setError(error);
                  setTimeout(() => setError(null), 3000);
                }}
                isLoading={false}
                onCaptureComplete={() => {
                  // Optional: handle capture complete
                }}
              />
            </div>
          </div>

          {/* Stats & Scanned List */}
          <div className="space-y-4">
            {/* Statistics */}
            <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
              <h3 className="text-lg font-semibold">Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-gray-700">Total Scanned</span>
                  <span className="text-2xl font-bold text-blue-600">{stats.total}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-gray-700">Present</span>
                  <span className="text-2xl font-bold text-green-600">{stats.present}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <span className="text-gray-700">Absent</span>
                  <span className="text-2xl font-bold text-red-600">{stats.absent}</span>
                </div>
              </div>
            </div>

            {/* Alert Messages */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
                <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {scannedStudents.length > 0 && !error && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
                <div className="text-green-600 flex-shrink-0">✓</div>
                <p className="text-green-800 text-sm">Face recognized! Student added to attendance.</p>
              </div>
            )}
          </div>
        </div>

        {/* Scanned Students List */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Scanned Students ({scannedStudents.length})</h3>
            {scannedStudents.length > 0 && (
              <button
                onClick={handleExportAttendance}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <Download size={16} />
                Export
              </button>
            )}
          </div>

          {scannedStudents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No students scanned yet. Position your face to start.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold">Student ID</th>
                    <th className="text-left p-3 font-semibold">Scan Time</th>
                    <th className="text-left p-3 font-semibold">Confidence</th>
                    <th className="text-left p-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {scannedStudents.map((student, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-3">{student.studentId}</td>
                      <td className="p-3">{student.scanTime}</td>
                      <td className="p-3">{(student.confidence * 100).toFixed(0)}%</td>
                      <td className="p-3">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                          Present
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-4">
          <h4 className="font-semibold text-blue-900">How to Use</h4>
          <ul className="space-y-2 text-blue-800 text-sm">
            <li>✓ Allow camera access when prompted</li>
            <li>✓ Position your face clearly in the green guides</li>
            <li>✓ Keep good lighting for better recognition</li>
            <li>✓ Scanned students appear in the list below</li>
            <li>✓ Export attendance when done</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CameraAttendancePage;

import ImportLabRoomPanel from "./ImportLabRoomPanel";

export default function ImportLabRoomFeature() {
  const handleImportComplete = () => {
    // Optional: Trigger any post-import actions (e.g., refresh data, close modals, etc.)
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800/50">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Import Lab Rooms from Excel
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Upload files containing lab room data. Follow the required column format for successful import.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <ImportLabRoomPanel onImportComplete={handleImportComplete} />
      </div>

      {/* Help Section */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800/50">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Column Requirements
        </h2>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-semibold text-gray-900 dark:text-white">BuildingId:</span> Building identifier (required)
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-semibold text-gray-900 dark:text-white">RoomName:</span> Name of the room (required)
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-semibold text-gray-900 dark:text-white">RoomNo:</span> Room number (required)
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-semibold text-gray-900 dark:text-white">Location:</span> Room location (optional)
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-semibold text-gray-900 dark:text-white">Capacity:</span> Number of seats (required, numeric)
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-semibold text-gray-900 dark:text-white">HasEquipment:</span> Equipment available (true/false or 1/0)
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-semibold text-gray-900 dark:text-white">OverrideNumber:</span> Override number (numeric)
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-semibold text-gray-900 dark:text-white">Description:</span> Room description (optional)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

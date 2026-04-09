import ImportUserPanel from "./ImportUserPanel";

export default function ImportUserFeature() {
  const handleImportComplete = () => {
    // Optional: Trigger any post-import actions
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Import Users
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Upload user data from Excel files. Supported formats: .xlsx, .xls, .csv (max 10MB)
        </p>
      </div>

      <ImportUserPanel onImportComplete={handleImportComplete} />

      {/* Help Section */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800/50">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Column Requirements
        </h2>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-semibold text-gray-900 dark:text-white">FullName:</span> User's full name (required)
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-semibold text-gray-900 dark:text-white">Email:</span> Valid email address (required)
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-semibold text-gray-900 dark:text-white">UserCode:</span> Unique user code (required)
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-semibold text-gray-900 dark:text-white">CampusId:</span> Campus ID number (required)
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-semibold text-gray-900 dark:text-white">RoleName:</span> One of: LECTURER, LAB_MANAGER, ADMIN, STUDENT (required)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

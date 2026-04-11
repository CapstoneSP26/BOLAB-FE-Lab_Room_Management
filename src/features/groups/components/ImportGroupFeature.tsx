import ImportGroupPanel from "./ImportGroupPanel";

export default function ImportGroupFeature() {
  const handleImportComplete = () => {
    // Optional: Trigger any post-import actions (e.g., refresh data, close modals, etc.)
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800/50">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Import Groups from Excel
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Upload files containing group data. Follow the required column format for successful import.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <ImportGroupPanel onImportComplete={handleImportComplete} />
      </div>

      {/* Help Section */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800/50">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Column Requirements
        </h2>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-semibold text-gray-900 dark:text-white">GroupName:</span> Name of the group (required)
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-semibold text-gray-900 dark:text-white">StudentCode:</span> Unique student code (required)
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-semibold text-gray-900 dark:text-white">SubjectCode:</span> Subject code for the group (required)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

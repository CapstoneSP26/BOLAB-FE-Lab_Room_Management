import FixedImportPanel from "./FixedImportPanel";
import FlexibleImportPanel from "./FlexibleImportPanel";

export default function ImportBookingFeature() {
  const handleImportComplete = () => {
    // Optional: Trigger any post-import actions (e.g., refresh data, close modals, etc.)
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800/50">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Import Schedules from Excel
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Upload files that match the BE contract. Two import modes are available: Fixed
            and Flexible.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <FixedImportPanel onImportComplete={handleImportComplete} />
        <FlexibleImportPanel onImportComplete={handleImportComplete} />
      </div>
    </div>
  );
}

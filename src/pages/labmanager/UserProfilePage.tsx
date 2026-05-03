import PageBreadcrumb from "../../components/common/PageBreadcrumb";
import { LoadingFallback } from "../../components/ui/LoadingFallback";
import ProfileCard from "../../features/profile/components/ProfileCard";
import { RoleSwitcher } from "../../features/profile/components/RoleSwitcher";
import { useMyProfile } from "../../features/profile/hooks/userProfile";
import { getErrorMessage } from "../../utils/error";
import { getRole } from "../../utils/role";

export default function UserProfilePage() {
  const currentPageTitle = "User Profile";
  const role = getRole();
  const { data: profile, isLoading, error } = useMyProfile();

  return (
    <>
      <PageBreadcrumb pageTitle={currentPageTitle} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
            <div className="mb-5 flex items-center justify-between lg:mb-7">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Profile
              </h3>
            </div>

            {isLoading ? (
              <LoadingFallback />
            ) : error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-500/10 dark:text-red-200">
                {getErrorMessage(error, "Failed to load profile")}
              </div>
            ) : profile ? (
              <ProfileCard role={role} profile={profile} />
            ) : (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                No profile data
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Role Switcher */}
        <div className="lg:col-span-1">
          <RoleSwitcher />
        </div>
      </div>
    </>
  );
}

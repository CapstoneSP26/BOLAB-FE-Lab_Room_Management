import { useEffect, useMemo, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadcrumb";
import ProfileCard from "../../components/layouts/labmanager/profile/ProfileCard";
import {
  profileService,
  type Profile,
  type Role,
} from "../../services/labmanager/profile.service";

function normalizeRole(role: string) {
  return role.trim().toLowerCase();
}

export default function UserProfilePage() {
  const currentPageTitle = "User Profile";

  const [role, setRole] = useState<Role>("Lab Manager");

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const switchRole = () => {
    const next =
      normalizeRole(role) === "lab manager" ? "Lecturer" : "Lab Manager";
    const ok = window.confirm(
      `Bạn muốn chuyển role sang "${next}" chứ? Việc này có thể ảnh hưởng quyền truy cập.`,
    );
    if (!ok) return;
    setRole(next);
  };

  const switchLabel = useMemo(() => {
    return normalizeRole(role) === "lab manager"
      ? "Switch to Lecturer"
      : "Switch to Lab Manager";
  }, [role]);

  // ✅ Load profile (read-only)
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await profileService.getMe();
        setProfile(data);
      } catch (e) {
        if (e instanceof Error) setError(e.message);
        else setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <>
      <PageBreadcrumb pageTitle={currentPageTitle} />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="mb-5 flex items-center justify-between lg:mb-7">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Profile
          </h3>

          {/* ✅ Switch đặt ở PAGE */}
          <button
            type="button"
            onClick={switchRole}
            className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-white/[0.04]"
          >
            {switchLabel}
          </button>
        </div>

        {/* Loading / Error */}
        {loading ? (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Loading...
          </div>
        ) : error ? (
          <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
        ) : profile ? (
          <ProfileCard role={role} profile={profile} />
        ) : (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            No profile data
          </div>
        )}
      </div>
    </>
  );
}

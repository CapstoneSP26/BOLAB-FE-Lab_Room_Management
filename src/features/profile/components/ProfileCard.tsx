import type { Profile } from "../types/profile.type";
import type { Role } from "../../../utils/role";
import { splitFullName } from "../types/profile.mapper";
import ProfileInfoField from "./ProfileInfoField";
import { roleColors, roleIcons } from "../constants/profileCard.constants";

type ProfileCardProps = {
  role: Role;
  profile: Profile;
};

export default function ProfileCard({ role, profile }: ProfileCardProps) {
  const { firstName, lastName } = splitFullName(profile.fullName);
  const roleColor = roleColors[role] || roleColors.STUDENT;
  const roleIcon = roleIcons[role] || roleIcons.STUDENT;

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800/50">
        <div className="h-32 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

        <div className="relative px-6 pb-6">
          <div className="absolute -top-16 left-6">
            <div className="relative">
              <div className="h-32 w-32 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-lg dark:border-gray-800 dark:bg-gray-800">
                <img
                  src={
                    profile.userImageUrl || "/images/user/default-avatar.png"
                  }
                  alt={profile.fullName}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-xl border-2 border-white bg-emerald-500 shadow-lg dark:border-gray-800">
                <svg
                  className="h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="ml-40 pt-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {profile.fullName}
                </h2>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold ${roleColor}`}
                  >
                    {roleIcon}
                    {role}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                    Campus: {profile.campusName || `Campus ${profile.campusId}`}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span className="font-medium">{profile.email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800/50">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-2">
            <svg
              className="h-5 w-5 text-gray-600 dark:text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Personal Information
            </h3>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <ProfileInfoField
              label="First Name"
              value={firstName}
              icon={<DefaultUserIcon />}
            />

            <ProfileInfoField
              label="Last Name"
              value={lastName}
              icon={<DefaultUserIcon />}
            />

            <ProfileInfoField
              label="Email Address"
              value={profile.email}
              icon={<MailIcon />}
            />

            <ProfileInfoField
              label="User Code"
              value={profile.userCode}
              icon={<IdCardIcon />}
            />

            <ProfileInfoField
              label="Campus Name"
              value={profile.campusName || `Campus ${profile.campusId}`}
              icon={<CampusIcon />}
            />

            <ProfileInfoField
              label="Last Login"
              value={profile.lastLogin}
              icon={<CalendarIcon />}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function DefaultUserIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  );
}

function IdCardIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 7h16M7 11h4m-4 4h6m7 4H4a2 2 0 01-2-2V7a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2z"
      />
    </svg>
  );
}

function CampusIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5"
      />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );
}

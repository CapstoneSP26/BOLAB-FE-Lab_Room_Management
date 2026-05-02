import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

type MenuItem = {
  href: string;
  text: string;
  icon: React.ReactNode;
};

function ChevronDownIcon({ rotated }: { rotated: boolean }) {
  return (
    <svg
      className={`transition-transform duration-200 ${rotated ? "rotate-180" : ""
        }`}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M5 7.5L10 12.5L15 7.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UserCircleIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M20 21a8 8 0 1 0-16 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M10 7V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2v-1"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M3 12h10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M7 8l-4 4 4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

import { useMyProfile } from "../../../features/profile/hooks/userProfile";
import { useAuthStore } from "../../../store/useAuthStore";

export default function UserMenu() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const { data: profile, isLoading } = useMyProfile();
  const { user, logout } = useAuthStore();

  const menuItems = useMemo<MenuItem[]>(
    () => [
      {
        href: "/labmanager/user-profile",
        icon: <UserCircleIcon />,
        text: "Profile",
      },
    ],
    [],
  );

  const toggleDropdown = (e: React.MouseEvent) => {
    e.preventDefault();
    setDropdownOpen((v) => !v);
  };

  const closeDropdown = () => setDropdownOpen(false);

  const signOut = async () => {
    closeDropdown();
    await logout();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const el = dropdownRef.current;
      if (!el) return;
      if (event.target instanceof Node && !el.contains(event.target)) {
        closeDropdown();
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const displayName = profile?.fullName || user?.email?.split("@")[0] || "User";
  const userImageUrl = profile?.userImageUrl || "/images/user/owner.jpg";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="flex items-center text-gray-700 dark:text-gray-400"
        onClick={toggleDropdown}
        type="button"
      >
        <span className="mr-3 h-11 w-11 overflow-hidden rounded-full">
          <img src={userImageUrl} alt="User" />
        </span>

        <span className="mr-1 block font-medium text-theme-sm">
          {isLoading ? "..." : displayName}
        </span>

        <ChevronDownIcon rotated={dropdownOpen} />
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-[17px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark text-left">
          <div className="px-3 py-2">
            <span className="block font-medium text-gray-700 text-theme-sm dark:text-gray-400 truncate">
              {profile?.fullName || "User"}
            </span>
            <span className="mt-0.5 block text-theme-xs text-gray-500 dark:text-gray-400 truncate">
              {profile?.email || user?.email || "..."}
            </span>
          </div>

          <ul className="flex flex-col gap-1 border-b border-gray-200 pb-3 pt-4 dark:border-gray-800 text-left">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  to={item.href}
                  onClick={() => closeDropdown()}
                  className="group flex items-center gap-3 rounded-lg px-3 py-2 font-medium text-gray-700 text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                >
                  <span className="text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300">
                    {item.icon}
                  </span>
                  {item.text}
                </Link>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={signOut}
            className="group mt-3 flex items-center gap-3 rounded-lg px-3 py-2 font-medium text-gray-700 text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
          >
            <span className="text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300">
              <LogoutIcon />
            </span>
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

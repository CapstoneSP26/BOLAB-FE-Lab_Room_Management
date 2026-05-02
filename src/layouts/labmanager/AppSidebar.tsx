import React, { useCallback, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSidebar } from "./sidebarContext.tsx";
import {
  GridIcon,
  CalenderIcon,
  UserCircleIcon,
  IncidentHistoryIcon,
  ListBookingRequest,
  ListIcon,
  ImportFileIcon,
  FPTLogo,
} from "../../components/icon/index.ts";
import { useAuthStore } from "../../store/useAuthStore.ts";
import { Building } from "lucide-react"
type IconProps = React.SVGProps<SVGSVGElement> & { size?: number };
type IconComp = React.ComponentType<IconProps>;

type SubItem = {
  name: string;
  path: string;
  new?: boolean;
  pro?: boolean;
};

type MenuItem = {
  name: string;
  icon: IconComp;
  path?: string;
  subItems?: SubItem[];
};

type MenuGroup = {
  title: string;
  items: MenuItem[];
};

const HorizontalDots: IconComp = (props) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
    <path
      d="M6 12h.01M12 12h.01M18 12h.01"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </svg>
);

const AppSidebar: React.FC = () => {
  const location = useLocation();
  const {
    isExpanded,
    isMobileOpen,
    isHovered,
    openSubmenu,
    toggleSubmenu,
    setIsHovered,
  } = useSidebar();
  const { user } = useAuthStore();
  const isAdmin = user && user.roles.includes("Admin") ? true : false;
  const isManager = user && user.roles.includes("Manager") ? true : false;
  const base = "/labmanager";
  const p = (suffix: string) => `${base}${suffix}`;

  const ChevronDownIcon: IconComp = (props) => (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
  const menuGroups: MenuGroup[] = useMemo(() => {
    const items = [
      // --- DASHBOARD (Chung) ---
      { icon: GridIcon, name: "Dashboard", path: p("/dashboard") },

      // --- IMPORT (Chỉ Admin) ---
      {
        icon: ImportFileIcon,
        name: "Import File",
        show: isAdmin,
        subItems: [
          { name: "Import Booking", path: p("/booking-requests/import") },
          { name: "Import User", path: p("/users/import") },
          { name: "Import Groups", path: p("/groups/import") },
        ],
      },

      // --- BOOKING REQUESTS (Chỉ Manager) ---
      {
        icon: ListBookingRequest,
        name: "Booking Requests",
        show: isManager,
        subItems: [
          { name: "Upcoming Request", path: p("/booking-requests/pending") },
          { name: "Approve/Reject History", path: p("/booking-requests/history") },
        ],
      },

      // --- REPORTS & INCIDENTS (Chung) ---
      { icon: ListIcon, name: "Report List", path: p("/reports") },
      {
        icon: IncidentHistoryIcon,
        name: isAdmin ? "Incident Resolution History" : "Incident History",
        path: p("/incident-history"),
      },

      // --- LAB ROOMS & SCHEDULE (Phân quyền sâu) ---
      {
        icon: CalenderIcon,
        name: isAdmin ? "Lab Rooms" : "Room Schedule",
        path: !isAdmin ? p("/lab-scheduler") : undefined, // Manager chỉ có path, Admin có subItems
        subItems: isAdmin ? [
          { name: "Room Schedule", path: p("/lab-scheduler") },
          { name: "Room Management", path: p("/room-management") }
        ] : undefined,
      },

      // --- MANAGEMENT (Chỉ Admin) ---
      {
        icon: ListIcon,
        name: "Slot Management",
        path: p("/slot-management"),
        show: isAdmin,
      },
      {
        icon: Building,
        name: "Building Management",
        path: p("/building-management"),
        show: isAdmin,
      },
      {
        icon: ListIcon,
        name: "User Management",
        path: p("/user-management"),
        show: isAdmin,
      },
      // --- PROFILE (Chung) ---
      { icon: UserCircleIcon, name: "User Profile", path: p("/user-profile") },
    ];

    return [
      {
        title: "Menu",
        // Lọc các item dựa trên thuộc tính 'show'. Nếu không có 'show' mặc định là hiện.
        items: items.filter(item => item.show !== false),
      },
    ];
  }, [isAdmin, isManager]);

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname],
  );

  const isAnySubmenuRouteActive = useMemo(() => {
    return menuGroups.some((group) =>
      group.items.some(
        (item) =>
          item.subItems && item.subItems.some((sub) => isActive(sub.path)),
      ),
    );
  }, [isActive, menuGroups]);

  const isSubmenuOpen = (groupIndex: number, itemIndex: number) => {
    const key = `${groupIndex}-${itemIndex}`;
    const item = menuGroups[groupIndex]?.items[itemIndex];

    return (
      openSubmenu === key ||
      (isAnySubmenuRouteActive &&
        !!item?.subItems?.some((sub) => isActive(sub.path)))
    );
  };

  const sidebarWide = isExpanded || isMobileOpen || isHovered;

  return (
    <aside
      className={[
        "fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0",
        "bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900",
        "h-screen transition-all duration-300 ease-in-out z-[99999]",
        "border-r border-gray-200",
        sidebarWide ? "lg:w-[290px]" : "lg:w-[90px]",
        isMobileOpen ? "translate-x-0 w-[290px]" : "-translate-x-full",
        "lg:translate-x-0",
      ].join(" ")}
      onMouseEnter={() => {
        if (!isExpanded) setIsHovered(true);
      }}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={[
          "py-8 flex",
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start",
        ].join(" ")}
      >
        <FPTLogo />
      </div>

      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            {menuGroups.map((menuGroup, groupIndex) => (
              <div key={groupIndex}>
                <h2
                  className={[
                    "mb-4 text-xs uppercase flex leading-[20px] text-gray-400",
                    !isExpanded && !isHovered
                      ? "lg:justify-center"
                      : "justify-start",
                  ].join(" ")}
                >
                  {isExpanded || isHovered || isMobileOpen ? (
                    <>{menuGroup.title}</>
                  ) : (
                    <HorizontalDots className="h-5 w-5 text-gray-400" />
                  )}
                </h2>

                <ul className="flex flex-col gap-4">
                  {menuGroup.items.map((item, itemIndex) => {
                    const Icon = item.icon;
                    const submenuOpen = isSubmenuOpen(groupIndex, itemIndex);
                    const showText = isExpanded || isHovered || isMobileOpen;

                    const showDropdown = submenuOpen && showText;

                    if (item.subItems?.length) {
                      return (
                        <li key={item.name}>
                          <button
                            type="button"
                            onClick={() =>
                              toggleSubmenu(`${groupIndex}-${itemIndex}`)
                            }
                            className={[
                              "menu-item group w-full",
                              submenuOpen
                                ? "menu-item-active"
                                : "menu-item-inactive",
                              !isExpanded && !isHovered
                                ? "lg:justify-center"
                                : "lg:justify-start",
                            ].join(" ")}
                          >
                            <span
                              className={[
                                submenuOpen
                                  ? "menu-item-icon-active"
                                  : "menu-item-icon-inactive",
                              ].join(" ")}
                            >
                              <Icon />
                            </span>

                            {showText && (
                              <span className="menu-item-text">
                                {item.name}
                              </span>
                            )}

                            {showText && (
                              <ChevronDownIcon
                                className={[
                                  "ml-auto w-5 h-5 transition-transform duration-200",
                                  submenuOpen
                                    ? "rotate-180 text-brand-500"
                                    : "",
                                ].join(" ")}
                              />
                            )}
                          </button>

                          <div
                            className={[
                              "grid overflow-hidden transition-[grid-template-rows] duration-300 ease-in-out",
                              showDropdown
                                ? "grid-rows-[1fr]"
                                : "grid-rows-[0fr]",
                            ].join(" ")}
                          >
                            <div className="min-h-0">
                              <ul className="mt-2 space-y-1 ml-9">
                                {item.subItems.map((subItem) => (
                                  <li key={subItem.name}>
                                    <Link
                                      to={subItem.path}
                                      className={[
                                        "menu-dropdown-item",
                                        isActive(subItem.path)
                                          ? "menu-dropdown-item-active"
                                          : "menu-dropdown-item-inactive",
                                      ].join(" ")}
                                    >
                                      {subItem.name}

                                      <span className="flex items-center gap-1 ml-auto">
                                        {subItem.new && (
                                          <span
                                            className={[
                                              "menu-dropdown-badge",
                                              isActive(subItem.path)
                                                ? "menu-dropdown-badge-active"
                                                : "menu-dropdown-badge-inactive",
                                            ].join(" ")}
                                          >
                                            new
                                          </span>
                                        )}
                                        {subItem.pro && (
                                          <span
                                            className={[
                                              "menu-dropdown-badge",
                                              isActive(subItem.path)
                                                ? "menu-dropdown-badge-active"
                                                : "menu-dropdown-badge-inactive",
                                            ].join(" ")}
                                          >
                                            pro
                                          </span>
                                        )}
                                      </span>
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </li>
                      );
                    }

                    if (item.path) {
                      return (
                        <li key={item.name}>
                          <Link
                            to={item.path}
                            className={[
                              "menu-item group",
                              isActive(item.path)
                                ? "menu-item-active"
                                : "menu-item-inactive",
                            ].join(" ")}
                          >
                            <span
                              className={[
                                isActive(item.path)
                                  ? "menu-item-icon-active"
                                  : "menu-item-icon-inactive",
                              ].join(" ")}
                            >
                              <Icon />
                            </span>
                            {showText && (
                              <span className="menu-item-text">
                                {item.name}
                              </span>
                            )}
                          </Link>
                        </li>
                      );
                    }

                    return null;
                  })}
                </ul>
              </div>
            ))}
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;

import { Outlet, useLocation } from "react-router-dom"; // Import Outlet
import { SidebarProvider, useSidebar } from "./sidebarContext";
import type { PropsWithChildren } from "react";
import AppHeader from "./AppHeader";
import AppSidebar from "./AppSidebar";
import Backdrop from "./Backdrop";

function ManagerLayoutBody({ children }: PropsWithChildren) {
  const { isExpanded, isHovered } = useSidebar();
  const leftClass = isExpanded || isHovered ? "lg:ml-[290px]" : "lg:ml-[90px]";
  const location = useLocation();
  const isFullWidthTimeline = location.pathname.startsWith("/labmanager/booking-requests/pending");
  const contentClass = isFullWidthTimeline
    ? "w-full max-w-none p-4 md:p-6"
    : "mx-auto max-w-7xl p-4 md:p-6";

  return (
    <div className="min-h-screen xl:flex bg-gray-100 text-gray-900 dark:bg-gray-950 dark:text-white/90">
      <AppSidebar />
      <Backdrop />

      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${leftClass}`}
      >
        <AppHeader />

        {/* THAY ĐỔI Ở ĐÂY: Ưu tiên render children, nếu không có thì render Outlet */}
        <div className={contentClass}>
          {children ? children : <Outlet />}
        </div>

        <footer className="mx-auto max-w-7xl p-4 pt-0 md:p-6">
          <p className="text-center text-sm text-gray-600 dark:text-gray-500">
            © Powered by{" "}
            <a
              href="https://fpt.edu.vn/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-brand-500 transition-colors duration-200 hover:text-brand-600"
            >
              FPT University
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function ManagerLayout({ children }: PropsWithChildren) {
  return (
    <SidebarProvider>
      <ManagerLayoutBody>{children}</ManagerLayoutBody>
    </SidebarProvider>
  );
}
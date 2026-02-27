import type { ReactNode } from "react";
import { SidebarProvider, useSidebar } from "./sidebarContext";

import AppHeader from "./AppHeader";
import AppSidebar from "./AppSidebar";
import Backdrop from "./Backdrop";

function ManagerLayoutBody({ children }: { children: ReactNode }) {
  const { isExpanded, isHovered } = useSidebar();
  const leftClass = isExpanded || isHovered ? "lg:ml-[290px]" : "lg:ml-[90px]";

  return (
    <div className="min-h-screen xl:flex bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-white/90">
      <AppSidebar />
      <Backdrop />

      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${leftClass}`}
      >
        <AppHeader />

        <div className="p-4 mx-auto max-w-7xl md:p-6">{children}</div>

        <footer className="p-4 mx-auto max-w-7xl md:p-6 pt-0">
          <p className="text-sm text-center text-gray-500 dark:text-gray-400">
            © Powered by{" "}
            <a
              href="https://fpt.edu.vn/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-500 hover:text-brand-600 transition-colors duration-200 font-medium"
            >
              FPT University
            </a>{" "}
            .
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function ManagerLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <ManagerLayoutBody>{children}</ManagerLayoutBody>
    </SidebarProvider>
  );
}

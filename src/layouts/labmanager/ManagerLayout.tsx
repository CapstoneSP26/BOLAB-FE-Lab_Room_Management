import type { ReactNode } from "react";
import { SidebarProvider, useSidebar } from "./sidebarContext";

import AppHeader from "./AppHeader";
import AppSidebar from "./AppSidebar";
import Backdrop from "./Backdrop";

function ManagerLayoutBody({ children }: { children: ReactNode }) {
  const { isExpanded, isHovered } = useSidebar();
  const leftClass = isExpanded || isHovered ? "lg:ml-[290px]" : "lg:ml-[90px]";

  return (
    <div className="min-h-screen xl:flex bg-gray-100 text-gray-900 dark:bg-gray-950 dark:text-white/90">
      <AppSidebar />
      <Backdrop />

      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${leftClass}`}
      >
        <AppHeader />

        <div className="mx-auto max-w-7xl p-4 md:p-6">{children}</div>

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

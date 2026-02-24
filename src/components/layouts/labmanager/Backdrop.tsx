import React from "react";
import { useSidebar } from "./sidebarContext"; // hoặc "@/hooks/useSidebar" tùy bạn đang đặt

const Backdrop: React.FC = () => {
  const { isMobileOpen, toggleMobileSidebar } = useSidebar();

  if (!isMobileOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-gray-900/50 z-[9999] lg:hidden"
      onClick={toggleMobileSidebar}
    />
  );
};

export default Backdrop;

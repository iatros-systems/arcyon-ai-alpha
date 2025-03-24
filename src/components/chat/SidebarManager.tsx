
import { useState, useEffect } from "react";

export const useSidebarManager = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const savedState = localStorage.getItem("sidebar-collapsed");
    return savedState ? savedState === "true" : false;
  });

  // Listen for sidebar collapse changes
  useEffect(() => {
    const handleStorageChange = () => {
      const collapsed = localStorage.getItem("sidebar-collapsed") === "true";
      setSidebarCollapsed(collapsed);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return { sidebarOpen, setSidebarOpen, sidebarCollapsed };
};

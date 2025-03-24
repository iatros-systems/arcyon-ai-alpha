
import { useState, useEffect } from "react";

export const useSidebarState = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const savedState = localStorage.getItem("sidebar-collapsed");
    return savedState ? savedState === "true" : false;
  });

  // Listen for sidebar state changes
  useEffect(() => {
    const handleSidebarStateChange = () => {
      const collapsed = localStorage.getItem("sidebar-collapsed") === "true";
      setSidebarCollapsed(collapsed);
    };

    // Listen for the custom event fired when sidebar state changes
    window.addEventListener("sidebar-state-changed", handleSidebarStateChange);
    
    // Also listen for storage events for cross-tab synchronization
    window.addEventListener("storage", handleSidebarStateChange);
    
    return () => {
      window.removeEventListener("sidebar-state-changed", handleSidebarStateChange);
      window.removeEventListener("storage", handleSidebarStateChange);
    };
  }, []);

  return {
    sidebarOpen,
    setSidebarOpen,
    sidebarCollapsed
  };
};

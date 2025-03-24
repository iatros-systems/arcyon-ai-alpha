
import { useState, useEffect } from "react";

export const useSidebarState = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    const savedState = localStorage.getItem("sidebar-collapsed");
    return savedState ? savedState === "true" : false;
  });

  // Toggle collapsed state
  const toggleCollapsed = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    localStorage.setItem("sidebar-collapsed", String(newState));
    
    // Dispatch a custom event for cross-tab synchronization
    window.dispatchEvent(new CustomEvent("sidebar-state-changed"));
  };

  // Listen for sidebar state changes
  useEffect(() => {
    const handleSidebarStateChange = () => {
      const isCollapsed = localStorage.getItem("sidebar-collapsed") === "true";
      setCollapsed(isCollapsed);
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
    collapsed,
    toggleCollapsed
  };
};

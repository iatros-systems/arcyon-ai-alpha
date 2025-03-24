
import { useState, useEffect } from "react";

/**
 * Custom hook to manage sidebar collapsed state
 */
export const useSidebarState = () => {
  const [collapsed, setCollapsed] = useState(() => {
    // Initialize from localStorage if available
    const savedState = localStorage.getItem("sidebar-collapsed");
    return savedState ? savedState === "true" : false;
  });

  // Save collapsed state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", String(collapsed));
    // Add an event to notify other components about the sidebar state change
    window.dispatchEvent(new Event("sidebar-state-changed"));
  }, [collapsed]);

  // Toggle sidebar collapsed state
  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  return { collapsed, toggleCollapsed };
};

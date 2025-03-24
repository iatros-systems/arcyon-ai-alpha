
import React, { createContext, useContext } from "react";
import { useSettings } from "@/hooks/useSettings";

// Create a type for our context
type SettingsContextType = ReturnType<typeof useSettings>;

// Create the context with a default value of undefined
const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Provider component that wraps parts of our app that need settings
export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Use our existing hook to get all settings state and handlers
  const settings = useSettings();

  // Provide the settings value to all children
  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
};

// Custom hook to use the settings context
export const useSettingsContext = () => {
  const context = useContext(SettingsContext);
  
  if (context === undefined) {
    throw new Error("useSettingsContext must be used within a SettingsProvider");
  }
  
  return context;
};

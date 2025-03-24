
import { useState, useEffect } from "react";
import { hasApiKey } from "@/services/api";

export const useApiKeyDialog = () => {
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);
  
  // Check if API key is configured on initial load
  useEffect(() => {
    if (!hasApiKey()) {
      setApiKeyDialogOpen(true);
    }
  }, []);

  return {
    apiKeyDialogOpen,
    setApiKeyDialogOpen
  };
};

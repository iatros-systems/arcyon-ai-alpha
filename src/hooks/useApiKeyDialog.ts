import { useState } from "react";
import { hasApiKey } from "@/services/api";

export const useApiKeyDialog = () => {
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);
  
  // Eliminamos el useEffect que abre el diálogo automáticamente
  // useEffect(() => {
  //   // Only open the dialog if no API key exists
  //   if (!hasApiKey()) {
  //     setApiKeyDialogOpen(true);
  //   }
  // }, []);

  return {
    apiKeyDialogOpen,
    setApiKeyDialogOpen
  };
};

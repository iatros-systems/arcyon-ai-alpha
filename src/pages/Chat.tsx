
import { useEffect } from "react";
import { useChatStore } from "@/store/chat-store";
import { useApiKeyDialog } from "@/hooks/useApiKeyDialog";
import { useDarkMode } from "@/hooks/useDarkMode";
import { useSidebarState } from "@/hooks/useSidebarState";
import ChatLayout from "@/components/chat/ChatLayout";
import { hasApiKey } from "@/services/api";

const Chat = () => {
  const { currentChat, startNewChat } = useChatStore();
  const { apiKeyDialogOpen, setApiKeyDialogOpen } = useApiKeyDialog();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const { sidebarOpen, setSidebarOpen, collapsed: sidebarCollapsed } = useSidebarState();

  // Create first chat if none exists
  useEffect(() => {
    if (!currentChat) {
      startNewChat();
    }
  }, [currentChat, startNewChat]);

  // Check if API key exists when component mounts
  useEffect(() => {
    // This will check localStorage and memory cache
    if (!hasApiKey()) {
      setApiKeyDialogOpen(true);
    }
  }, [setApiKeyDialogOpen]);

  return (
    <ChatLayout
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
      sidebarCollapsed={sidebarCollapsed}
      darkMode={darkMode}
      toggleDarkMode={toggleDarkMode}
      apiKeyDialogOpen={apiKeyDialogOpen}
      setApiKeyDialogOpen={setApiKeyDialogOpen}
    />
  );
};

export default Chat;

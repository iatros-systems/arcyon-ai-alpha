
import { useEffect } from "react";
import { useChatStore } from "@/store/chat-store";
import { useChatMessages } from "@/hooks/useChatMessages";
import { useApiKeyDialog } from "@/hooks/useApiKeyDialog";
import { useDarkMode } from "@/hooks/useDarkMode";
import { useSidebarState } from "@/hooks/useSidebarState";
import ChatLayout from "@/components/chat/ChatLayout";

const Chat = () => {
  const { currentChat, startNewChat } = useChatStore();
  const { apiKeyDialogOpen, setApiKeyDialogOpen } = useApiKeyDialog();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const { sidebarOpen, setSidebarOpen, sidebarCollapsed } = useSidebarState();

  // Create first chat if none exists
  useEffect(() => {
    if (!currentChat) {
      startNewChat();
    }
  }, [currentChat, startNewChat]);

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


import { useEffect } from "react";
import { useChatStore } from "@/store/chat-store";
import { useApiKeyDialog } from "@/hooks/useApiKeyDialog";
import { useDarkMode } from "@/hooks/useDarkMode";
import { useSidebarState } from "@/hooks/useSidebarState";
import ChatLayout from "@/components/chat/ChatLayout";

const Chat = () => {
  const { currentChat, fetchChats } = useChatStore();
  const { apiKeyDialogOpen, setApiKeyDialogOpen } = useApiKeyDialog();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const { sidebarOpen, setSidebarOpen, collapsed: sidebarCollapsed } = useSidebarState();

  // Initialize: fetch all chats from Firestore
  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

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

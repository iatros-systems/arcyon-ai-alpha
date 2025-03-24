
import { useState, useEffect } from "react";
import ChatHeader from "@/components/ChatHeader";
import Sidebar from "@/components/Sidebar";
import ChatMessages from "@/components/ChatMessages";
import ChatInput from "@/components/ChatInput";
import ApiKeyDialog from "@/components/ApiKeyDialog";
import { useChatStore } from "@/store/chat-store";
import { hasApiKey } from "@/services/api";
import { useApiKeyManager } from "@/components/chat/ApiKeyManager";
import { useSidebarManager } from "@/components/chat/SidebarManager";
import { useDarkMode } from "@/components/theme/DarkModeToggle";
import { useMessageHandler } from "@/components/chat/MessageHandler";

const Chat = () => {
  const [loading, setLoading] = useState(false);
  const { currentChat, addMessage, startNewChat } = useChatStore();
  const { apiKeyDialogOpen, setApiKeyDialogOpen } = useApiKeyManager();
  const { sidebarOpen, setSidebarOpen, sidebarCollapsed } = useSidebarManager();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const { handleSendMessage } = useMessageHandler({
    currentChat,
    addMessage,
    setLoading,
  });

  // Create first chat if none exists
  useEffect(() => {
    if (!currentChat) {
      startNewChat();
    }
  }, [currentChat, startNewChat]);

  const onSendMessage = async (messageContent: string, files?: File[]) => {
    if (!hasApiKey()) {
      setApiKeyDialogOpen(true);
      return;
    }

    await handleSendMessage(messageContent, files);
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      
      <ApiKeyDialog 
        open={apiKeyDialogOpen} 
        onOpenChange={setApiKeyDialogOpen} 
      />
      
      <div 
        className={`flex flex-col flex-1 h-full ml-0 md:${sidebarCollapsed ? 'ml-16' : 'ml-72'} transition-all duration-300`}
      >
        <ChatHeader 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen} 
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
        />
        
        <div className="flex flex-col flex-1 overflow-hidden">
          <ChatMessages 
            messages={currentChat?.messages.filter(m => m.role !== "system") || []}
            loading={loading} 
          />
          <ChatInput onSubmit={onSendMessage} disabled={loading} />
        </div>
      </div>
    </div>
  );
};

export default Chat;

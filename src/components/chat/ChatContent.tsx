
import { useEffect } from "react";
import ChatMessages from "@/components/ChatMessages";
import ChatInput from "@/components/ChatInput";
import { useChatStore } from "@/store/chat-store";
import { useChatMessages } from "@/hooks/useChatMessages";

interface ChatContentProps {
  sidebarCollapsed: boolean;
}

const ChatContent = ({ sidebarCollapsed }: ChatContentProps) => {
  const { 
    currentChat, 
    startNewChat, 
    fetchCurrentChat,
    isLoading 
  } = useChatStore();
  const { loading: sendingMessage, handleSendMessage } = useChatMessages();

  // Load current chat or create first chat if none exists
  useEffect(() => {
    const loadInitialChat = async () => {
      await fetchCurrentChat();
      
      if (!currentChat) {
        await startNewChat();
      }
    };
    
    loadInitialChat();
  }, []);

  const loading = isLoading || sendingMessage;

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <ChatMessages 
        messages={currentChat?.messages.filter(m => m.role !== "system") || []}
        loading={loading} 
      />
      <ChatInput 
        onSubmit={handleSendMessage} 
        disabled={loading} 
      />
    </div>
  );
};

export default ChatContent;

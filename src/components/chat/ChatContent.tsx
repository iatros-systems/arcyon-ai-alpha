
import { useEffect } from "react";
import ChatMessages from "@/components/ChatMessages";
import ChatInput from "@/components/ChatInput";
import { useChatStore } from "@/store/chat-store";
import { useChatMessages } from "@/hooks/useChatMessages";

interface ChatContentProps {
  sidebarCollapsed: boolean;
}

const ChatContent = ({ sidebarCollapsed }: ChatContentProps) => {
  const { currentChat, startNewChat } = useChatStore();
  const { loading, handleSendMessage } = useChatMessages();

  // Create first chat if none exists
  useEffect(() => {
    if (!currentChat) {
      startNewChat();
    }
  }, [currentChat, startNewChat]);

  return (
    <div className="flex flex-col flex-1 h-full relative">
      <div className="flex-1 overflow-hidden">
        <ChatMessages 
          messages={currentChat?.messages.filter(m => m.role !== "system") || []}
          loading={loading} 
        />
      </div>
      <div className="sticky bottom-0 left-0 right-0 z-10">
        <ChatInput 
          onSubmit={handleSendMessage} 
          disabled={loading} 
        />
      </div>
    </div>
  );
};

export default ChatContent;

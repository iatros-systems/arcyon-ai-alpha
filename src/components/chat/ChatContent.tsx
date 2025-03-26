import { useEffect, useState, useRef } from "react";
import ChatMessages from "@/components/ChatMessages";
import ChatInput from "@/components/ChatInput";
import { useChatStore } from "@/store/chat-store";
import { useChatMessages } from "@/hooks/useChatMessages";

interface ChatContentProps {
  sidebarCollapsed: boolean;
}

const ChatContent = ({ sidebarCollapsed }: ChatContentProps) => {
  const { currentChat, startNewChat, addMessage } = useChatStore();
  const { loading: apiLoading, handleSendMessage } = useChatMessages();
  const [loading, setLoading] = useState(false);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // Create first chat if none exists
  useEffect(() => {
    if (!currentChat) {
      startNewChat();
    }
  }, [currentChat, startNewChat]);

  // Wrapper para o handleSendMessage que gerencia o estado de loading
  const handleSubmit = async (messageContent: string, files?: File[]) => {
    setLoading(true);
    startTimeRef.current = Date.now(); // Registra o tempo de início
    setResponseTime(null); // Reseta o tempo de resposta anterior
    
    try {
      const result = await handleSendMessage(messageContent, files);
      
      // Calcula o tempo decorrido
      const elapsedTime = Math.round((Date.now() - startTimeRef.current) / 1000);
      setResponseTime(elapsedTime);
      
      return result;
    } finally {
      // Pequeno atraso antes de remover o indicador de loading para garantir que a UI seja atualizada
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  };

  return (
    <div className="flex flex-col flex-1 h-full relative overflow-hidden">
      <div className="flex-1 overflow-hidden relative">
        <ChatMessages 
          messages={currentChat?.messages.filter(m => m.role !== "system") || []}
          loading={loading || apiLoading} 
          responseTime={responseTime}
        />
      </div>
      <div className="z-10 w-full bg-background">
        <ChatInput 
          onSubmit={handleSubmit} 
          disabled={loading || apiLoading} 
        />
      </div>
    </div>
  );
};

export default ChatContent;

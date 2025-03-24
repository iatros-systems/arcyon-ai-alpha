
import { useState } from "react";
import { useChatStore } from "@/store/chat-store";
import { sendMessageToGemini, hasApiKey } from "@/services/api";
import { useToast } from "@/components/ui/use-toast";
import { prepareMessagesForApi } from "@/utils/chatMessageUtils";

export const useChatTextMessaging = () => {
  const { currentChat, addMessage } = useChatStore();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const sendTextMessage = async (messageContent: string): Promise<boolean> => {
    if (!hasApiKey()) {
      toast({
        title: "Chave de API não configurada",
        description: "Configure sua chave de API nas configurações.",
        variant: "destructive",
      });
      return false;
    }

    try {
      // Add user message to chat
      addMessage(messageContent, "user");
      
      setLoading(true);
      
      // Prepare messages for API
      if (!currentChat) {
        throw new Error("No active chat");
      }
      
      // This guarantees the system message is included
      const messagesToSend = prepareMessagesForApi(currentChat);
      
      // Log the system message in development
      if (process.env.NODE_ENV === 'development') {
        const systemMsg = messagesToSend.find(msg => msg.role === "system");
        if (systemMsg) {
          console.log("Using system prompt:", systemMsg.content.substring(0, 100) + "...");
        } else {
          console.warn("No system prompt found in prepared messages!");
        }
      }
      
      // Send messages to API
      const response = await sendMessageToGemini(messagesToSend);
      
      // Add AI response to chat
      addMessage(response, "assistant");
      return true;
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Erro ao enviar mensagem",
        description: "Verifique sua conexão e configuração da API.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    setLoading,
    sendTextMessage
  };
};

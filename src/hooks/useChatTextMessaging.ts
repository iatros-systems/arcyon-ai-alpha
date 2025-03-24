
import { useState } from "react";
import { useChatStore } from "@/store/chat-store";
import { sendMessageToGemini, hasApiKey } from "@/services/api";
import { useToast } from "@/components/ui/use-toast";
import { prepareMessagesForApi } from "@/utils/chatMessageUtils";

export const useChatTextMessaging = () => {
  const [loading, setLoading] = useState(false);
  const { currentChat, addMessage } = useChatStore();
  const { toast } = useToast();

  const sendTextMessage = async (messageContent: string): Promise<boolean> => {
    if (!hasApiKey()) {
      return false;
    }

    // Add user message to chat
    addMessage(messageContent, "user");
    
    setLoading(true);
    
    try {
      // Prepare messages for API
      const messagesToSend = prepareMessagesForApi(currentChat);
      
      // Add the new message
      messagesToSend.push({
        role: "user",
        content: messageContent,
      });
      
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

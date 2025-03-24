
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

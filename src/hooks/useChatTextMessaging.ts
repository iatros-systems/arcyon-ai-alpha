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
      // Set loading to true before adding the user message
      setLoading(true);
      
      // Add user message to chat
      addMessage(messageContent, "user");
      
      // Prepare messages for API
      if (!currentChat) {
        throw new Error("No active chat");
      }
      
      // This function now properly includes the system message as the first message
      const messagesToSend = prepareMessagesForApi(currentChat);
      
      // Add the new message (should already be included from prepareMessagesForApi)
      if (!messagesToSend.some(msg => msg.role === "user" && msg.content === messageContent)) {
        messagesToSend.push({
          role: "user",
          content: messageContent,
        });
      }
      
      // Small delay to ensure the UI updates and shows the loading indicator
      await new Promise(resolve => setTimeout(resolve, 100));
      
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

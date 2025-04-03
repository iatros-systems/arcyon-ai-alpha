import { useState } from "react";
import { useChatStore } from "@/store/chat-store";
import { useToast } from "@/components/ui/use-toast";
import { prepareMessagesForApi } from "@/utils/chatMessageUtils";
import { sendMessage, hasAnyApiConfigured, getActiveApiName } from "@/services/messageService";

export const useChatTextMessaging = () => {
  const { currentChat, addMessage } = useChatStore();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [responseTime, setResponseTime] = useState<number | null>(null);

  const sendTextMessage = async (messageContent: string): Promise<boolean> => {
    if (!hasAnyApiConfigured()) {
      toast({
        title: "API não configurada",
        description: "Configure pelo menos uma API nas configurações.",
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
      
      // Get the name of the active API for the toast notification
      const apiName = getActiveApiName();
      
      // Registrar o tempo de início
      const startTime = Date.now();
      
      // Send messages to API using the new service
      const response = await sendMessage(messagesToSend);
      
      // Calcular o tempo de resposta
      const endTime = Date.now();
      const responseTimeInSeconds = Math.round((endTime - startTime) / 1000);
      setResponseTime(responseTimeInSeconds);
      
      // Add AI response to chat with reasoning content if available and the API name used
      if (response.reasoningContent) {
        addMessage(response.content, "assistant", response.reasoningContent, apiName);
      } else {
        addMessage(response.content, "assistant", undefined, apiName);
      }
      
      // Show a subtle toast notification indicating which API was used
      toast({
        title: `Resposta gerada por ${apiName}`,
        description: "A resposta foi processada com sucesso.",
        duration: 3000,
      });
      
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
    sendTextMessage,
    responseTime,
    getActiveApiName // Exportar a função para uso em outros componentes
  };
};

import { useState } from "react";
import { useChatStore } from "@/store/chat-store";
import { useToast } from "@/components/ui/use-toast";
import { prepareMessagesForApi } from "@/utils/chatMessageUtils";
import { sendMessage, hasAnyApiConfigured, getActiveApiName } from "@/services/messageService";
import { getPathologySystemPrompt, getPathologyAttachments } from "@/utils/settingsStorage";
import type { FileAttachment } from "@/services/api";

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
      
      // Registrar início do tempo de resposta
      const startTime = performance.now();
      
      // Obter a patologia do chat atual
      const pathology = currentChat.metadata?.pathology || "defaultPathology";
      console.log(`[useChatTextMessaging] Patologia do chat: "${pathology}"`);
      
      // Verificar se o prompt de sistema existe nas mensagens
      const existingSystemMessage = currentChat.messages.find(m => m.role === "system");
      
      // Variáveis para armazenar o prompt e anexos
      let systemPrompt: string | null = null;
      let pathologyAttachments: FileAttachment[] = [];
      
      // Se não existe mensagem de sistema no chat atual e temos uma patologia, buscar do Firestore
      if (!existingSystemMessage && pathology !== "defaultPathology") {
        console.log(`[useChatTextMessaging] Buscando prompt da patologia "${pathology}" do Firestore`);
        systemPrompt = await getPathologySystemPrompt(pathology);
        
        // Buscar anexos da patologia
        console.log(`[useChatTextMessaging] Buscando anexos da patologia "${pathology}" do Firestore`);
        pathologyAttachments = await getPathologyAttachments(pathology);
        console.log(`[useChatTextMessaging] Encontrados ${pathologyAttachments.length} anexos para a patologia "${pathology}"`);
        
        if (systemPrompt && systemPrompt.trim()) {
          console.log(`[useChatTextMessaging] Prompt específico encontrado para patologia "${pathology}"`);
          console.log(`[useChatTextMessaging] Conteúdo do prompt (primeiros 50 chars): "${systemPrompt.substring(0, 50)}..."`);
          
          // Criar uma cópia das mensagens atuais e adicionar o prompt do sistema como primeira mensagem
          const messagesWithSystemPrompt = [
            { role: "system", content: systemPrompt },
            ...currentChat.messages
          ];
          
          // Preparar as mensagens para a API com o prompt específico da patologia
          const messagesToSend = prepareMessagesForApi({ messages: messagesWithSystemPrompt });
          console.log(`[useChatTextMessaging] Enviando ${messagesToSend.length} mensagens com prompt específico da patologia`);
          
          // Send message to API with attachments
          const apiName = getActiveApiName();
          console.log(`[useChatTextMessaging] Enviando para ${apiName} com ${pathologyAttachments.length} anexos`);
          
          const response = await sendMessage(messagesToSend, undefined, pathologyAttachments.length > 0 ? pathologyAttachments : undefined);
          
          // Calculate response time
          const endTime = performance.now();
          const responseTimeMs = Math.round(endTime - startTime);
          setResponseTime(responseTimeMs);
          
          // Add AI response to chat
          if (apiName !== "gemini") {
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
        } else {
          console.log(`[useChatTextMessaging] Nenhum prompt específico encontrado para patologia "${pathology}"`);
        }
      }
      
      // Se não encontramos ou não precisamos de um prompt específico, continuar com o fluxo normal
      const messagesToSend = prepareMessagesForApi({ messages: currentChat.messages });
      console.log(`[useChatTextMessaging] Enviando ${messagesToSend.length} mensagens com prompt padrão`);
      
      // Get the name of the active API for the toast notification
      const apiName = getActiveApiName();
      
      // Send message to API
      const response = await sendMessage(messagesToSend);
      
      // Calculate response time
      const endTime = performance.now();
      const responseTimeMs = Math.round(endTime - startTime);
      setResponseTime(responseTimeMs);
      
      // Add AI response to chat
      if (apiName !== "gemini") {
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

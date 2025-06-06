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
          
          // Log completo do prompt para validação
          console.log(`[useChatTextMessaging][VALIDAÇÃO] Conteúdo completo do prompt da patologia:`);
          console.log(systemPrompt);
          
          // Criar uma cópia das mensagens atuais e adicionar o prompt do sistema como primeira mensagem
          const messagesWithSystemPrompt = [
            { role: "system", content: systemPrompt },
            ...currentChat.messages
          ];
          
          // Verificar se o prompt contém a string específica do prompt oficial
          const containsKeyPhrase = systemPrompt.includes("PROMPT OFICIAL V2 - CHAT");
          console.log(`[useChatTextMessaging][VALIDAÇÃO] O prompt contém a frase 'PROMPT OFICIAL V2 - CHAT': ${containsKeyPhrase}`);
          
          // Preparar as mensagens para a API com o prompt específico da patologia
          const messagesToSend = prepareMessagesForApi({ messages: messagesWithSystemPrompt });
          
          // Validar se o prompt de sistema está presente nas mensagens formatadas
          const systemMessages = messagesToSend.filter(m => m.role === "system");
          console.log(`[useChatTextMessaging][VALIDAÇÃO] Número de mensagens system após formatação: ${systemMessages.length}`);
          if (systemMessages.length > 0) {
            console.log(`[useChatTextMessaging][VALIDAÇÃO] Primeiros 100 caracteres do prompt system formatado:`);
            console.log(systemMessages[0].content.substring(0, 100));
            
            // Verificar se a primeira mensagem é a do sistema
            const isFirstMessage = messagesToSend[0].role === "system";
            console.log(`[useChatTextMessaging][VALIDAÇÃO] Prompt system é a primeira mensagem: ${isFirstMessage}`);
          }
          
          console.log(`[useChatTextMessaging] Enviando ${messagesToSend.length} mensagens com prompt específico da patologia`);
          
          // Send message to API with attachments
          const apiName = getActiveApiName();
          console.log(`[useChatTextMessaging] Enviando para ${apiName} com ${pathologyAttachments.length} anexos`);
          
          // Log dos anexos que serão enviados
          if (pathologyAttachments.length > 0) {
            console.log(`[useChatTextMessaging][VALIDAÇÃO] Anexos que serão enviados:`);
            pathologyAttachments.forEach((attachment, index) => {
              console.log(`[useChatTextMessaging][VALIDAÇÃO] Anexo ${index + 1}: ${attachment.name} (${attachment.type})`);
            });
          }
          
          // Verificar qual API Provider está sendo usado
          console.log(`[useChatTextMessaging][VALIDAÇÃO] API Provider ativo: ${apiName}`);
          
          const response = await sendMessage(messagesToSend, undefined, pathologyAttachments.length > 0 ? pathologyAttachments : undefined);
          
          // Calculate response time
          const endTime = performance.now();
          const responseTimeMs = Math.round(endTime - startTime);
          setResponseTime(responseTimeMs);
          
          // Log de sucesso da resposta
          console.log(`[useChatTextMessaging][VALIDAÇÃO] Resposta recebida com sucesso de ${apiName} em ${responseTimeMs}ms`);
          
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

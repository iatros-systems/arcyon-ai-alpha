import { Chat, Message } from "@/types";

/**
 * Prepara as mensagens do chat para serem enviadas para a API
 * Esta função garante que o prompt do sistema aparece como primeira mensagem, se disponível
 */
export const prepareMessagesForApi = (
  chat: Chat | { messages: Message[] }
): { role: string; content: string }[] => {
  // Extract messages from chat
  const messages = [...chat.messages];
  
  // Log para diagnóstico
  console.log(`[prepareMessagesForApi] Preparando ${messages.length} mensagens para API`);
  
  // Se tivermos metadados com pathology, vamos logar isso para diagnóstico
  if ('metadata' in chat && chat.metadata?.pathology) {
    console.log(`[prepareMessagesForApi] Chat usa a patologia: ${chat.metadata.pathology}`);
  }
  
  // Find system message (should be at the beginning typically)
  const systemMessageIndex = messages.findIndex(msg => msg.role === "system");
  const hasSystemMessage = systemMessageIndex !== -1;
  
  if (hasSystemMessage) {
    console.log(`[prepareMessagesForApi] Encontrada mensagem de sistema: "${messages[systemMessageIndex].content.substring(0, 30)}..."`);
  } else {
    console.log(`[prepareMessagesForApi] Nenhuma mensagem de sistema encontrada no chat`);
  }

  // Ensure system message comes first if it exists
  if (hasSystemMessage && systemMessageIndex > 0) {
    // Remove system message from its current position
    const systemMessage = messages.splice(systemMessageIndex, 1)[0];
    // Add it to the beginning
    messages.unshift(systemMessage);
    console.log(`[prepareMessagesForApi] Mensagem de sistema movida para o início da sequência`);
  }

  // Filter out empty or service messages
  const filteredMessages = messages.filter(msg => {
    // Skip empty messages
    if (!msg.content || msg.content.trim() === "") return false;
    
    // Skip service messages (used for UI notifications only)
    if (msg.role === "service") return false;
    
    return true;
  });

  if (filteredMessages.length !== messages.length) {
    console.log(`[prepareMessagesForApi] Removidas ${messages.length - filteredMessages.length} mensagens vazias ou de serviço`);
  }
  
  // Convert to the format expected by the API
  const formattedMessages = filteredMessages.map(msg => ({
    role: msg.role === "user" ? "user" : 
          msg.role === "assistant" ? "assistant" : 
          msg.role === "system" ? "system" : "user",
    content: msg.content
  }));
  
  console.log(`[prepareMessagesForApi] Mensagens formatadas para API: ${formattedMessages.length}`);
  
  // Log do prompt do sistema para diagnóstico final
  const finalSystemMessage = formattedMessages.find(msg => msg.role === "system");
  if (finalSystemMessage) {
    console.log(`[prepareMessagesForApi] Prompt final do sistema (primeiros 50 chars): "${finalSystemMessage.content.substring(0, 50)}..."`);
  }

  return formattedMessages;
};

export const createFileMessage = (messageContent: string, files: File[]): string => {
  if (files.length === 0) return messageContent;
  
  // Create a list of file names to append to the message
  const fileNames = files.map(file => file.name).join(", ");
  
  // If the user provided a message, append file info, otherwise just mention the files
  if (messageContent.trim()) {
    return `${messageContent}\n\nArquivos anexados: ${fileNames}`;
  } else {
    return `Arquivos anexados: ${fileNames}`;
  }
};

// Add function to update system prompt in an existing chat
export const updateChatSystemPrompt = (chat: Chat, newSystemPrompt: string): Chat => {
  if (!chat) return chat;
  
  // Find the system message
  const systemMessageIndex = chat.messages.findIndex(m => m.role === "system");
  
  // Clone the messages array
  const updatedMessages = [...chat.messages];
  
  if (systemMessageIndex >= 0) {
    // Update existing system message
    updatedMessages[systemMessageIndex] = {
      ...updatedMessages[systemMessageIndex],
      content: newSystemPrompt
    };
  } else {
    // Add new system message if it doesn't exist
    updatedMessages.unshift({
      id: crypto.randomUUID(),
      role: "system",
      content: newSystemPrompt,
      createdAt: new Date().toISOString()
    });
  }
  
  // Return updated chat
  return {
    ...chat,
    messages: updatedMessages,
    updatedAt: new Date().toISOString()
  };
};

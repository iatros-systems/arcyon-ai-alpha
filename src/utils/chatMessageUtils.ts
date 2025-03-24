
import { Chat, Message } from "@/types";

export const prepareMessagesForApi = (currentChat: Chat | null): { role: string; content: string }[] => {
  if (!currentChat) return [];
  
  // Get system message
  const systemMessage = currentChat.messages.find(m => m.role === "system");
  
  // Prepare messages array - excluding system message for now
  const messagesToSend = currentChat.messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role,
      content: m.content,
    }));
  
  // Always add system message as the first message if it exists
  if (systemMessage) {
    messagesToSend.unshift({
      role: systemMessage.role,
      content: systemMessage.content,
    });
  }
  
  return messagesToSend;
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


import { Chat, Message } from "@/types";

export const prepareMessagesForApi = (currentChat: Chat | null): { role: string; content: string }[] => {
  if (!currentChat) return [];
  
  // Get system message
  const systemMessage = currentChat.messages.find(m => m.role === "system");
  
  // Prepare messages array
  const messagesToSend = currentChat.messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role,
      content: m.content,
    }));
  
  // Add system message as the first message if it exists
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

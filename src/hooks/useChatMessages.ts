
import { useState } from "react";
import { useChatStore } from "@/store/chat-store";
import { hasApiKey } from "@/services/api";
import { useChatFileProcessing } from "@/hooks/useChatFileProcessing";
import { useChatTextMessaging } from "@/hooks/useChatTextMessaging";
import { createFileMessage } from "@/utils/chatMessageUtils";

export const useChatMessages = () => {
  const { currentChat } = useChatStore();
  const [loading, setLoading] = useState(false);
  const fileProcessing = useChatFileProcessing();
  const textMessaging = useChatTextMessaging();

  // Mantenha um único estado de loading
  const updateLoading = (isLoading: boolean) => {
    setLoading(isLoading);
    if (fileProcessing.loading !== isLoading) fileProcessing.setLoading(isLoading);
    if (textMessaging.loading !== isLoading) textMessaging.setLoading(isLoading);
  };

  const handleSendMessage = async (messageContent: string, files?: File[]) => {
    if (!hasApiKey()) {
      return false;
    }

    // Handle files if present
    if (files && files.length > 0) {
      let finalMessage = createFileMessage(messageContent, files);
      
      // Process each file
      for (const file of files) {
        // For images
        if (file.type.startsWith('image/')) {
          return fileProcessing.processImageFile(file, messageContent);
        }
        
        // For PDFs
        if (file.type === 'application/pdf') {
          return fileProcessing.processPdfFile(file);
        }
      }
      
      return true; // Return early as we've handled the files
    }

    // Regular text message handling
    return textMessaging.sendTextMessage(messageContent);
  };

  return {
    loading,
    handleSendMessage,
    currentChat
  };
};

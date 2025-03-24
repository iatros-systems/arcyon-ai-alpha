
import { useState } from "react";
import { useChatStore } from "@/store/chat-store";
import { hasApiKey } from "@/services/api";
import { useChatFileProcessing } from "@/hooks/useChatFileProcessing";
import { useChatTextMessaging } from "@/hooks/useChatTextMessaging";
import { createFileMessage } from "@/utils/chatMessageUtils";

export const useChatMessages = () => {
  const [loading, setLoading] = useState(false);
  const { currentChat } = useChatStore();
  const fileProcessing = useChatFileProcessing();
  const textMessaging = useChatTextMessaging();

  // Sync loading states
  if (fileProcessing.loading !== loading) setLoading(fileProcessing.loading);
  if (textMessaging.loading !== loading) setLoading(textMessaging.loading);

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

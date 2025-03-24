
import { useToast } from "@/hooks/use-toast";
import { sendMessageToGemini } from "@/services/api";
import { Chat } from "@/types";
import { handleFileUpload } from "./FileUploadHandler";

interface MessageHandlerProps {
  currentChat: Chat | null;
  addMessage: (content: string, role: "user" | "assistant" | "system") => void;
  setLoading: (loading: boolean) => void;
}

export const useMessageHandler = ({
  currentChat,
  addMessage,
  setLoading,
}: MessageHandlerProps) => {
  const { toast } = useToast();

  const handleSendMessage = async (messageContent: string, files?: File[]) => {
    // Handle files if present
    if (files && files.length > 0) {
      const systemMessage = currentChat?.messages.find(m => m.role === "system");
      await handleFileUpload(files, messageContent, {
        addMessage,
        systemMessage,
        setLoading,
      });
      return;
    }

    // Regular text message handling
    // Add user message to chat
    addMessage(messageContent, "user");
    
    setLoading(true);
    
    try {
      // Prepare messages for API (excluding system messages)
      const messagesToSend = currentChat
        ? currentChat.messages
            .filter((m) => m.role !== "system")
            .map((m) => ({
              role: m.role,
              content: m.content,
            }))
        : [];
      
      // Add system message as the first message
      const systemMessage = currentChat?.messages.find(m => m.role === "system");
      if (systemMessage) {
        messagesToSend.unshift({
          role: systemMessage.role,
          content: systemMessage.content,
        });
      }
      
      // Add the new message
      messagesToSend.push({
        role: "user",
        content: messageContent,
      });
      
      // Send messages to API
      const response = await sendMessageToGemini(messagesToSend);
      
      // Add AI response to chat
      addMessage(response, "assistant");
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Erro ao enviar mensagem",
        description: "Verifique sua conexão e configuração da API.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return { handleSendMessage };
};

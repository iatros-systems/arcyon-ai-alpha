
import { useState } from "react";
import { useChatStore } from "@/store/chat-store";
import { sendMessageToGemini } from "@/services/api";
import { useToast } from "@/components/ui/use-toast";

export const useChatFileProcessing = () => {
  const [loading, setLoading] = useState(false);
  const { currentChat, addMessage } = useChatStore();
  const { toast } = useToast();

  const processImageFile = async (file: File, messageContent: string): Promise<boolean> => {
    try {
      // Add the file info message to the chat
      const fileNames = file.name;
      const finalMessage = messageContent
        ? `${messageContent}\n\nArquivos anexados: ${fileNames}`
        : `Arquivos anexados: ${fileNames}`;
      
      addMessage(finalMessage, "user");
        
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target?.result as string;
        
        // Create a message with the image data for the AI to process
        const imageMessage = `[Imagem: ${file.name}]\n${base64Data}`;
        
        setLoading(true);
        
        try {
          // Send the image data to Gemini
          const systemMessage = currentChat?.messages.find(m => m.role === "system");
          const messagesToSend = [];
          
          if (systemMessage) {
            messagesToSend.push({
              role: systemMessage.role,
              content: systemMessage.content,
            });
          }
          
          messagesToSend.push({
            role: "user",
            content: imageMessage,
          });
          
          const response = await sendMessageToGemini(messagesToSend);
          addMessage(response, "assistant");
        } catch (error) {
          console.error("Error processing image:", error);
          toast({
            title: "Erro ao processar imagem",
            description: "Não foi possível analisar a imagem.",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      };
      reader.readAsDataURL(file);
      return true;
    } catch (error) {
      console.error("Error processing file:", error);
      toast({
        title: "Erro ao processar arquivo",
        description: "Não foi possível processar o arquivo.",
        variant: "destructive",
      });
      return false;
    }
  };

  const processPdfFile = (file: File) => {
    toast({
      title: "PDF recebido",
      description: "O PDF foi anexado, mas a extração do conteúdo não está disponível no momento.",
      variant: "default",
    });
    return true;
  };

  return {
    loading,
    setLoading,
    processImageFile,
    processPdfFile
  };
};

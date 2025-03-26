import { useState } from "react";
import { useChatStore } from "@/store/chat-store";
import { useToast } from "@/components/ui/use-toast";
import { sendMessage, hasAnyApiConfigured, getActiveApiName } from "@/services/messageService";

export const useChatFileProcessing = () => {
  const { currentChat, addMessage } = useChatStore();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const processImageFile = async (file: File, messageContent: string): Promise<boolean> => {
    if (!hasAnyApiConfigured()) {
      toast({
        title: "API não configurada",
        description: "Configure pelo menos uma API nas configurações.",
        variant: "destructive",
      });
      return false;
    }
    
    try {
      // Add the file info message to the chat
      const fileNames = file.name;
      const finalMessage = messageContent
        ? `${messageContent}\n\nArquivos anexados: ${fileNames}`
        : `Arquivos anexados: ${fileNames}`;
      
      addMessage(finalMessage, "user");
        
      const reader = new FileReader();
      
      return new Promise((resolve) => {
        reader.onload = async (e) => {
          const base64Data = e.target?.result as string;
          
          // Create a message with the image data for the AI to process
          const imageMessage = `[Imagem: ${file.name}]\n${base64Data}`;
          
          setLoading(true);
          
          try {
            // Get the name of the active API for the toast notification
            const apiName = getActiveApiName();
            
            // Send the image data to the selected API
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
            
            const response = await sendMessage(messagesToSend);
            
            // Add AI response to chat with reasoning content if available
            if (response.reasoningContent) {
              addMessage(response.content, "assistant", response.reasoningContent);
            } else {
              addMessage(response.content, "assistant");
            }
            
            // Show a subtle toast notification indicating which API was used
            toast({
              title: `Imagem processada por ${apiName}`,
              description: "A imagem foi analisada com sucesso.",
              duration: 3000,
            });
            
            resolve(true);
          } catch (error) {
            console.error("Error processing image:", error);
            toast({
              title: "Erro ao processar imagem",
              description: "Não foi possível analisar a imagem.",
              variant: "destructive",
            });
            resolve(false);
          } finally {
            setLoading(false);
          }
        };
        
        reader.onerror = () => {
          toast({
            title: "Erro ao ler arquivo",
            description: "Não foi possível ler o arquivo de imagem.",
            variant: "destructive",
          });
          resolve(false);
        };
        
        reader.readAsDataURL(file);
      });
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

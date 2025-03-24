
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { sendMessageToGemini } from "@/services/api";
import { Message } from "@/types";

interface FileUploadHandlerProps {
  addMessage: (content: string, role: "user" | "assistant" | "system") => void;
  systemMessage?: Message;
  setLoading: (loading: boolean) => void;
}

export const handleFileUpload = async (
  files: File[],
  messageContent: string,
  { addMessage, systemMessage, setLoading }: FileUploadHandlerProps
) => {
  const { toast } = useToast();
  
  // Create a list of file names to append to the message
  const fileNames = files.map(file => file.name).join(", ");
  
  // If the user provided a message, append file info, otherwise just mention the files
  let finalMessage = messageContent.trim() 
    ? `${messageContent}\n\nArquivos anexados: ${fileNames}`
    : `Arquivos anexados: ${fileNames}`;
  
  // Add the file info message to the chat
  addMessage(finalMessage, "user");
  
  // For each file, read its content and process it
  for (const file of files) {
    try {
      // For images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const base64Data = e.target?.result as string;
          
          // Create a message with the image data for the AI to process
          const imageMessage = `[Imagem: ${file.name}]\n${base64Data}`;
          
          setLoading(true);
          
          try {
            // Send the image data to Gemini
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
        return; // Return early since we're handling images separately
      }
      
      // For PDFs
      if (file.type === 'application/pdf') {
        // Just notify that PDF was uploaded but can't process content at this time
        toast({
          title: "PDF recebido",
          description: "O PDF foi anexado, mas a extração do conteúdo não está disponível no momento.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Error processing file:", error);
      toast({
        title: "Erro ao processar arquivo",
        description: "Não foi possível processar o arquivo.",
        variant: "destructive",
      });
    }
  }
};

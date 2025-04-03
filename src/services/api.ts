import { GeminiResponse } from "@/types";
import { saveApiKeyToFirestore, getApiKeyFromFirestore } from "./firestoreService";

// Variável para armazenar a chave da API
let GEMINI_API_KEY = "";

// Função para obter a chave da API
export const getApiKey = async () => {
  if (!GEMINI_API_KEY) {
    // Get from Firestore
    const firestoreKey = await getApiKeyFromFirestore('gemini');
    if (firestoreKey) {
      GEMINI_API_KEY = firestoreKey;
    }
  }
  return GEMINI_API_KEY;
};

// Função para definir a chave da API
export const setApiKey = (key: string) => {
  GEMINI_API_KEY = key;
  
  // Save to Firestore only
  saveApiKeyToFirestore('gemini', key)
    .catch(error => console.error('Error saving Gemini API key to Firestore:', error));
};

// Função para verificar se existe uma chave de API
export const hasApiKey = () => {
  return !!GEMINI_API_KEY;
};

// Função assíncrona para verificar se existe uma chave de API
export const hasApiKeyAsync = async () => {
  if (GEMINI_API_KEY) return true;
  
  // Check Firestore
  const firestoreKey = await getApiKeyFromFirestore('gemini');
  if (firestoreKey) {
    GEMINI_API_KEY = firestoreKey;
    return true;
  }
  
  return false;
};

// Interface para representar um arquivo anexado
export interface FileAttachment {
  name: string;
  type: string;
  size: number;
  base64: string;
}

// Função para determinar o MIME type com base na extensão do arquivo
export const getMimeTypeFromExtension = (filename: string): string => {
  const extension = filename.split('.').pop()?.toLowerCase();
  
  const mimeTypes: Record<string, string> = {
    'pdf': 'application/pdf',
    'txt': 'text/plain',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'csv': 'text/csv',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg'
  };
  
  return extension && mimeTypes[extension] ? mimeTypes[extension] : 'application/octet-stream';
};

export const sendMessageToGemini = async (
  messages: { role: string; content: string }[],
  attachments?: FileAttachment[]
): Promise<string> => {
  const apiKey = await getApiKey();
  
  if (!apiKey) {
    throw new Error("API key is required");
  }

  // Get model parameters from localStorage or use defaults
  const { temperature, topP, topK, maxTokens: maxOutputTokens } = getStoredModelSettings();

  try {
    // Format messages for Gemini API
    const formattedMessages = messages.map(msg => {
      // Check if the message contains an image (base64 data)
      const isImageMessage = msg.content.includes('[Imagem:') && msg.content.includes('data:image/');
      
      // Convert 'user' and 'assistant' roles to match Gemini's expected format
      let role = msg.role;
      if (role === "user") role = "user";
      if (role === "assistant") role = "model";
      if (role === "system") role = "user"; // Gemini doesn't have a system role, prepend to first user message
      
      // Se for uma mensagem do sistema e tiver anexos, adicione-os à mensagem
      if (role === "user" && msg.role === "system" && attachments && attachments.length > 0) {
        const contentParts = [];
        
        // Adicionar o texto do prompt do sistema
        contentParts.push({ text: msg.content });
        
        // Adicionar cada anexo como uma parte da mensagem
        for (const attachment of attachments) {
          // Determinar o MIME type correto
          const mimeType = attachment.type || getMimeTypeFromExtension(attachment.name);
          
          // Adicionar o arquivo como inline data
          contentParts.push({
            inlineData: {
              mimeType: mimeType,
              data: attachment.base64
            }
          });
        }
        
        return {
          role,
          parts: contentParts
        };
      }
      
      // If this is an image message, format it specially for the Gemini 1.5 API
      if (isImageMessage && role === "user") {
        const contentParts = [];
        
        // Extract the base64 data from the message
        const base64Match = msg.content.match(/data:image\/[^;]+;base64,([^"]+)/);
        const textContent = msg.content.split('\n')[0]; // Get the text part
        
        // Add the text part
        contentParts.push({ text: textContent });
        
        // Add the image part if we found base64 data
        if (base64Match && base64Match[1]) {
          contentParts.push({
            inlineData: {
              mimeType: msg.content.includes('data:image/png') ? 'image/png' : 'image/jpeg',
              data: base64Match[1]
            }
          });
        }
        
        return {
          role,
          parts: contentParts
        };
      }
      
      // Regular text message
      return {
        role,
        parts: [{ text: msg.content }]
      };
    });

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-thinking-exp-01-21:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: formattedMessages,
          generationConfig: {
            temperature,
            topP,
            topK,
            maxOutputTokens,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `API error: ${response.status} - ${JSON.stringify(errorData)}`
      );
    }

    const data = await response.json() as GeminiResponse;
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error("No response from Gemini");
    }

    const textResponse = data.candidates[0].content.parts[0].text;
    // Remove o texto indesejado da resposta
    const cleanedResponse = textResponse.replace(/# No tool code needed for this request\./g, '').trim();
    return cleanedResponse;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error;
  }
};

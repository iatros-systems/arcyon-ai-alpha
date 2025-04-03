import { sendMessageToGemini, FileAttachment } from "./api";
import { sendMessageToDeepSeek } from "./deepseek";
import { ApiProvider } from "@/hooks/useSettings";
import { hasApiKey } from "./api";
import { hasDeepSeekApiKeySync } from "./deepseek";
import { getApiKeyFromFirestore } from "./firestoreService";

// Interface para a resposta unificada das APIs
export interface ApiResponse {
  content: string;
  reasoningContent?: string;
}

// Variáveis para armazenar configurações
let preferredApiProvider: ApiProvider | null = null;
let showModelThinkingSetting: boolean | null = null;

// Função para carregar configurações do Firestore
const loadSettings = async () => {
  try {
    // Tentar obter configurações do Firestore
    const configDoc = await getApiKeyFromFirestore('config');
    if (configDoc) {
      const config = JSON.parse(configDoc);
      preferredApiProvider = config.preferredApiProvider || "gemini";
      showModelThinkingSetting = config.showModelThinking !== false;
    }
  } catch (error) {
    console.error("Erro ao carregar configurações do Firestore:", error);
  }
};

// Inicializar carregamento de configurações
loadSettings();

/**
 * Envia uma mensagem para a API selecionada pelo usuário
 * @param messages Array de mensagens a serem enviadas
 * @param preferredProvider API preferida pelo usuário
 * @param attachments Arquivos anexados para contextualizar o system prompt
 * @returns Resposta da API com conteúdo e possível raciocínio
 */
export const sendMessage = async (
  messages: { role: string; content: string }[],
  preferredProvider?: ApiProvider,
  attachments?: FileAttachment[]
): Promise<ApiResponse> => {
  // Obtém a API preferida
  const provider = preferredProvider || preferredApiProvider || "gemini";
  
  // Verifica se o usuário deseja ver o pensamento do modelo
  const showModelThinking = showModelThinkingSetting !== false;
  
  // Verifica se a API preferida está disponível
  if (provider === "deepseek" && hasDeepSeekApiKeySync()) {
    try {
      const response = await sendMessageToDeepSeek(messages);
      
      // Se o usuário não deseja ver o pensamento do modelo, remove o conteúdo de raciocínio
      if (!showModelThinking) {
        return { content: response.content };
      }
      
      return response;
    } catch (error) {
      console.error("Erro ao enviar mensagem para DeepSeek, tentando Gemini como fallback:", error);
      // Fallback para Gemini se DeepSeek falhar e Gemini estiver disponível
      if (hasApiKey()) {
        const geminiResponse = await sendMessageToGemini(messages, attachments);
        return { content: geminiResponse };
      }
      throw error;
    }
  } else if (provider === "gemini" && hasApiKey()) {
    try {
      const geminiResponse = await sendMessageToGemini(messages, attachments);
      return { content: geminiResponse };
    } catch (error) {
      console.error("Erro ao enviar mensagem para Gemini, tentando DeepSeek como fallback:", error);
      // Fallback para DeepSeek se Gemini falhar e DeepSeek estiver disponível
      if (hasDeepSeekApiKeySync()) {
        const response = await sendMessageToDeepSeek(messages);
        
        // Se o usuário não deseja ver o pensamento do modelo, remove o conteúdo de raciocínio
        if (!showModelThinking) {
          return { content: response.content };
        }
        
        return response;
      }
      throw error;
    }
  } else {
    // Se a API preferida não estiver disponível, tenta qualquer uma das disponíveis
    if (hasApiKey()) {
      const geminiResponse = await sendMessageToGemini(messages, attachments);
      return { content: geminiResponse };
    } else if (hasDeepSeekApiKeySync()) {
      const response = await sendMessageToDeepSeek(messages);
      
      // Se o usuário não deseja ver o pensamento do modelo, remove o conteúdo de raciocínio
      if (!showModelThinking) {
        return { content: response.content };
      }
      
      return response;
    } else {
      throw new Error("Nenhuma chave de API configurada. Configure pelo menos uma API nas configurações.");
    }
  }
};

/**
 * Verifica se há pelo menos uma API configurada
 * @returns true se pelo menos uma API estiver configurada
 */
export const hasAnyApiConfigured = (): boolean => {
  return hasApiKey() || hasDeepSeekApiKeySync();
};

/**
 * Obtém o nome da API que será utilizada com base na preferência
 * @returns Nome da API que será utilizada
 */
export const getActiveApiName = (): string => {
  const provider = preferredApiProvider || "gemini";
  const showModelThinking = showModelThinkingSetting !== false;
  
  if (provider === "deepseek" && hasDeepSeekApiKeySync()) {
    return showModelThinking ? "DeepSeek R1 (com raciocínio)" : "DeepSeek R1";
  } else if (provider === "gemini" && hasApiKey()) {
    return "Google Gemini";
  } else if (hasApiKey()) {
    return "Google Gemini";
  } else if (hasDeepSeekApiKeySync()) {
    return showModelThinking ? "DeepSeek R1 (com raciocínio)" : "DeepSeek R1";
  } else {
    return "Nenhuma API configurada";
  }
};

/**
 * Verifica se o pensamento do modelo está ativado
 * @returns true se o pensamento do modelo estiver ativado
 */
export const isModelThinkingEnabled = (): boolean => {
  return showModelThinkingSetting !== false;
};
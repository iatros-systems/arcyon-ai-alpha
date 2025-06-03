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
let settingsLoaded = false;
let lastSettingsLoadTime = 0;
const SETTINGS_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutos em milissegundos

// Função para carregar configurações do Firestore
const loadSettings = async (forceReload = false): Promise<void> => {
  try {
    // Verificar se precisa recarregar (primeira vez, forçado ou intervalo expirado)
    const now = Date.now();
    if (settingsLoaded && !forceReload && (now - lastSettingsLoadTime < SETTINGS_REFRESH_INTERVAL)) {
      console.log("[loadSettings] Usando configurações em cache. Última atualização há", Math.round((now - lastSettingsLoadTime)/1000), "segundos");
      return;
    }

    console.log("[loadSettings] Carregando configurações do Firestore...");
    
    // Tentar obter configurações do Firestore
    const configDoc = await getApiKeyFromFirestore('config');
    if (configDoc) {
      try {
        const config = JSON.parse(configDoc);
        console.log("[loadSettings] Configurações carregadas do Firestore:", 
          JSON.stringify({
            preferredApiProvider: config.preferredApiProvider,
            showModelThinking: config.showModelThinking
          }));
        
        preferredApiProvider = config.preferredApiProvider || "gemini";
        showModelThinkingSetting = config.showModelThinking !== false;
        settingsLoaded = true;
        lastSettingsLoadTime = now;
      } catch (error) {
        console.error("[loadSettings] Erro ao processar configurações JSON:", error);
        // Manter valores anteriores ou usar padrões
        if (!preferredApiProvider) preferredApiProvider = "gemini";
        if (showModelThinkingSetting === null) showModelThinkingSetting = true;
      }
    } else {
      console.log("[loadSettings] Nenhuma configuração encontrada no Firestore, usando valores padrão");
      // Usar valores padrão
      preferredApiProvider = "gemini";
      showModelThinkingSetting = true;
    }
  } catch (error) {
    console.error("[loadSettings] Erro ao carregar configurações do Firestore:", error);
    // Manter valores anteriores ou usar padrões
    if (!preferredApiProvider) preferredApiProvider = "gemini";
    if (showModelThinkingSetting === null) showModelThinkingSetting = true;
  } finally {
    // Mesmo em caso de erro, marcar como carregado para evitar chamadas repetidas
    settingsLoaded = true;
    if (lastSettingsLoadTime === 0) lastSettingsLoadTime = Date.now();
  }
};

// Função para garantir que as configurações estejam carregadas
const ensureSettingsLoaded = async (): Promise<void> => {
  if (!settingsLoaded || (Date.now() - lastSettingsLoadTime > SETTINGS_REFRESH_INTERVAL)) {
    await loadSettings();
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
  await ensureSettingsLoaded();
  
  // Obtém a API preferida
  const provider = preferredProvider || preferredApiProvider || "gemini";
  
  // Verifica se o usuário deseja ver o pensamento do modelo
  const showModelThinking = showModelThinkingSetting !== false;
  
  console.log(`[messageService] Enviando mensagem para API ${provider} com ${messages.length} mensagens`);
  console.log(`[messageService] Anexos: ${attachments ? attachments.length : 0}`);
  
  // Verifica se existe pelo menos uma mensagem do sistema
  const hasSystemPrompt = messages.some(msg => msg.role === "system");
  console.log(`[messageService] Prompt do sistema presente: ${hasSystemPrompt}`);
  
  // Verifica se a API preferida está disponível
  if (provider === "gemini" && hasApiKey()) {
    try {
      console.log(`[messageService] Usando Gemini como provedor principal`);
      const geminiResponse = await sendMessageToGemini(messages, attachments);
      return { content: geminiResponse };
    } catch (error) {
      console.error("[messageService] Erro ao enviar mensagem para Gemini, tentando DeepSeek como fallback:", error);
      
      // Fallback para DeepSeek se Gemini falhar e DeepSeek estiver disponível
      if (hasDeepSeekApiKeySync()) {
        console.log(`[messageService] Usando DeepSeek como fallback`);
        try {
          const response = await sendMessageToDeepSeek(messages);
          
          // Se o usuário não deseja ver o pensamento do modelo, remove o conteúdo de raciocínio
          if (!showModelThinking) {
            return { content: response.content };
          }
          
          return response;
        } catch (deepseekError) {
          console.error("[messageService] Erro no fallback para DeepSeek:", deepseekError);
          throw deepseekError;
        }
      }
      throw error;
    }
  } else if (provider === "deepseek" && hasDeepSeekApiKeySync()) {
    try {
      console.log(`[messageService] Usando DeepSeek como provedor principal`);
      const response = await sendMessageToDeepSeek(messages);
      
      // Se o usuário não deseja ver o pensamento do modelo, remove o conteúdo de raciocínio
      if (!showModelThinking) {
        return { content: response.content };
      }
      
      return response;
    } catch (error) {
      console.error("[messageService] Erro ao enviar mensagem para DeepSeek, tentando Gemini como fallback:", error);
      
      // Fallback para Gemini se DeepSeek falhar e Gemini estiver disponível
      if (hasApiKey()) {
        console.log(`[messageService] Usando Gemini como fallback`);
        try {
          const geminiResponse = await sendMessageToGemini(messages, attachments);
          return { content: geminiResponse };
        } catch (geminiError) {
          console.error("[messageService] Erro no fallback para Gemini:", geminiError);
          throw geminiError;
        }
      }
      throw error;
    }
  } else {
    // Se a API preferida não estiver disponível, tenta qualquer uma das disponíveis
    console.log(`[messageService] API preferida ${provider} não disponível, tentando alternativas`);
    
    if (hasApiKey()) {
      console.log(`[messageService] Usando Gemini como alternativa`);
      try {
        const geminiResponse = await sendMessageToGemini(messages, attachments);
        return { content: geminiResponse };
      } catch (error) {
        console.error("[messageService] Erro ao usar Gemini como alternativa:", error);
        
        // Se Gemini falhar, tenta DeepSeek
        if (hasDeepSeekApiKeySync()) {
          console.log(`[messageService] Tentando DeepSeek como última opção`);
          const response = await sendMessageToDeepSeek(messages);
          
          if (!showModelThinking) {
            return { content: response.content };
          }
          
          return response;
        }
        throw error;
      }
    } else if (hasDeepSeekApiKeySync()) {
      console.log(`[messageService] Usando DeepSeek como alternativa`);
      const response = await sendMessageToDeepSeek(messages);
      
      if (!showModelThinking) {
        return { content: response.content };
      }
      
      return response;
    }
    
    throw new Error("Nenhuma API configurada. Configure pelo menos uma API para enviar mensagens.");
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
  
 if (provider === "gemini" && hasApiKey()) {
    return "Google Gemini";
  } else if (provider === "deepseek" && hasDeepSeekApiKeySync()) {
    return showModelThinking ? "DeepSeek R1 (com raciocínio)" : "DeepSeek R1";
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
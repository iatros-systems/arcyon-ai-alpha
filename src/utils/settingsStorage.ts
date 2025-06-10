// Utility functions for managing application settings in Firestore

import { FileAttachment } from "@/services/api";
import { 
  saveApiKeyToFirestore, 
  getApiKeyFromFirestore, 
  saveDataToFirestore, 
  getDataFromFirestore 
} from "@/services/firestoreService";
// Import the prompt file directly
import promptSystemEs from '@/store/prompt-system-es.md?raw';

// Importa lo necesario de Firebase Firestore
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getStorage, ref, getMetadata } from "firebase/storage";

// API Key management - Deprecated, use functions from api.ts instead
export const getStoredApiKey = async (): Promise<string> => {
  return await getApiKeyFromFirestore('gemini') || "";
};

export const setStoredApiKey = async (key: string): Promise<void> => {
  await saveApiKeyToFirestore('gemini', key);
};

export const hasStoredApiKey = async (): Promise<boolean> => {
  const key = await getStoredApiKey();
  return !!key;
};

// Model settings
export const getStoredModelSettings = async () => {
  try {
    const modelSettingsJson = await getDataFromFirestore('modelSettings');
    if (modelSettingsJson) {
      const settings = JSON.parse(modelSettingsJson);
      return {
        temperature: settings.temperature || 0.3,
        topP: settings.topP || 0.85,
        topK: settings.topK || 40,
        maxTokens: settings.maxTokens || 4096,
        advancedMode: settings.advancedMode || false
      };
    }
  } catch (error) {
    console.error("Erro ao obter configurações do modelo:", error);
  }
  
  // Default values if no settings found
  return {
    temperature: 0.3,
    topP: 0.85,
    topK: 40,
    maxTokens: 4096,
    advancedMode: false
  };
};

// Synchronous version for backward compatibility
export const getStoredModelSettingsSync = () => {
  try {
    console.log("[getStoredModelSettingsSync] Obtendo configurações do modelo");
    // Tentar ler do localStorage
    const modelSettingsString = localStorage.getItem('modelSettings');
    if (modelSettingsString) {
      try {
        const settings = JSON.parse(modelSettingsString);
        console.log("[getStoredModelSettingsSync] Configurações encontradas no localStorage");
        return {
          temperature: settings.temperature || 0.3,
          topP: settings.topP || 0.85,
          topK: settings.topK || 40,
          maxTokens: settings.maxTokens || 4096,
          advancedMode: settings.advancedMode || false
        };
      } catch (parseError) {
        console.error("[getStoredModelSettingsSync] Erro ao analisar configurações:", parseError);
      }
    } else {
      console.log("[getStoredModelSettingsSync] Nenhuma configuração encontrada no localStorage");
    }
  } catch (error) {
    console.error("[getStoredModelSettingsSync] Erro ao obter configurações:", error);
  }
  
  // Default values
  console.log("[getStoredModelSettingsSync] Retornando valores padrão");
  return {
    temperature: 0.3,
    topP: 0.85,
    topK: 40,
    maxTokens: 4096,
    advancedMode: false
  };
};

export const saveModelSettings = async (settings: {
  temperature: number;
  topP: number;
  topK: number;
  maxTokens: number;
  advancedMode: boolean;
}): Promise<void> => {
  try {
    await saveDataToFirestore('modelSettings', JSON.stringify(settings));
  } catch (error) {
    console.error("Erro ao salvar configurações do modelo:", error);
  }
};

// System prompt settings
export const getStoredSystemPromptSettings = async () => {
  try {
    const promptSettingsJson = await getDataFromFirestore('systemPromptSettings');
    if (promptSettingsJson) {
      const settings = JSON.parse(promptSettingsJson);
      return {
        pathology: settings.pathology || "",
        systemInstructions: settings.systemInstructions || ""
      };
    }
  } catch (error) {
    console.error("Erro ao obter configurações do system prompt:", error);
  }
  
  // Default values if no settings found
  return {
    pathology: "",
    systemInstructions: ""
  };
};

// Synchronous version for backward compatibility
export const getStoredSystemPromptSettingsSync = () => {
  // Default values
  return {
    pathology: "",
    systemInstructions: ""
  };
};

export const saveSystemPromptSettings = async (settings: {
  pathology: string;
  systemInstructions: string;
}): Promise<void> => {
  try {
    await saveDataToFirestore('systemPromptSettings', JSON.stringify(settings));
  } catch (error) {
    console.error("Erro ao salvar configurações do system prompt:", error);
  }
};

// Cache para documentos específicos frequentemente acessados
interface SystemPromptSettingsCache {
  value: any;
  timestamp: number;
  expiresAt: number;
}

// Cache para systemPromptSettings
let systemPromptSettingsCache: SystemPromptSettingsCache | null = null;

// Tempo de expiração do cache (em ms): 5 minutos
const CACHE_EXPIRATION_TIME = 300 * 1000;

// Função auxiliar para verificar se um item do cache ainda é válido
const isCacheValid = <T>(cacheItem?: SystemPromptSettingsCache): boolean => {
  if (!cacheItem) return false;
  return Date.now() < cacheItem.expiresAt;
};

// Versão otimizada de getDataFromFirestore para usar cache para documentos frequentes
export const getDataFromFirestore = async (key: string): Promise<string | null> => {
  // Se for o documento systemPromptSettings e o cache for válido, use-o
  if (key === "systemPromptSettings" && systemPromptSettingsCache && isCacheValid(systemPromptSettingsCache)) {
    console.log("[getDataFromFirestore] Using cached systemPromptSettings");
    return systemPromptSettingsCache.value;
  }
  
  try {
    const db = getFirestore();
    const docRef = doc(db, "appData", key);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log(`[getDataFromFirestore] Document found for key "${key}". Document data:`, docSnap.data());
      
      // Se o documento tiver um campo 'value', retorne esse valor
      if (docSnap.data()?.value) {
        const valueStr = docSnap.data().value;
        console.log(`[getDataFromFirestore] Value field found in document. Length: ${valueStr.length} chars`);
        
        // Se for systemPromptSettings, armazene no cache
        if (key === "systemPromptSettings") {
          systemPromptSettingsCache = {
            value: valueStr,
            timestamp: Date.now(),
            expiresAt: Date.now() + CACHE_EXPIRATION_TIME
          };
        }
        
        return valueStr;
      } else {
        // Se não houver campo 'value', retorne o documento completo como string
        return JSON.stringify(docSnap.data());
      }
    } else {
      console.log(`[getDataFromFirestore] No document found for key "${key}"`);
      return null;
    }
  } catch (error) {
    console.error(`[getDataFromFirestore] Error getting document "${key}":`, error);
    return null;
  }
};

// Pathology-specific settings interface
export interface PathologySettings {
  systemPrompt: string;
  attachments: FileAttachment[];
}

// Function to save system prompt to Firestore for a specific pathology
export const saveSystemPromptToFirestore = async (pathology: string, prompt: string): Promise<void> => {
  try {
    const key = `pathology-${pathology}-system-prompt`;
    await saveDataToFirestore(key, prompt);
    console.log(`System prompt for pathology ${pathology} saved to Firestore`);
  } catch (error) {
    console.error(`Error saving system prompt for pathology ${pathology} to Firestore:`, error);
    throw error;
  }
};

// Function to get system prompt from Firestore for a specific pathology
export const getSystemPromptFromFirestore = async (pathology: string): Promise<string | null> => {
  try {
    const key = `pathology-${pathology}-system-prompt`;
    console.log(`Attempting to fetch system prompt for pathology "${pathology}" with key "${key}" from Firestore`);
    
    const prompt = await getDataFromFirestore(key);
    
    if (prompt) {
      console.log(`Successfully retrieved system prompt for pathology "${pathology}" from Firestore`);
      console.log(`Prompt content (first 50 chars): ${prompt.substring(0, 50)}...`);
      return prompt;
    } else {
      console.log(`No system prompt found for pathology "${pathology}" in Firestore`);
      return null;
    }
  } catch (error) {
    console.error(`Error getting system prompt for pathology ${pathology} from Firestore:`, error);
    return null;
  }
};

// Function to get system prompt from local file for a specific pathology
export const getSystemPromptFromLocalFile = async (pathology: string): Promise<string | null> => {
  try {
    // Use the imported prompt file directly
    console.log(`Successfully retrieved system prompt from local file for pathology "${pathology}"`);
    console.log(`Prompt content (first 50 chars): ${promptSystemEs.substring(0, 50)}...`);
    return promptSystemEs;
  } catch (error) {
    console.error(`Error getting system prompt from local file:`, error);
    return null;
  }
};

// Cache para armazenar resultados de chamadas ao Firestore
interface CacheItem<T> {
  value: T;
  timestamp: number;
  expiresAt: number;
}

// Cache para prompts de sistema e anexos
const promptsCache: Record<string, CacheItem<string>> = {};
const attachmentsCache: Record<string, CacheItem<FileAttachment[]>> = {};

// Tempo de expiração do cache (em ms): 60 segundos
const CACHE_EXPIRATION_TIME = 300 * 1000;

// Função auxiliar para verificar se um item do cache ainda é válido
const isCacheValid = <T>(cacheItem?: CacheItem<T>): boolean => {
  if (!cacheItem) return false;
  return Date.now() < cacheItem.expiresAt;
};

// Pathology-specific system prompt management
export const getPathologySystemPrompt = async (pathology: string): Promise<string> => {
  try {
    if (!pathology) {
      throw new Error("Pathology is required");
    }
    
    // Verificar cache primeiro
    const cacheKey = `prompt-${pathology}`;
    if (isCacheValid(promptsCache[cacheKey])) {
      console.log(`[getPathologySystemPrompt] Usando prompt em cache para pathology "${pathology}"`);
      return promptsCache[cacheKey].value;
    }
    
    console.log(`[getPathologySystemPrompt] Cache inválido ou inexistente para "${pathology}", buscando do Firestore...`);
    
    // Se não estiver no cache ou estiver expirado, buscar do Firestore
    const firestorePrompt = await getSystemPromptFromFirestore(pathology);

    if (firestorePrompt) {
      console.log(`[getPathologySystemPrompt] Prompt encontrado no Firestore para pathology "${pathology}"`);
      
      // Armazenar no cache
      promptsCache[cacheKey] = {
        value: firestorePrompt,
        timestamp: Date.now(),
        expiresAt: Date.now() + CACHE_EXPIRATION_TIME
      };
      
      return firestorePrompt;
    }

    // Se não encontrou no Firestore, tentar ler do arquivo local
    const localPrompt = await getSystemPromptFromLocalFile(pathology);
    if (localPrompt) {
      console.log(`[getPathologySystemPrompt] Usando prompt do arquivo local para pathology "${pathology}"`);
      
      // Armazenar no cache
      promptsCache[cacheKey] = {
        value: localPrompt,
        timestamp: Date.now(),
        expiresAt: Date.now() + CACHE_EXPIRATION_TIME
      };
      
      return localPrompt;
    }

    // Se não encontrou em nenhuma fonte, retornar o prompt padrão
    console.log(`[getPathologySystemPrompt] Nenhum prompt específico encontrado para pathology "${pathology}", usando prompt padrão`);
    
    // Armazenar no cache
    promptsCache[cacheKey] = {
      value: "",
      timestamp: Date.now(),
      expiresAt: Date.now() + CACHE_EXPIRATION_TIME
    };
    
    return "";
  } catch (error) {
    console.error(`[getPathologySystemPrompt] Error getting system prompt for pathology "${pathology}":`, error);
    return "";
  }
};

// Pathology-specific attachments management
export const getPathologyAttachments = async (pathology: string): Promise<FileAttachment[]> => {
  try {
    if (!pathology || pathology === "undefined") {
      console.log("[getPathologyAttachments] Pathology is undefined or invalid, returning empty attachments array");
      return [];
    }

    // Verificar cache primeiro
    const cacheKey = `attachments-${pathology}`;
    if (isCacheValid(attachmentsCache[cacheKey])) {
      console.log(`[getPathologyAttachments] Usando anexos em cache para pathology "${pathology}"`);
      return attachmentsCache[cacheKey].value;
    }
    
    console.log(`[getPathologyAttachments] Fetching attachments for pathology: "${pathology}"`);
    
    // Obter anexos do documento correto no Firestore
    const key = `pathology-${pathology}-attachments`;
    const attachmentsJson = await getDataFromFirestore(key);
    
    if (!attachmentsJson) {
      console.log(`[getPathologyAttachments] No attachments found for pathology "${pathology}"`);
      
      // Armazenar resultado vazio no cache
      attachmentsCache[cacheKey] = {
        value: [],
        timestamp: Date.now(),
        expiresAt: Date.now() + CACHE_EXPIRATION_TIME
      };
      
      return [];
    }
    
    let attachments: FileAttachment[];
    try {
      attachments = JSON.parse(attachmentsJson);
      console.log(`[getPathologyAttachments] Found ${attachments.length} attachments for pathology "${pathology}"`);
    } catch (parseError) {
      console.error(`[getPathologyAttachments] Error parsing attachments JSON:`, parseError);
      
      // Armazenar resultado vazio no cache em caso de erro
      attachmentsCache[cacheKey] = {
        value: [],
        timestamp: Date.now(),
        expiresAt: Date.now() + CACHE_EXPIRATION_TIME
      };
      
      return [];
    }
    
    if (!Array.isArray(attachments)) {
      console.log(`[getPathologyAttachments] Attachments data is not an array, returning empty array`);
      
      // Armazenar resultado vazio no cache
      attachmentsCache[cacheKey] = {
        value: [],
        timestamp: Date.now(),
        expiresAt: Date.now() + CACHE_EXPIRATION_TIME
      };
      
      return [];
    }
    
    // Verificar se cada anexo realmente existe no Storage
    const validatedAttachments: FileAttachment[] = [];
    const storage = getStorage();
    
    for (const attachment of attachments) {
      try {
        // Criar referência para verificar se o arquivo existe no Storage
        const storageRef = ref(storage, `arcyon/prompts-files/${pathology}/${attachment.name}`);
        
        try {
          // Tentar obter metadados do arquivo (verificar se existe)
          await getMetadata(storageRef);
          console.log(`[getPathologyAttachments] Attachment "${attachment.name}" exists in Storage`);
          validatedAttachments.push(attachment);
        } catch (metadataError) {
          console.warn(`[getPathologyAttachments] ⚠️ Attachment "${attachment.name}" configured for pathology "${pathology}" does not exist in Firebase Storage. Skipping this attachment.`);
          // Não adicionar ao array de anexos válidos
        }
      } catch (error) {
        console.error(`[getPathologyAttachments] Error checking attachment "${attachment.name}":`, error);
        // Não adicionar ao array de anexos válidos
      }
    }
    
    console.log(`[getPathologyAttachments] Returning ${validatedAttachments.length} valid attachments for pathology "${pathology}"`);
    
    // Armazenar no cache
    attachmentsCache[cacheKey] = {
      value: validatedAttachments,
      timestamp: Date.now(),
      expiresAt: Date.now() + CACHE_EXPIRATION_TIME
    };
    
    return validatedAttachments;
  } catch (error) {
    console.error(`[getPathologyAttachments] Error getting attachments for pathology "${pathology}":`, error);
    return [];
  }
};

// Função para limpar o cache quando necessário (por exemplo, após uma atualização)
export const clearSettingsCache = (pathology?: string): void => {
  if (pathology) {
    // Limpar apenas o cache para uma patologia específica
    delete promptsCache[`prompt-${pathology}`];
    delete attachmentsCache[`attachments-${pathology}`];
    console.log(`[clearSettingsCache] Cache limpo para pathology "${pathology}"`);
  } else {
    // Limpar todo o cache
    Object.keys(promptsCache).forEach(key => delete promptsCache[key]);
    Object.keys(attachmentsCache).forEach(key => delete attachmentsCache[key]);
    console.log(`[clearSettingsCache] Todo o cache foi limpo`);
  }
};

// Função para invalidar o cache após salvar novas configurações
export const savePathologySystemPrompt = async (pathology: string, prompt: string): Promise<void> => {
  try {
    await saveSystemPromptToFirestore(pathology, prompt);
    
    // Invalidar o cache após a atualização
    clearSettingsCache(pathology);
  } catch (error) {
    console.error(`[savePathologySystemPrompt] Error saving system prompt for pathology ${pathology}:`, error);
    throw error;
  }
};

// Função para invalidar o cache após salvar novos anexos
export const savePathologyAttachments = async (pathology: string, attachments: FileAttachment[]): Promise<void> => {
  try {
    // Verificação defensiva para evitar acessos ao Firestore com pathology indefinida
    if (!pathology || pathology === "undefined") {
      console.log("[savePathologyAttachments] Pathology is undefined, skipping save operation");
      return;
    }
    
    const key = `pathology-${pathology}-attachments`;
    await saveDataToFirestore(key, JSON.stringify(attachments));
    
    // Invalidar o cache após a atualização
    clearSettingsCache(pathology);
  } catch (error) {
    console.error("Error saving pathology attachments:", error);
  }
};

// Função para verificar se há anexos para uma patologia específica, 
// com verificação para evitar chamadas desnecessárias
export const hasFirestoreAttachments = async (pathology: string): Promise<boolean> => {
  // Verificação mais rigorosa para evitar chamadas desnecessárias
  if (!pathology || pathology === "undefined" || pathology === "") {
    console.log("[hasFirestoreAttachments] Patologia inválida ou indefinida, pulando verificação no Firestore");
    return false;
  }

  const key = `pathology-${pathology}-attachments`;
  
  // Verificar cache primeiro
  const cacheKey = `attachments-${pathology}`;
  if (isCacheValid(attachmentsCache[cacheKey])) {
    console.log(`[hasFirestoreAttachments] Usando cache para verificar anexos de "${pathology}"`);
    return attachmentsCache[cacheKey].value.length > 0;
  }
  
  try {
    const attachmentsJson = await getDataFromFirestore(key);
    if (attachmentsJson) {
      try {
        const attachments = JSON.parse(attachmentsJson);
        return Array.isArray(attachments) && attachments.length > 0;
      } catch (error) {
        console.error(`[hasFirestoreAttachments] Error parsing attachments JSON for pathology "${pathology}":`, error);
        return false;
      }
    }
    return false;
  } catch (error) {
    console.error(`[hasFirestoreAttachments] Error checking attachments for pathology "${pathology}":`, error);
    return false;
  }
};

// Função para invalidar o cache ao iniciar a aplicação
export const invalidateAllCaches = (): void => {
  // Limpar cache de systemPromptSettings
  systemPromptSettingsCache = null;
  
  // Limpar outros caches
  Object.keys(promptsCache).forEach(key => delete promptsCache[key]);
  Object.keys(attachmentsCache).forEach(key => delete attachmentsCache[key]);
  
  console.log("[invalidateAllCaches] Todos os caches foram limpos");
};

// Password management
export const getStoredPassword = async (): Promise<string> => {
  try {
    const password = await getDataFromFirestore('settings-password');
    return password || "admin123";
  } catch (error) {
    console.error("Error getting stored password:", error);
    return "admin123";
  }
};

export const setStoredPassword = async (password: string): Promise<void> => {
  try {
    await saveDataToFirestore('settings-password', password);
  } catch (error) {
    console.error("Error setting stored password:", error);
  }
};

export const validatePassword = async (input: string): Promise<boolean> => {
  const storedPassword = await getStoredPassword();
  return input === storedPassword;
};

// Elevenlabs API Key management
export const getElevenlabsApiKey = async (): Promise<string> => {
  try {
    const apiKey = await getDataFromFirestore('elevenlabs-api-key');
    return apiKey || "";
  } catch (error) {
    console.error("Error getting elevenlabs API key:", error);
    return "";
  }
};

export const setElevenlabsApiKey = async (key: string): Promise<void> => {
  try {
    await saveDataToFirestore('elevenlabs-api-key', key);
  } catch (error) {
    console.error("Error setting elevenlabs API key:", error);
  }
};

export const hasElevenlabsApiKey = async (): Promise<boolean> => {
  const key = await getElevenlabsApiKey();
  return !!key;
};
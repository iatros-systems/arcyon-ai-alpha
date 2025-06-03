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

// Pathology-specific system prompt management
export const getPathologySystemPrompt = async (pathology: string): Promise<string> => {
  try {
    // Verificação defensiva para evitar acessos ao Firestore com pathology indefinida
    if (!pathology || pathology === "undefined") {
      console.log("[getPathologySystemPrompt] Pathology is undefined or invalid, returning empty prompt");
      return "";
    }

    console.log(`[getPathologySystemPrompt] Fetching system prompt for pathology: "${pathology}"`);
    
    // Try to get from Firestore first
    try {
      const firestorePrompt = await getSystemPromptFromFirestore(pathology);
      if (firestorePrompt) {
        console.log(`[getPathologySystemPrompt] Successfully retrieved prompt from Firestore for pathology: "${pathology}"`);
        return firestorePrompt;
      }
    } catch (error) {
      console.error("[getPathologySystemPrompt] Error getting prompt from Firestore:", error);
    }
    
    console.log(`[getPathologySystemPrompt] No prompt found in Firestore, trying local file for pathology: "${pathology}"`);
    
    // If not in Firestore, try local file
    try {
      const localPrompt = await getSystemPromptFromLocalFile(pathology);
      if (localPrompt) {
        console.log(`[getPathologySystemPrompt] Successfully retrieved prompt from local file for pathology: "${pathology}"`);
        return localPrompt;
      }
    } catch (error) {
      console.error("[getPathologySystemPrompt] Error getting prompt from local file:", error);
    }
    
    console.log(`[getPathologySystemPrompt] No system prompt found for pathology "${pathology}" in Firestore or local file`);
    return "";
  } catch (error) {
    console.error("[getPathologySystemPrompt] Error getting pathology system prompt:", error);
    return "";
  }
};

// Synchronous version for backward compatibility
export const getPathologySystemPromptSync = (pathology: string): string => {
  // Verificação defensiva para evitar acessos síncronos indevidos
  if (!pathology || pathology === "undefined") {
    console.log("[getPathologySystemPromptSync] Pathology is undefined or invalid, returning empty prompt");
    return "";
  }
  
  try {
    // Implementação original (síncrona)
    return localStorage.getItem(`pathology-${pathology}-prompt`) || "";
  } catch (error) {
    console.error("[getPathologySystemPromptSync] Error:", error);
    return "";
  }
};

export const savePathologySystemPrompt = async (pathology: string, prompt: string): Promise<void> => {
  try {
    // Save to Firestore
    await saveSystemPromptToFirestore(pathology, prompt);
  } catch (error) {
    console.error("Error saving pathology system prompt:", error);
  }
};

// Synchronous version for backward compatibility
export const savePathologySystemPromptSync = (pathology: string, prompt: string): void => {
  // Schedule an async save to Firestore
  setTimeout(() => {
    savePathologySystemPrompt(pathology, prompt)
      .catch(error => console.error("Error in delayed save of pathology system prompt:", error));
  }, 0);
};

// Pathology-specific attachments management
export const getPathologyAttachments = async (pathology: string): Promise<FileAttachment[]> => {
  try {
    // Verificação defensiva para evitar acessos ao Firestore com pathology indefinida
    if (!pathology || pathology === "undefined") {
      console.log("[getPathologyAttachments] Pathology is undefined, returning empty array");
      return [];
    }
    
    const key = `pathology-${pathology}-attachments`;
    const stored = await getDataFromFirestore(key);
    if (!stored) return [];
    
    return JSON.parse(stored);
  } catch (error) {
    console.error("Error getting pathology attachments:", error);
    return [];
  }
};

export const savePathologyAttachments = async (pathology: string, attachments: FileAttachment[]): Promise<void> => {
  try {
    // Verificação defensiva para evitar acessos ao Firestore com pathology indefinida
    if (!pathology || pathology === "undefined") {
      console.log("[savePathologyAttachments] Pathology is undefined, skipping save operation");
      return;
    }
    
    const key = `pathology-${pathology}-attachments`;
    await saveDataToFirestore(key, JSON.stringify(attachments));
  } catch (error) {
    console.error("Error saving pathology attachments:", error);
  }
};

export const hasFirestoreAttachments = async (pathology: string): Promise<boolean> => {
  try {
    // Verificação defensiva para evitar acessos ao Firestore com pathology indefinida
    if (!pathology || pathology === "undefined") {
      console.log("[hasFirestoreAttachments] Pathology is undefined, returning false");
      return false;
    }
    
    const firestore = getFirestore();
    const key = `pathology-${pathology}-attachments`;
    const docRef = doc(firestore, "appData", key);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return false;
    const data = docSnap.data();
    try {
      const attachments = JSON.parse(data.value);
      return Array.isArray(attachments) && attachments.length > 0;
    } catch {
      return false;
    }
  } catch (error) {
    console.error("Error checking for Firestore attachments:", error);
    return false;
  }
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
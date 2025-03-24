
// Utility functions for managing application settings in localStorage

// API Key management
export const getStoredApiKey = (): string => {
  return localStorage.getItem("gemini-api-key") || "";
};

export const setStoredApiKey = (key: string): void => {
  localStorage.setItem("gemini-api-key", key);
};

export const hasStoredApiKey = (): boolean => {
  return !!getStoredApiKey();
};

// Model settings
export const getStoredModelSettings = () => {
  return {
    temperature: parseFloat(localStorage.getItem("gemini-temperature") || "0.3"),
    topP: parseFloat(localStorage.getItem("gemini-topP") || "0.85"),
    topK: parseInt(localStorage.getItem("gemini-topK") || "40"),
    maxTokens: parseInt(localStorage.getItem("gemini-maxTokens") || "4096"),
    advancedMode: localStorage.getItem("gemini-advancedMode") === "true"
  };
};

export const saveModelSettings = (settings: {
  temperature: number;
  topP: number;
  topK: number;
  maxTokens: number;
  advancedMode: boolean;
}): void => {
  localStorage.setItem("gemini-temperature", settings.temperature.toString());
  localStorage.setItem("gemini-topP", settings.topP.toString());
  localStorage.setItem("gemini-topK", settings.topK.toString());
  localStorage.setItem("gemini-maxTokens", settings.maxTokens.toString());
  localStorage.setItem("gemini-advancedMode", settings.advancedMode.toString());
};

// System prompt settings
export const getStoredSystemPromptSettings = () => {
  return {
    pathology: localStorage.getItem("system-prompt-pathology") || "",
    systemInstructions: localStorage.getItem("system-instructions") || ""
  };
};

export const saveSystemPromptSettings = (settings: {
  pathology: string;
  systemInstructions: string;
}): void => {
  localStorage.setItem("system-prompt-pathology", settings.pathology);
  localStorage.setItem("system-instructions", settings.systemInstructions);
};

// Password management
export const getStoredPassword = (): string => {
  return localStorage.getItem("settings-password") || "admin123";
};

export const setStoredPassword = (password: string): void => {
  localStorage.setItem("settings-password", password);
};

export const validatePassword = (input: string): boolean => {
  return input === getStoredPassword();
};

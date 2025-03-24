
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { setApiKey, getApiKey, hasApiKey } from "@/services/api";
import { 
  getStoredModelSettings, 
  saveModelSettings, 
  getStoredSystemPromptSettings, 
  saveSystemPromptSettings,
  getStoredPassword,
  setStoredPassword,
  validatePassword
} from "@/utils/settingsStorage";

export function useSettings() {
  const { toast } = useToast();
  const [apiKey, setApiKeyState] = useState("");
  const [temperature, setTemperature] = useState(0.3);
  const [topP, setTopP] = useState(0.85);
  const [topK, setTopK] = useState(40);
  const [maxTokens, setMaxTokens] = useState(4096);
  const [isSaving, setIsSaving] = useState(false);
  const [advancedMode, setAdvancedMode] = useState(false);
  const [pathology, setPathology] = useState("");
  const [systemInstructions, setSystemInstructions] = useState("");
  
  // Password management states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  useEffect(() => {
    // Load existing API key if available
    if (hasApiKey()) {
      setApiKeyState(getApiKey());
    }
    
    // Load model settings
    const modelSettings = getStoredModelSettings();
    setTemperature(modelSettings.temperature);
    setTopP(modelSettings.topP);
    setTopK(modelSettings.topK);
    setMaxTokens(modelSettings.maxTokens);
    setAdvancedMode(modelSettings.advancedMode);
    
    // Load system prompt settings
    const promptSettings = getStoredSystemPromptSettings();
    setPathology(promptSettings.pathology);
    setSystemInstructions(promptSettings.systemInstructions);
  }, []);
  
  const handleSave = () => {
    setIsSaving(true);
    try {
      // Save API key
      setApiKey(apiKey);
      
      // Save model settings
      saveModelSettings({
        temperature,
        topP,
        topK,
        maxTokens,
        advancedMode
      });
      
      // Save system prompt settings
      saveSystemPromptSettings({
        pathology,
        systemInstructions
      });
      
      toast({
        title: "Configurações salvas",
        description: "Suas configurações foram salvas com sucesso.",
      });
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast({
        title: "Erro ao salvar configurações",
        description: "Ocorreu um erro ao salvar suas configurações.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleReset = () => {
    setTemperature(0.3);
    setTopP(0.85);
    setTopK(40);
    setMaxTokens(4096);
    setAdvancedMode(false);
  };
  
  const handleChangePassword = () => {
    if (!validatePassword(currentPassword)) {
      toast({
        title: "Senha atual incorreta",
        description: "A senha atual informada não corresponde à senha armazenada.",
        variant: "destructive",
      });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Senhas não conferem",
        description: "A nova senha e a confirmação não são iguais.",
        variant: "destructive",
      });
      return;
    }
    
    if (newPassword.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A nova senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }
    
    setStoredPassword(newPassword);
    
    toast({
      title: "Senha alterada",
      description: "Sua senha de acesso às configurações foi alterada com sucesso.",
    });
    
    // Limpar campos
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return {
    // States
    apiKey,
    temperature,
    topP,
    topK,
    maxTokens,
    isSaving,
    advancedMode,
    pathology,
    systemInstructions,
    currentPassword,
    newPassword,
    confirmPassword,

    // Setters
    setApiKeyState,
    setTemperature,
    setTopP,
    setTopK,
    setMaxTokens,
    setAdvancedMode,
    setPathology,
    setSystemInstructions,
    setCurrentPassword,
    setNewPassword,
    setConfirmPassword,

    // Handlers
    handleSave,
    handleReset,
    handleChangePassword
  };
}

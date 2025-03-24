
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { hasApiKey, setApiKey, getApiKey } from "@/services/api";

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
    
    // Load other settings from localStorage
    const savedTemperature = localStorage.getItem("gemini-temperature");
    const savedTopP = localStorage.getItem("gemini-topP");
    const savedTopK = localStorage.getItem("gemini-topK");
    const savedMaxTokens = localStorage.getItem("gemini-maxTokens");
    const savedAdvancedMode = localStorage.getItem("gemini-advancedMode");
    const savedPathology = localStorage.getItem("system-prompt-pathology");
    const savedSystemInstructions = localStorage.getItem("system-instructions");
    
    if (savedTemperature) setTemperature(parseFloat(savedTemperature));
    if (savedTopP) setTopP(parseFloat(savedTopP));
    if (savedTopK) setTopK(parseInt(savedTopK));
    if (savedMaxTokens) setMaxTokens(parseInt(savedMaxTokens));
    if (savedAdvancedMode) setAdvancedMode(savedAdvancedMode === "true");
    if (savedPathology) setPathology(savedPathology);
    if (savedSystemInstructions) setSystemInstructions(savedSystemInstructions);
  }, []);
  
  const handleSave = () => {
    setIsSaving(true);
    try {
      // Save API key
      setApiKey(apiKey);
      
      // Save other settings to localStorage
      localStorage.setItem("gemini-temperature", temperature.toString());
      localStorage.setItem("gemini-topP", topP.toString());
      localStorage.setItem("gemini-topK", topK.toString());
      localStorage.setItem("gemini-maxTokens", maxTokens.toString());
      localStorage.setItem("gemini-advancedMode", advancedMode.toString());
      localStorage.setItem("system-prompt-pathology", pathology);
      localStorage.setItem("system-instructions", systemInstructions);
      
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
    const storedPassword = localStorage.getItem("settings-password") || "admin123";
    
    if (currentPassword !== storedPassword) {
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
    
    localStorage.setItem("settings-password", newPassword);
    
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

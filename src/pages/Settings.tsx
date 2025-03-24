
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Key, MessageSquare, FileText, ShieldCheck } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { hasApiKey, setApiKey, getApiKey } from "@/services/api";
import { useToast } from "@/components/ui/use-toast";
import ApiSettingsTab from "@/components/settings/ApiSettingsTab";
import ModelSettingsTab from "@/components/settings/ModelSettingsTab";
import PromptSettingsTab from "@/components/settings/PromptSettingsTab";
import SecuritySettingsTab from "@/components/settings/SecuritySettingsTab";

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [apiKey, setApiKeyState] = useState("");
  const [temperature, setTemperature] = useState(0.3);
  const [topP, setTopP] = useState(0.85);
  const [topK, setTopK] = useState(40);
  const [maxTokens, setMaxTokens] = useState(4096);
  const [isSaving, setIsSaving] = useState(false);
  const [advancedMode, setAdvancedMode] = useState(false);
  const [pathology, setPathology] = useState("");
  
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
    
    if (savedTemperature) setTemperature(parseFloat(savedTemperature));
    if (savedTopP) setTopP(parseFloat(savedTopP));
    if (savedTopK) setTopK(parseInt(savedTopK));
    if (savedMaxTokens) setMaxTokens(parseInt(savedMaxTokens));
    if (savedAdvancedMode) setAdvancedMode(savedAdvancedMode === "true");
    if (savedPathology) setPathology(savedPathology);
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
  
  return (
    <div className="container max-w-4xl py-8">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Configurações</h1>
      </div>
      
      <Tabs defaultValue="api" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="api">
            <Key className="mr-2 h-4 w-4" />
            API e Conexão
          </TabsTrigger>
          <TabsTrigger value="model">
            <MessageSquare className="mr-2 h-4 w-4" />
            Configurações do Modelo
          </TabsTrigger>
          <TabsTrigger value="prompt">
            <FileText className="mr-2 h-4 w-4" />
            Prompt do Sistema
          </TabsTrigger>
          <TabsTrigger value="security">
            <ShieldCheck className="mr-2 h-4 w-4" />
            Segurança
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="api">
          <ApiSettingsTab 
            apiKey={apiKey}
            setApiKeyState={setApiKeyState}
            handleSave={handleSave}
            isSaving={isSaving}
            navigate={navigate}
          />
        </TabsContent>
        
        <TabsContent value="model">
          <ModelSettingsTab
            temperature={temperature}
            setTemperature={setTemperature}
            topP={topP}
            setTopP={setTopP}
            topK={topK}
            setTopK={setTopK}
            maxTokens={maxTokens}
            setMaxTokens={setMaxTokens}
            advancedMode={advancedMode}
            setAdvancedMode={setAdvancedMode}
            handleSave={handleSave}
            handleReset={handleReset}
            isSaving={isSaving}
          />
        </TabsContent>
        
        <TabsContent value="prompt">
          <PromptSettingsTab
            pathology={pathology}
            setPathology={setPathology}
            handleSave={handleSave}
            isSaving={isSaving}
          />
        </TabsContent>
        
        <TabsContent value="security">
          <SecuritySettingsTab
            currentPassword={currentPassword}
            setCurrentPassword={setCurrentPassword}
            newPassword={newPassword}
            setNewPassword={setNewPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            handleChangePassword={handleChangePassword}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;

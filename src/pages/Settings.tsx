
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Key, MessageSquare, FileText, ShieldCheck } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ApiSettingsTab from "@/components/settings/ApiSettingsTab";
import ModelSettingsTab from "@/components/settings/ModelSettingsTab";
import PromptSettingsTab from "@/components/settings/PromptSettingsTab";
import SecuritySettingsTab from "@/components/settings/SecuritySettingsTab";
import { useSettings } from "@/hooks/useSettings";

const Settings = () => {
  const navigate = useNavigate();
  const {
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
  } = useSettings();
  
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
            systemInstructions={systemInstructions}
            setSystemInstructions={setSystemInstructions}
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

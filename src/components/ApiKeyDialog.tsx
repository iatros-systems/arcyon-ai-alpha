import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Settings, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { hasApiKey, setApiKey, getApiKey } from "@/services/api";
import { hasDeepSeekApiKey, setDeepSeekApiKey, getDeepSeekApiKey } from "@/services/deepseek";
import { hasElevenlabsApiKey, setElevenlabsApiKey, getElevenlabsApiKey } from "@/services/elevenlabs";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ApiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ApiKeyDialog = ({ open, onOpenChange }: ApiKeyDialogProps) => {
  const navigate = useNavigate();
  const [apiKey, setApiKeyState] = useState("");
  const [deepseekApiKey, setDeepseekApiKeyState] = useState("");
  const [elevenlabsApiKey, setElevenlabsApiKeyState] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showSettingsAuth, setShowSettingsAuth] = useState(false);
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState("gemini");
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showDeepseekKey, setShowDeepseekKey] = useState(false);
  const [showElevenlabsKey, setShowElevenlabsKey] = useState(false);

  useEffect(() => {
    // Load existing API keys if available
    if (open) {
      const existingKey = getApiKey();
      if (existingKey) {
        setApiKeyState(existingKey);
      }
      
      const existingDeepseekKey = getDeepSeekApiKey();
      if (existingDeepseekKey) {
        setDeepseekApiKeyState(existingDeepseekKey);
      }
      
      const existingElevenlabsKey = getElevenlabsApiKey();
      if (existingElevenlabsKey) {
        setElevenlabsApiKeyState(existingElevenlabsKey);
      }
      
      // Reset other states
      setShowSettingsAuth(false);
      setPassword("");
    }
  }, [open]);

  const handleSave = () => {
    if (activeTab === "gemini" && !apiKey.trim()) {
      toast.error("Por favor, insira uma chave de API válida para o Gemini");
      return;
    }
    
    if (activeTab === "deepseek" && !deepseekApiKey.trim()) {
      toast.error("Por favor, insira uma chave de API válida para o DeepSeek");
      return;
    }
    
    if (activeTab === "elevenlabs" && !elevenlabsApiKey.trim()) {
      toast.error("Por favor, insira uma chave de API válida para o Elevenlabs");
      return;
    }
    
    setIsSaving(true);
    try {
      if (activeTab === "gemini") {
        setApiKey(apiKey);
        toast.success("API key do Gemini salva com sucesso");
      } else if (activeTab === "deepseek") {
        setDeepSeekApiKey(deepseekApiKey);
        toast.success("API key do DeepSeek salva com sucesso");
      } else if (activeTab === "elevenlabs") {
        setElevenlabsApiKey(elevenlabsApiKey);
        toast.success("API key do Elevenlabs salva com sucesso");
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save API key:", error);
      toast.error("Erro ao salvar API key");
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleOpenSettings = () => {
    setShowSettingsAuth(true);
  };
  
  const handleAuthenticateSettings = () => {
    const storedPassword = localStorage.getItem("settings-password") || "admin123";
    
    if (password === storedPassword) {
      onOpenChange(false);
      navigate("/settings");
    } else {
      toast.error("Senha incorreta");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95%] max-w-lg mx-auto">
        {!showSettingsAuth ? (
          <>
            <DialogHeader>
              <DialogTitle>Configurar API</DialogTitle>
              <DialogDescription className="break-words">
                Insira sua chave de API para utilizar o assistente.
              </DialogDescription>
            </DialogHeader>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="gemini">Gemini</TabsTrigger>
                <TabsTrigger value="deepseek">DeepSeek R1</TabsTrigger>
                <TabsTrigger value="elevenlabs">Elevenlabs</TabsTrigger>
              </TabsList>
              
              <TabsContent value="gemini">
                <div className="flex flex-col gap-4 py-2">
                  <div className="grid gap-2">
                    <Label htmlFor="api-key">Chave da API Gemini</Label>
                    <div className="relative">
                      <Input
                        id="api-key"
                        type={showGeminiKey ? "text" : "password"}
                        value={apiKey}
                        onChange={(e) => setApiKeyState(e.target.value)}
                        placeholder="sua-chave-de-api-gemini"
                        className="w-full pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowGeminiKey(!showGeminiKey)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                      >
                        {showGeminiKey ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="deepseek">
                <div className="flex flex-col gap-4 py-2">
                  <div className="grid gap-2">
                    <Label htmlFor="deepseek-api-key">Chave da API DeepSeek</Label>
                    <div className="relative">
                      <Input
                        id="deepseek-api-key"
                        type={showDeepseekKey ? "text" : "password"}
                        value={deepseekApiKey}
                        onChange={(e) => setDeepseekApiKeyState(e.target.value)}
                        placeholder="sua-chave-de-api-deepseek"
                        className="w-full pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowDeepseekKey(!showDeepseekKey)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                      >
                        {showDeepseekKey ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      O DeepSeek R1 com DeepThin expõe o processo de pensamento interno do modelo na resposta da API.
                    </p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="elevenlabs">
                <div className="flex flex-col gap-4 py-2">
                  <div className="grid gap-2">
                    <Label htmlFor="elevenlabs-api-key">Chave da API Elevenlabs</Label>
                    <div className="relative">
                      <Input
                        id="elevenlabs-api-key"
                        type={showElevenlabsKey ? "text" : "password"}
                        value={elevenlabsApiKey}
                        onChange={(e) => setElevenlabsApiKeyState(e.target.value)}
                        placeholder="sua-chave-de-api-elevenlabs"
                        className="w-full pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowElevenlabsKey(!showElevenlabsKey)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                      >
                        {showElevenlabsKey ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      O Elevenlabs permite converter texto em fala natural e utilizar o widget de conversação por áudio.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSaving}
                className="sm:order-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={(activeTab === "gemini" && !apiKey) || 
                         (activeTab === "deepseek" && !deepseekApiKey) || 
                         (activeTab === "elevenlabs" && !elevenlabsApiKey) || 
                         isSaving}
                className="sm:order-2"
              >
                {isSaving ? "Salvando..." : "Salvar"}
              </Button>
              <Button
                variant="secondary"
                onClick={handleOpenSettings}
                className="w-full sm:w-auto sm:order-3"
              >
                <Settings className="mr-2 h-4 w-4" />
                Configurações Avançadas
              </Button>
            </DialogFooter>
            <div className="text-xs text-muted-foreground mt-2">
              Sua chave é armazenada apenas em seu dispositivo e nunca é enviada para nossos servidores.
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Área Protegida</DialogTitle>
              <DialogDescription>
                Digite a senha para acessar as configurações avançadas
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="settings-password">Senha</Label>
                <Input
                  id="settings-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite a senha"
                  className="w-full"
                  autoFocus
                />
                <p className="text-xs text-muted-foreground">
                  A senha padrão é "admin123". Você pode alterá-la nas configurações.
                </p>
              </div>
            </div>
            <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-2">
              <Button
                variant="outline"
                onClick={() => setShowSettingsAuth(false)}
                className="sm:order-1"
              >
                Voltar
              </Button>
              <Button
                onClick={handleAuthenticateSettings}
                disabled={!password}
                className="sm:order-2"
              >
                <ShieldCheck className="mr-2 h-4 w-4" />
                Verificar Senha
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ApiKeyDialog;
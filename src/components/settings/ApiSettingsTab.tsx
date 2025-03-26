import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NavigateFunction } from "react-router-dom";
import { useSettingsContext } from "@/contexts/SettingsContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Settings, LightbulbIcon, Paperclip, X, FileText, Upload } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { getDeepSeekApiKey, setDeepSeekApiKey, hasDeepSeekApiKey } from "@/services/deepseek";
import { toast } from "sonner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { hasApiKey } from "@/services/api";
import { ApiProvider } from "@/hooks/useSettings";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { FileAttachment } from "@/services/api";

interface ApiSettingsTabProps {
  navigate: NavigateFunction;
}

const ApiSettingsTab = ({ navigate }: ApiSettingsTabProps) => {
  const { 
    apiKey, 
    setApiKeyState, 
    handleSave, 
    isSaving, 
    preferredApiProvider, 
    setPreferredApiProvider,
    showModelThinking,
    setShowModelThinking
  } = useSettingsContext();
  
  const [activeTab, setActiveTab] = useState("gemini");
  const [deepseekApiKey, setDeepseekApiKey] = useState("");
  const [isSavingDeepseek, setIsSavingDeepseek] = useState(false);
  const [hasGeminiKey, setHasGeminiKey] = useState(false);
  const [hasDeepseekKey, setHasDeepseekKey] = useState(false);
  
  // Referência para o input de arquivo
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Estado para os anexos
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  
  useEffect(() => {
    // Carregar a chave da API DeepSeek se disponível
    const storedKey = getDeepSeekApiKey();
    if (storedKey) {
      setDeepseekApiKey(storedKey);
      setHasDeepseekKey(true);
    }
    
    // Verificar se há chave da API Gemini
    setHasGeminiKey(hasApiKey());
    
    // Carregar anexos do localStorage
    const storedAttachments = localStorage.getItem("system-prompt-attachments");
    if (storedAttachments) {
      try {
        setAttachments(JSON.parse(storedAttachments));
      } catch (error) {
        console.error("Erro ao carregar anexos:", error);
      }
    }
  }, []);

  const handleSaveDeepseek = () => {
    if (!deepseekApiKey.trim()) {
      toast.error("Por favor, insira uma chave de API válida para o DeepSeek");
      return;
    }
    
    setIsSavingDeepseek(true);
    try {
      setDeepSeekApiKey(deepseekApiKey);
      setHasDeepseekKey(true);
      toast.success("API key do DeepSeek salva com sucesso");
    } catch (error) {
      console.error("Erro ao salvar a chave da API DeepSeek:", error);
      toast.error("Erro ao salvar a chave da API DeepSeek");
    } finally {
      setIsSavingDeepseek(false);
    }
  };

  const handleApiProviderChange = (value: string) => {
    setPreferredApiProvider(value as ApiProvider);
  };

  const handleSaveAll = () => {
    // Salvar anexos no localStorage
    localStorage.setItem("system-prompt-attachments", JSON.stringify(attachments));
    
    // Salvar outras configurações
    handleSave();
    toast.success("Configurações salvas com sucesso");
  };

  // Verifica se as APIs estão disponíveis para seleção
  const isApiSelectable = (api: string): boolean => {
    if (api === "gemini") return hasGeminiKey;
    if (api === "deepseek") return hasDeepseekKey;
    return false;
  };
  
  // Função para lidar com upload de arquivos
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    // Verificar o tamanho total dos anexos (limite de 20MB)
    const totalSize = Array.from(files).reduce((acc, file) => acc + file.size, 0);
    const currentSize = attachments.reduce((acc, attachment) => acc + attachment.size, 0);
    
    if (totalSize + currentSize > 20 * 1024 * 1024) {
      toast.error("O tamanho total dos anexos não pode exceder 20MB");
      return;
    }
    
    // Processar cada arquivo
    Array.from(files).forEach(file => {
      // Verificar tipos de arquivo permitidos
      const allowedTypes = [
        'application/pdf', 
        'text/plain', 
        'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv',
        'image/png',
        'image/jpeg'
      ];
      
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const allowedExtensions = ['pdf', 'txt', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'png', 'jpg', 'jpeg'];
      
      if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension || '')) {
        toast.error(`Tipo de arquivo não suportado: ${file.name}`);
        return;
      }
      
      // Converter para base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        // Remover o prefixo "data:*/*;base64," para economizar espaço
        const base64Data = base64.split(',')[1];
        
        // Adicionar ao estado
        setAttachments(prev => [
          ...prev, 
          {
            name: file.name,
            type: file.type || `application/${fileExtension}`,
            size: file.size,
            base64: base64Data
          }
        ]);
      };
      reader.readAsDataURL(file);
    });
    
    // Limpar o input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  // Função para remover um anexo
  const handleRemoveAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };
  
  // Função para formatar o tamanho do arquivo
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuração das APIs</CardTitle>
        <CardDescription>
          Configure suas chaves de API para utilizar o assistente.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="gemini">Gemini</TabsTrigger>
            <TabsTrigger value="deepseek">DeepSeek R1</TabsTrigger>
          </TabsList>
          
          <TabsContent value="gemini">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="api-key">Chave da API Gemini</Label>
                <Input
                  id="api-key"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKeyState(e.target.value)}
                  placeholder="AIzaSyA..."
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Obtenha sua chave em{" "}
                  <a
                    href="https://ai.google.dev/tutorials/setup"
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary underline"
                  >
                    ai.google.dev
                  </a>
                </p>
              </div>
              
              <Separator className="my-4" />
              
              <div className="grid gap-2">
                <Label htmlFor="api-provider">API do Chat</Label>
                <Select 
                  value={preferredApiProvider} 
                  onValueChange={handleApiProviderChange}
                  disabled={!hasGeminiKey && !hasDeepseekKey}
                >
                  <SelectTrigger id="api-provider" className="w-full">
                    <SelectValue placeholder="Selecione a API padrão" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem 
                      value="gemini" 
                      disabled={!hasGeminiKey}
                    >
                      Google Gemini
                    </SelectItem>
                    <SelectItem 
                      value="deepseek" 
                      disabled={!hasDeepseekKey}
                    >
                      DeepSeek R1
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Selecione qual API será utilizada por padrão ao enviar mensagens no chat.
                  {!hasGeminiKey && !hasDeepseekKey && (
                    <span className="text-red-500 block mt-1">
                      Configure pelo menos uma chave de API para selecionar a API padrão.
                    </span>
                  )}
                </p>
              </div>
              
              <Separator className="my-4" />
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="show-thinking" 
                  checked={showModelThinking}
                  onCheckedChange={(checked) => setShowModelThinking(checked as boolean)}
                  disabled={!hasDeepseekKey}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label
                    htmlFor="show-thinking"
                    className={!hasDeepseekKey ? "text-muted-foreground cursor-not-allowed" : ""}
                  >
                    Mostrar o pensamento do modelo no chat
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Exibe o processo de raciocínio interno do modelo DeepSeek R1 nas respostas.
                    {!hasDeepseekKey && (
                      <span className="text-amber-500 block mt-1">
                        Disponível apenas quando o DeepSeek R1 está configurado.
                      </span>
                    )}
                  </p>
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-xs text-muted-foreground">
                  Sua chave é armazenada apenas em seu dispositivo e nunca é enviada para nossos servidores.
                </p>
              </div>
              <div className="flex justify-between mt-4">
                <Button variant="outline" onClick={() => navigate("/chat")}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSaveAll} 
                  disabled={!apiKey || isSaving}
                >
                  {isSaving ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="deepseek">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="deepseek-api-key">Chave da API DeepSeek</Label>
                <Input
                  id="deepseek-api-key"
                  type="password"
                  value={deepseekApiKey}
                  onChange={(e) => setDeepseekApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full"
                />
                <div className="flex items-start gap-2 mt-2">
                  <Brain className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    O DeepSeek R1 com DeepThin expõe o processo de pensamento interno do modelo na resposta da API,
                    permitindo visualizar o raciocínio por trás das respostas. Obtenha sua chave em{" "}
                    <a
                      href="https://platform.deepseek.com/"
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary underline"
                    >
                      platform.deepseek.com
                    </a>
                  </p>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="grid gap-2">
                <Label htmlFor="api-provider-deepseek">API do Chat</Label>
                <Select 
                  value={preferredApiProvider} 
                  onValueChange={handleApiProviderChange}
                  disabled={!hasGeminiKey && !hasDeepseekKey}
                >
                  <SelectTrigger id="api-provider-deepseek" className="w-full">
                    <SelectValue placeholder="Selecione a API padrão" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem 
                      value="gemini" 
                      disabled={!hasGeminiKey}
                    >
                      Google Gemini
                    </SelectItem>
                    <SelectItem 
                      value="deepseek" 
                      disabled={!hasDeepseekKey}
                    >
                      DeepSeek R1
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Selecione qual API será utilizada por padrão ao enviar mensagens no chat.
                  {!hasGeminiKey && !hasDeepseekKey && (
                    <span className="text-red-500 block mt-1">
                      Configure pelo menos uma chave de API para selecionar a API padrão.
                    </span>
                  )}
                </p>
              </div>
              
              <Separator className="my-4" />
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="show-thinking-deepseek" 
                  checked={showModelThinking}
                  onCheckedChange={(checked) => setShowModelThinking(checked as boolean)}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label
                    htmlFor="show-thinking-deepseek"
                  >
                    Mostrar o pensamento do modelo no chat
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Exibe o processo de raciocínio interno do modelo DeepSeek R1 nas respostas.
                  </p>
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-xs text-muted-foreground">
                  Sua chave é armazenada apenas em seu dispositivo e nunca é enviada para nossos servidores.
                </p>
              </div>
              <div className="flex justify-between mt-4">
                <Button variant="outline" onClick={() => navigate("/chat")}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSaveDeepseek} 
                  disabled={!deepseekApiKey || isSavingDeepseek}
                >
                  {isSavingDeepseek ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ApiSettingsTab;

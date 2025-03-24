import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Key, Thermometer, Zap, Settings as SettingsIcon, MessageSquare, Save, RefreshCw, ShieldCheck, FileText } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { hasApiKey, setApiKey, getApiKey } from "@/services/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  
  // Novos estados para gerenciamento de senha
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Novo estado para o prompt do sistema
  const [pathology, setPathology] = useState("");
  
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
          <Card>
            <CardHeader>
              <CardTitle>Configuração da API Gemini</CardTitle>
              <CardDescription>
                Configure sua chave de API do Gemini para utilizar o assistente.
                Obtenha sua chave em{" "}
                <a
                  href="https://ai.google.dev/tutorials/setup"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline"
                >
                  ai.google.dev
                </a>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="api-key">Chave da API</Label>
                  <Input
                    id="api-key"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKeyState(e.target.value)}
                    placeholder="AIzaSyA..."
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Sua chave é armazenada apenas em seu dispositivo e nunca é enviada para nossos servidores.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => navigate("/chat")}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={!apiKey || isSaving}
              >
                {isSaving ? "Salvando..." : "Salvar"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="model">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Modelo</CardTitle>
              <CardDescription>
                Ajuste os parâmetros do modelo Gemini para personalizar as respostas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="advanced-mode" className="cursor-pointer">Modo Avançado</Label>
                    <span className="text-xs text-muted-foreground">
                      Habilita opções avançadas de configuração
                    </span>
                  </div>
                  <Switch 
                    id="advanced-mode" 
                    checked={advancedMode}
                    onCheckedChange={setAdvancedMode}
                  />
                </div>
                
                <Separator />
                
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="temperature">
                        <div className="flex items-center gap-2">
                          <Thermometer className="h-4 w-4" />
                          <span>Temperatura</span>
                        </div>
                      </Label>
                      <span className="text-sm font-medium">{temperature}</span>
                    </div>
                    <Slider
                      id="temperature"
                      min={0}
                      max={1}
                      step={0.1}
                      value={[temperature]}
                      onValueChange={(values) => setTemperature(values[0])}
                    />
                    <p className="text-xs text-muted-foreground">
                      Valores mais baixos geram respostas mais consistentes e determinísticas.
                      Valores mais altos geram respostas mais diversas e criativas.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="max-tokens">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4" />
                          <span>Tokens Máximos</span>
                        </div>
                      </Label>
                      <span className="text-sm font-medium">{maxTokens}</span>
                    </div>
                    <Slider
                      id="max-tokens"
                      min={1024}
                      max={8192}
                      step={512}
                      value={[maxTokens]}
                      onValueChange={(values) => setMaxTokens(values[0])}
                    />
                    <p className="text-xs text-muted-foreground">
                      Limite máximo de tokens (palavras) que o modelo pode gerar em uma resposta.
                    </p>
                  </div>
                  
                  {advancedMode && (
                    <>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="top-p">Top P</Label>
                          <span className="text-sm font-medium">{topP}</span>
                        </div>
                        <Slider
                          id="top-p"
                          min={0.1}
                          max={1}
                          step={0.05}
                          value={[topP]}
                          onValueChange={(values) => setTopP(values[0])}
                        />
                        <p className="text-xs text-muted-foreground">
                          Controla a diversidade da resposta (nucleação de probabilidade).
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="top-k">Top K</Label>
                          <span className="text-sm font-medium">{topK}</span>
                        </div>
                        <Slider
                          id="top-k"
                          min={1}
                          max={100}
                          step={1}
                          value={[topK]}
                          onValueChange={(values) => setTopK(values[0])}
                        />
                        <p className="text-xs text-muted-foreground">
                          Limita a seleção de palavras às K mais prováveis.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleReset}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Redefinir
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? "Salvar Configurações"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="prompt">
          <Card>
            <CardHeader>
              <CardTitle>Prompt do Sistema</CardTitle>
              <CardDescription>
                Configure o prompt do sistema para cada tipo de patologia.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="pathology">Patologia</Label>
                  <Select
                    value={pathology}
                    onValueChange={setPathology}
                  >
                    <SelectTrigger id="pathology">
                      <SelectValue placeholder="Selecione uma patologia" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="iamWithST">Angina/Síndrome coronariana(IAM) com supra</SelectItem>
                      <SelectItem value="iamWithoutST">Angina/Síndrome coronariana(IAM) sem supra</SelectItem>
                      <SelectItem value="aorticSyndrome">Síndrome aórtica</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    A patologia selecionada define o contexto do assistente para fornecer respostas mais precisas.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? "Salvar Configuração"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Segurança</CardTitle>
              <CardDescription>
                Altere a senha de acesso às configurações e defina preferências de segurança.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Alterar Senha</h3>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="current-password">Senha Atual</Label>
                      <Input
                        id="current-password"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Digite a senha atual"
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="new-password">Nova Senha</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Digite a nova senha"
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirme a nova senha"
                      />
                    </div>
                    
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">
                        A senha padrão é "admin123". Recomendamos que você altere para uma senha mais segura.
                      </p>
                      <p className="text-xs text-muted-foreground">
                        A senha deve ter pelo menos 6 caracteres e é usada para proteger o acesso às configurações do sistema.
                      </p>
                    </div>
                    
                    <Button 
                      onClick={handleChangePassword}
                      disabled={!currentPassword || !newPassword || !confirmPassword}
                      className="w-full"
                    >
                      Alterar Senha
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Informações de Segurança</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    As configurações do sistema são protegidas por senha para evitar acesso não autorizado. 
                    A autenticação expira após 30 minutos de inatividade.
                  </p>
                  <div className="p-4 bg-muted rounded-md">
                    <p className="text-sm">
                      <strong>Dica de segurança:</strong> Nunca compartilhe sua senha ou API key com terceiros. 
                      Todas as configurações são armazenadas localmente em seu dispositivo.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;

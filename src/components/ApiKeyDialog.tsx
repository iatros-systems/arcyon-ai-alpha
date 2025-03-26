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
import { Settings, ShieldCheck } from "lucide-react";
import { hasApiKey, setApiKey, getApiKey } from "@/services/api";
import { toast } from "sonner";

interface ApiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ApiKeyDialog = ({ open, onOpenChange }: ApiKeyDialogProps) => {
  const navigate = useNavigate();
  const [apiKey, setApiKeyState] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showSettingsAuth, setShowSettingsAuth] = useState(false);
  const [password, setPassword] = useState("");

  useEffect(() => {
    // Load existing API key if available
    if (open) {
      const existingKey = getApiKey();
      if (existingKey) {
        setApiKeyState(existingKey);
      }
      
      // Reset other states
      setShowSettingsAuth(false);
      setPassword("");
    }
  }, [open]);

  const handleSave = () => {
    if (!apiKey.trim()) {
      toast.error("Por favor, insira uma chave de API válida");
      return;
    }
    
    setIsSaving(true);
    try {
      setApiKey(apiKey);
      onOpenChange(false);
      toast.success("API key salva com sucesso");
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
      <DialogContent className="w-[95%] max-w-md mx-auto">
        {!showSettingsAuth ? (
          <>
            <DialogHeader>
              <DialogTitle>Configurar API</DialogTitle>
              <DialogDescription className="break-words">
                Insira sua chave de API para utilizar o assistente.
                Obtenha sua chave em{" "}
                <a
                  href="https://ai.google.dev/tutorials/setup"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline"
                >
                  ai.google.dev
                </a>
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="api-key">Chave da API</Label>
                <Input
                  id="api-key"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKeyState(e.target.value)}
                  placeholder="sua-chave-de-api"
                  className="w-full"
                />
              </div>
            </div>
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
                disabled={!apiKey || isSaving}
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

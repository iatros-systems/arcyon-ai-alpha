
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { hasApiKey, setApiKey, getApiKey } from "@/services/api";

interface ApiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ApiKeyDialog = ({ open, onOpenChange }: ApiKeyDialogProps) => {
  const [apiKey, setApiKeyState] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Load existing API key if available
    if (hasApiKey()) {
      setApiKeyState(getApiKey());
    }
  }, [open]);

  const handleSave = () => {
    setIsSaving(true);
    try {
      setApiKey(apiKey);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save API key:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configurar API da Gemini</DialogTitle>
          <DialogDescription>
            Insira sua chave de API do Gemini para utilizar o assistente.
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
        <div className="flex flex-col gap-4 py-4">
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
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={!apiKey || isSaving}
            >
              {isSaving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
          <div className="text-xs text-muted-foreground">
            Sua chave é armazenada apenas em seu dispositivo e nunca é enviada para nossos servidores.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApiKeyDialog;

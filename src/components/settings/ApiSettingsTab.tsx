
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NavigateFunction } from "react-router-dom";
import { useSettingsContext } from "@/contexts/SettingsContext";

interface ApiSettingsTabProps {
  navigate: NavigateFunction;
}

const ApiSettingsTab = ({ navigate }: ApiSettingsTabProps) => {
  const { apiKey, setApiKeyState, handleSave, isSaving } = useSettingsContext();

  return (
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
  );
};

export default ApiSettingsTab;

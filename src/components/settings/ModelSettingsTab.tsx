
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Thermometer, Zap, RefreshCw, Save } from "lucide-react";

interface ModelSettingsTabProps {
  temperature: number;
  setTemperature: (value: number) => void;
  topP: number;
  setTopP: (value: number) => void;
  topK: number;
  setTopK: (value: number) => void;
  maxTokens: number;
  setMaxTokens: (value: number) => void;
  advancedMode: boolean;
  setAdvancedMode: (value: boolean) => void;
  handleSave: () => void;
  handleReset: () => void;
  isSaving: boolean;
}

const ModelSettingsTab = ({
  temperature,
  setTemperature,
  topP,
  setTopP,
  topK,
  setTopK,
  maxTokens,
  setMaxTokens,
  advancedMode,
  setAdvancedMode,
  handleSave,
  handleReset,
  isSaving
}: ModelSettingsTabProps) => {
  return (
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
          {isSaving ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ModelSettingsTab;

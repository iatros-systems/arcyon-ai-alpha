
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save } from "lucide-react";

interface PromptSettingsTabProps {
  pathology: string;
  setPathology: (value: string) => void;
  handleSave: () => void;
  isSaving: boolean;
}

const PromptSettingsTab = ({
  pathology,
  setPathology,
  handleSave,
  isSaving
}: PromptSettingsTabProps) => {
  return (
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
          {isSaving ? "Salvando..." : "Salvar Configuração"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PromptSettingsTab;

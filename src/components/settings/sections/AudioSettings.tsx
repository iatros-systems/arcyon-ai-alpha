
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

const AudioSettings = () => {
  const [mainLanguage, setMainLanguage] = useState("auto");

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Voz</h2>
      
      <Card className="overflow-hidden">
        <CardHeader className="p-4">
          <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-start sm:space-y-0">
            <div className="space-y-1 max-w-[80%]">
              <CardTitle className="text-base font-medium">Reproduzir</CardTitle>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              className="whitespace-nowrap"
            >
              Cove
            </Button>
          </div>
        </CardHeader>
      </Card>
      
      <Card className="overflow-hidden">
        <CardHeader className="p-4">
          <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-start sm:space-y-0">
            <div className="space-y-1 max-w-[80%]">
              <CardTitle className="text-base font-medium">Idioma principal</CardTitle>
              <CardDescription className="text-xs">
                Para obter melhores resultados, selecione o idioma principal. Se não
                estiver incluído, poderá estar disponível através da detecção
                automática.
              </CardDescription>
            </div>
            <Select 
              value={mainLanguage} 
              onValueChange={setMainLanguage}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Selecione um idioma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Automático</SelectItem>
                <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                <SelectItem value="en-US">Inglês (EUA)</SelectItem>
                <SelectItem value="es">Espanhol</SelectItem>
                <SelectItem value="fr">Francês</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
};

export default AudioSettings;

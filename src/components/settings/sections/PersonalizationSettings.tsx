
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ChevronRight } from "lucide-react";

const PersonalizationSettings = () => {
  const [memoryEnabled, setMemoryEnabled] = useState(false);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Personalização</h2>
      
      <Card className="overflow-hidden">
        <CardHeader className="p-4">
          <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-start sm:space-y-0">
            <div className="space-y-1 max-w-[80%]">
              <CardTitle className="text-base font-medium">Instruções personalizadas</CardTitle>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              className="whitespace-nowrap"
            >
              Ativado <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
      </Card>
      
      <Card className="overflow-hidden">
        <CardHeader className="p-4">
          <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-start sm:space-y-0">
            <div className="space-y-1 max-w-[80%]">
              <CardTitle className="text-base font-medium">Memória</CardTitle>
              <CardDescription className="text-xs">
                Arcyon será mais útil à medida que conversa, processando 
                informação e preferências para personalizar as respostas. <a href="#" className="text-xs text-blue-600 hover:underline">Obter 
                mais informação</a>
              </CardDescription>
            </div>
            <Switch 
              checked={memoryEnabled}
              onCheckedChange={setMemoryEnabled}
              className="self-start mt-1"
            />
          </div>
        </CardHeader>
        
        <CardContent className="px-4 pb-4 pt-0">
          <p className="text-sm text-muted-foreground mb-2">
            Para compreender quê coisas recorda Arcyon o para ensiná-le algo 
            novo, solo converse:
          </p>
          <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
            <li>"Recorda que necessita respostas concisas."</li>
            <li>"Tenho um cachorro novo!"</li>
            <li>"O que recorda sobre mim?"</li>
            <li>"Até onde chegamos no último projeto?"</li>
          </ul>
          
          <Button 
            variant="outline" 
            size="sm"
            className="mt-4"
          >
            Administrar memórias
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonalizationSettings;

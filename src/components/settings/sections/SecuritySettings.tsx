
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

const SecuritySettings = () => {
  const [mfaEnabled, setMfaEnabled] = useState(false);

  const handleToggleMfa = () => {
    setMfaEnabled(!mfaEnabled);
  };

  const handleCloseAllSessions = () => {
    // Implementação futura: lógica para encerrar todas as sessões
    console.log("Fechando todas as sessões");
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Configurações de Segurança</h2>
      
      <Card className="overflow-hidden">
        <CardHeader className="p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1 max-w-[80%]">
              <CardTitle className="text-base font-medium">Autenticação multifator</CardTitle>
              <CardDescription className="text-xs">
                Requer um desafio de segurança adicional ao iniciar sessão. 
                Se não puder passar este desafio, terá a opção de recuperar 
                sua conta por correio eletrônico.
              </CardDescription>
            </div>
            <Switch 
              checked={mfaEnabled}
              onCheckedChange={handleToggleMfa}
              aria-label="Ativar autenticação multifator"
            />
          </div>
        </CardHeader>
      </Card>
      
      <Card className="overflow-hidden">
        <CardHeader className="p-4">
          <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-start sm:space-y-0">
            <div className="space-y-1 max-w-[80%]">
              <CardTitle className="text-base font-medium">Fechar sessão em todos os dispositivos</CardTitle>
              <CardDescription className="text-xs">
                Encerra todas as sessões ativas em todos os dispositivos, 
                incluída a sessão atual. Em outros dispositivos, o encerramento 
                de sessão pode demorar até 30 minutos.
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              onClick={handleCloseAllSessions}
              size="sm"
              className="whitespace-nowrap"
            >
              Fechar todas as sessões
            </Button>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
};

export default SecuritySettings;

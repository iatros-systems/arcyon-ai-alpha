
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
    console.log("Encerrando todas as sessões");
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Configurações de Segurança</h2>
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Autenticação multifator</CardTitle>
              <CardDescription className="mt-1">
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
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Encerrar sessão em todos os dispositivos</CardTitle>
              <CardDescription className="mt-1">
                Encerra todas as sessões ativas em todos os dispositivos, 
                incluída a sessão atual. Em outros dispositivos, o encerramento 
                de sessão pode demorar até 30 minutos.
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              onClick={handleCloseAllSessions}
            >
              Encerrar todas as sessões
            </Button>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
};

export default SecuritySettings;


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSettingsContext } from "@/contexts/SettingsContext";

const SecuritySettingsTab = () => {
  const {
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    handleChangePassword
  } = useSettingsContext();

  return (
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
  );
};

export default SecuritySettingsTab;

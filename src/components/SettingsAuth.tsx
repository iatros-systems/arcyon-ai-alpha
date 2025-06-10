import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Key, Shield, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import PasswordRecovery from "./PasswordRecovery";
import { validatePassword } from "@/utils/settingsStorage";

interface SettingsAuthProps {
  onAuthenticate: () => void;
}

const SettingsAuth = ({ onAuthenticate }: SettingsAuthProps) => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  
  const handleAuthenticate = async () => {
    setIsAuthenticating(true);
    
    try {
      // Simular uma pequena latência para dar sensação de processamento
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Aguardar a resolução da Promise retornada por validatePassword
      const isValid = await validatePassword(password);
      
      if (isValid) {
        toast.success("Autenticação bem-sucedida");
        onAuthenticate(); // Chamar o callback somente se a senha for válida
      } else {
        toast.error("Senha incorreta");
      }
    } catch (error) {
      console.error("Erro na autenticação:", error);
      toast.error("Erro ao verificar senha. Tente novamente.");
    } finally {
      setIsAuthenticating(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAuthenticate();
    }
  };

  const handleRecoverySuccess = () => {
    setShowRecovery(false);
    toast.success("Senha redefinida com sucesso");
  };

  if (showRecovery) {
    return <PasswordRecovery onCancel={() => setShowRecovery(false)} onSuccess={handleRecoverySuccess} />;
  }

  return (
    <div className="container max-w-md py-8">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Autenticação Necessária</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span>Área Protegida</span>
          </CardTitle>
          <CardDescription>
            Digite a senha para acessar as configurações do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Digite a senha"
                className="w-full"
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                A senha padrão é "admin123". Você pode alterá-la nas configurações.
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(-1)}>
              Cancelar
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowRecovery(true)}
              className="flex items-center gap-1"
            >
              <RefreshCw className="h-4 w-4" />
              Recuperar Senha
            </Button>
          </div>
          <Button 
            onClick={handleAuthenticate} 
            disabled={!password || isAuthenticating}
          >
            {isAuthenticating ? "Verificando..." : "Acessar"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SettingsAuth;

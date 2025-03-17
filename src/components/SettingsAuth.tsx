
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Key, Shield } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface SettingsAuthProps {
  onAuthenticate: () => void;
}

const SettingsAuth = ({ onAuthenticate }: SettingsAuthProps) => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  
  const handleAuthenticate = () => {
    setIsAuthenticating(true);
    
    // Simular uma pequena latência para dar sensação de processamento
    setTimeout(() => {
      // Verificar senha (a senha padrão é "admin123")
      // Em uma implementação real, isso deveria usar hash e comparação segura
      const storedPassword = localStorage.getItem("settings-password") || "admin123";
      
      if (password === storedPassword) {
        toast.success("Autenticação bem-sucedida");
        onAuthenticate();
      } else {
        toast.error("Senha incorreta");
      }
      
      setIsAuthenticating(false);
    }, 500);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAuthenticate();
    }
  };

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
          <Button variant="outline" onClick={() => navigate(-1)}>
            Cancelar
          </Button>
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

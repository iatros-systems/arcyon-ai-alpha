
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Key, RefreshCw, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface PasswordRecoveryProps {
  onCancel: () => void;
  onSuccess: () => void;
}

// Perguntas de segurança predefinidas
const SECURITY_QUESTIONS = [
  { id: 1, question: "Qual o nome do seu primeiro animal de estimação?" },
  { id: 2, question: "Qual o nome da sua cidade natal?" },
  { id: 3, question: "Qual o nome da sua escola primária?" }
];

const PasswordRecovery = ({ onCancel, onSuccess }: PasswordRecoveryProps) => {
  const [step, setStep] = useState(1);
  const [securityQuestion, setSecurityQuestion] = useState<number | null>(null);
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  
  // Verificar se já existem perguntas de segurança configuradas
  const hasSecurityQuestion = () => {
    return localStorage.getItem("security-question-id") !== null;
  };

  // Configurar pergunta de segurança se não existir
  const handleSetupSecurity = () => {
    if (!securityQuestion) {
      toast.error("Selecione uma pergunta de segurança");
      return;
    }
    
    if (!securityAnswer.trim()) {
      toast.error("Digite uma resposta para a pergunta de segurança");
      return;
    }
    
    localStorage.setItem("security-question-id", securityQuestion.toString());
    localStorage.setItem("security-answer", securityAnswer.toLowerCase().trim());
    
    toast.success("Pergunta de segurança configurada com sucesso");
    setStep(2);
  };

  // Verificar resposta da pergunta de segurança
  const handleVerifyAnswer = () => {
    const storedAnswer = localStorage.getItem("security-answer");
    
    if (securityAnswer.toLowerCase().trim() === storedAnswer) {
      setStep(3);
    } else {
      toast.error("Resposta incorreta");
    }
  };

  // Redefinir a senha
  const handleResetPassword = () => {
    if (newPassword.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }
    
    localStorage.setItem("settings-password", newPassword);
    toast.success("Senha redefinida com sucesso");
    onSuccess();
  };

  // Redefinir para a senha padrão
  const handleResetToDefault = () => {
    localStorage.removeItem("settings-password");
    setShowResetConfirm(false);
    toast.success("Senha redefinida para o padrão: admin123");
    onSuccess();
  };

  return (
    <div className="container max-w-md py-8">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="outline" size="icon" onClick={onCancel}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Recuperação de Senha</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            <span>Recuperar Acesso</span>
          </CardTitle>
          <CardDescription>
            {step === 1 && !hasSecurityQuestion() && "Configure uma pergunta de segurança para recuperar sua senha"}
            {step === 1 && hasSecurityQuestion() && "Responda à pergunta de segurança para continuar"}
            {step === 2 && "Verifique sua resposta"}
            {step === 3 && "Crie uma nova senha"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Passo 1: Configuração inicial ou resposta à pergunta */}
          {step === 1 && !hasSecurityQuestion() && (
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="question">Pergunta de Segurança</Label>
                <select 
                  id="question"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                  value={securityQuestion || ""}
                  onChange={(e) => setSecurityQuestion(parseInt(e.target.value))}
                >
                  <option value="">Selecione uma pergunta</option>
                  {SECURITY_QUESTIONS.map(q => (
                    <option key={q.id} value={q.id}>{q.question}</option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="answer">Sua Resposta</Label>
                <Input
                  id="answer"
                  type="text"
                  value={securityAnswer}
                  onChange={(e) => setSecurityAnswer(e.target.value)}
                  placeholder="Digite sua resposta"
                />
              </div>
            </div>
          )}
          
          {/* Passo 1: Responder à pergunta existente */}
          {step === 1 && hasSecurityQuestion() && (
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="question">Pergunta de Segurança</Label>
                <div className="p-3 bg-muted rounded-md">
                  {SECURITY_QUESTIONS.find(q => q.id.toString() === localStorage.getItem("security-question-id"))?.question || "Pergunta não encontrada"}
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="answer">Sua Resposta</Label>
                <Input
                  id="answer"
                  type="text"
                  value={securityAnswer}
                  onChange={(e) => setSecurityAnswer(e.target.value)}
                  placeholder="Digite sua resposta"
                />
              </div>
            </div>
          )}
          
          {/* Passo 3: Redefinir senha */}
          {step === 3 && (
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="newPassword">Nova Senha</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Digite a nova senha"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirme a nova senha"
                />
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            {hasSecurityQuestion() && (
              <Button 
                variant="outline" 
                onClick={() => setShowResetConfirm(true)}
                className="flex items-center gap-1 text-destructive border-destructive hover:bg-destructive/10"
              >
                <AlertTriangle className="h-4 w-4" />
                Redefinir
              </Button>
            )}
          </div>
          <Button 
            onClick={step === 1 && !hasSecurityQuestion() 
              ? handleSetupSecurity 
              : step === 1 && hasSecurityQuestion() 
                ? handleVerifyAnswer 
                : handleResetPassword
            }
          >
            {step === 1 && !hasSecurityQuestion() && "Configurar"}
            {step === 1 && hasSecurityQuestion() && "Verificar"}
            {step === 3 && "Redefinir Senha"}
          </Button>
        </CardFooter>
      </Card>

      {/* Diálogo de confirmação para redefinir para a senha padrão */}
      <AlertDialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Redefinir para senha padrão?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação irá redefinir sua senha para o valor padrão "admin123".
              Tem certeza que deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleResetToDefault}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Redefinir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PasswordRecovery;

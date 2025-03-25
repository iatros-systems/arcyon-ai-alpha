
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { UploadCloud, Save, FileText, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState, useRef } from "react";
import { useSettings } from "@/hooks/useSettings";
import { useChatStore } from "@/store/chat-store";
import { CHEST_PAIN_SYSTEM_PROMPT } from "@/store/chat/constants";
import { updateChatSystemPrompt } from "@/utils/chatMessageUtils";
import { useToast } from "@/components/ui/use-toast";

const PromptSettingsTab = () => {
  const {
    pathology,
    setPathology,
    systemInstructions,
    setSystemInstructions,
    handleSave,
    isSaving
  } = useSettings();
  
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { chats, setChats } = useChatStore();
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Only accept markdown files
    if (file.type !== "text/markdown" && !file.name.endsWith(".md")) {
      toast({
        title: "Formato inválido",
        description: "Por favor, selecione apenas arquivos Markdown (.md)",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setSystemInstructions(content);
    };
    reader.readAsText(file);

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Custom save handler to also update all existing chats
  const handleSaveAndUpdateChats = () => {
    // First save settings as normal
    handleSave();
    
    // Determine which system prompt to use
    let systemPrompt = '';
    
    if (systemInstructions) {
      // If custom instructions are provided, use those
      systemPrompt = systemInstructions;
    } else if (pathology === 'iamWithST' || pathology === 'iamWithoutST' || pathology === 'aorticSyndrome') {
      // If a pathology is selected but no custom instructions, use the default chest pain prompt
      systemPrompt = CHEST_PAIN_SYSTEM_PROMPT;
    }
    
    if (systemPrompt && chats.length > 0) {
      // Update all chats with the new system prompt
      const updatedChats = chats.map(chat => updateChatSystemPrompt(chat, systemPrompt));
      setChats(updatedChats);
      
      toast({
        title: "Prompt atualizado",
        description: "O prompt do sistema foi atualizado em todas as conversas existentes.",
      });
    }
  };

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
          
          <div className="grid gap-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="system-instructions">Instruções do Sistema</Label>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={handleUploadClick} 
                  title="Fazer upload de arquivo Markdown"
                >
                  <UploadCloud className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => setIsPreviewOpen(true)} 
                  title="Visualizar Markdown"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept=".md,text/markdown" 
                  className="hidden" 
                />
              </div>
            </div>
            <Textarea 
              id="system-instructions" 
              value={systemInstructions} 
              onChange={(e) => setSystemInstructions(e.target.value)} 
              placeholder="Digite ou faça upload das instruções do sistema em formato Markdown..." 
              className="h-[300px] font-mono text-sm" 
            />
            <p className="text-xs text-muted-foreground mt-1">
              Estas instruções serão enviadas ao modelo como contexto para guiar suas respostas. 
              Você pode usar a formatação Markdown para organizar o conteúdo.
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={handleSaveAndUpdateChats} disabled={isSaving}>
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Salvando..." : "Salvar Configuração"}
        </Button>
      </CardFooter>
      
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Visualização das Instruções do Sistema
            </DialogTitle>
            <DialogDescription>
              Visualização da formatação Markdown das instruções do sistema
            </DialogDescription>
          </DialogHeader>
          <div className="border rounded-md p-4 bg-muted/50 prose prose-sm max-w-none dark:prose-invert">
            <pre className="whitespace-pre-wrap">{systemInstructions}</pre>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default PromptSettingsTab;

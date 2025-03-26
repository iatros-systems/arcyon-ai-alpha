import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { UploadCloud, Save, FileText, Eye, X, Paperclip, Upload } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState, useRef, useEffect } from "react";
import { useSettingsContext } from "@/contexts/SettingsContext";
import { useChatStore } from "@/store/chat-store";
import { CHEST_PAIN_SYSTEM_PROMPT } from "@/store/chat/constants";
import { updateChatSystemPrompt } from "@/utils/chatMessageUtils";
import { 
  getPathologySystemPrompt, 
  savePathologySystemPrompt, 
  getPathologyAttachments, 
  savePathologyAttachments,
  PathologySettings
} from "@/utils/settingsStorage";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { FileAttachment } from "@/services/api";

const PromptSettingsTab = () => {
  const {
    pathology,
    setPathology,
    systemInstructions,
    setSystemInstructions,
    handleSave,
    isSaving
  } = useSettingsContext();
  
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const { chats, setChats, currentChat } = useChatStore();
  
  // Estado para anexos da patologia atual
  const [pathologyAttachments, setPathologyAttachments] = useState<FileAttachment[]>([]);
  
  // Carregar prompt e anexos quando a patologia mudar
  useEffect(() => {
    if (pathology) {
      // Carregar o prompt específico da patologia
      const savedPrompt = getPathologySystemPrompt(pathology);
      if (savedPrompt) {
        setSystemInstructions(savedPrompt);
      }
      
      // Carregar os anexos específicos da patologia
      const savedAttachments = getPathologyAttachments(pathology);
      setPathologyAttachments(savedAttachments);
    }
  }, [pathology]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Only accept markdown files
    if (file.type !== "text/markdown" && !file.name.endsWith(".md")) {
      toast.error("Por favor, selecione apenas arquivos Markdown (.md)");
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
  
  // Função para lidar com upload de anexos
  const handleAttachmentUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    // Verificar se a patologia foi selecionada
    if (!pathology) {
      toast.error("Por favor, selecione uma patologia antes de anexar arquivos");
      return;
    }
    
    // Verificar o tamanho total dos anexos (limite de 20MB)
    const totalSize = Array.from(files).reduce((acc, file) => acc + file.size, 0);
    const currentSize = pathologyAttachments.reduce((acc, attachment) => acc + attachment.size, 0);
    
    if (totalSize + currentSize > 20 * 1024 * 1024) {
      toast.error("O tamanho total dos anexos não pode exceder 20MB");
      return;
    }
    
    // Processar cada arquivo
    Array.from(files).forEach(file => {
      // Verificar tipos de arquivo permitidos
      const allowedTypes = [
        'application/pdf', 
        'text/plain', 
        'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv',
        'image/png',
        'image/jpeg'
      ];
      
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const allowedExtensions = ['pdf', 'txt', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'png', 'jpg', 'jpeg'];
      
      if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension || '')) {
        toast.error(`Tipo de arquivo não suportado: ${file.name}`);
        return;
      }
      
      // Converter para base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        // Remover o prefixo "data:*/*;base64," para economizar espaço
        const base64Data = base64.split(',')[1];
        
        // Adicionar ao estado
        setPathologyAttachments(prev => [
          ...prev, 
          {
            name: file.name,
            type: file.type || `application/${fileExtension}`,
            size: file.size,
            base64: base64Data
          }
        ]);
      };
      reader.readAsDataURL(file);
    });
    
    // Limpar o input
    if (attachmentInputRef.current) {
      attachmentInputRef.current.value = "";
    }
  };
  
  // Função para remover um anexo
  const handleRemoveAttachment = (index: number) => {
    setPathologyAttachments(prev => prev.filter((_, i) => i !== index));
  };
  
  // Função para formatar o tamanho do arquivo
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Custom save handler to also update all existing chats
  const handleSaveAndUpdateChats = () => {
    if (!pathology) {
      toast.error("Por favor, selecione uma patologia antes de salvar");
      return;
    }
    
    // Salvar o prompt específico para a patologia
    savePathologySystemPrompt(pathology, systemInstructions);
    
    // Salvar os anexos específicos para a patologia
    savePathologyAttachments(pathology, pathologyAttachments);
    
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
    
    if (systemPrompt) {
      // Update all chats with the new system prompt
      const updatedChats = chats.map(chat => updateChatSystemPrompt(chat, systemPrompt));
      setChats(updatedChats);
    }
    
    toast.success("Configurações da patologia salvas com sucesso");
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
            <div className="flex justify-start items-center">
              <Label htmlFor="pathology">Patologia</Label>
            </div>
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
          
          {/* Seção de anexos específicos para a patologia */}
          <div className="grid gap-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="attachments">Arquivos para o System Prompt</Label>
              <Button 
                variant="outline" 
                onClick={() => attachmentInputRef.current?.click()}
                disabled={!pathology}
                className="text-xs flex items-center gap-1"
              >
                <Upload className="h-4 w-4" />
                Anexar Arquivos
              </Button>
              <input 
                type="file" 
                ref={attachmentInputRef} 
                onChange={handleAttachmentUpload} 
                accept=".pdf,.txt,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg" 
                className="hidden" 
                multiple
              />
            </div>
            
            {pathologyAttachments.length > 0 ? (
              <div className="border rounded-md">
                {pathologyAttachments.map((attachment, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 border-b last:border-b-0"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{attachment.name}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(attachment.size)}</p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleRemoveAttachment(index)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="p-3 bg-muted/30 border-t flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">{pathologyAttachments.length} {pathologyAttachments.length === 1 ? 'arquivo' : 'arquivos'}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatFileSize(pathologyAttachments.reduce((acc, file) => acc + file.size, 0))}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border border-dashed rounded-md p-8 flex flex-col items-center justify-center text-center">
                <Paperclip className="h-8 w-8 text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">
                  {!pathology 
                    ? "Selecione uma patologia para anexar arquivos" 
                    : "Nenhum arquivo anexado para esta patologia"}
                </p>
                {pathology && (
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={() => attachmentInputRef.current?.click()}
                    className="mt-4"
                  >
                    <Upload className="h-3 w-3 mr-1" />
                    Anexar Arquivos
                  </Button>
                )}
              </div>
            )}
            
            <p className="text-xs text-muted-foreground mt-1">
              Estes arquivos serão enviados ao modelo Gemini junto com o prompt do sistema.
              Formatos suportados: PDF, TXT, DOC, DOCX, XLS, XLSX, CSV, PNG, JPG.
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={handleSaveAndUpdateChats} disabled={isSaving || !pathology}>
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
            {/* 
              For simplicity, we're just displaying the raw markdown.
              In a real app, you would use a markdown renderer like react-markdown:
              <ReactMarkdown>{systemInstructions}</ReactMarkdown>
            */}
            <pre className="whitespace-pre-wrap">{systemInstructions}</pre>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default PromptSettingsTab;

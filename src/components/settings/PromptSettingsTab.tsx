import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Eye, FileText, Save, Trash2, X, FileUp } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useSettingsContext } from "@/contexts/SettingsContext";
import { useChatStore } from "@/store/chat-store";
import { CHEST_PAIN_SYSTEM_PROMPT } from "@/store/chat/constants";
import { updateChatSystemPrompt } from "@/utils/chatMessageUtils";
import { getPathologySystemPrompt, savePathologySystemPrompt, getPathologyAttachments, savePathologyAttachments } from "@/utils/settingsStorage";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { FileAttachment } from "@/services/api";
import { storage } from "@/services/firebase";
import { ref, uploadBytes, getDownloadURL, listAll, getMetadata } from "firebase/storage";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

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
  const dropAreaRef = useRef<HTMLDivElement>(null);
  const { chats, setChats, currentChat } = useChatStore();
  const [pathologyAttachments, setPathologyAttachments] = useState<FileAttachment[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [pendingUploads, setPendingUploads] = useState<{
    attachment: FileAttachment;
    exists: boolean;
  }[]>([]);
  const [currentUploadIndex, setCurrentUploadIndex] = useState(0);

  // Carregar prompt quando a patologia mudar
  useEffect(() => {
    const loadPathologyData = async () => {
      if (pathology) {
        try {
          console.log(`[PromptSettingsTab] Loading data for pathology: "${pathology}"`);
          
          // Limpar o campo de instruções enquanto carrega
          setSystemInstructions("");
          
          // Carregar o prompt específico da patologia de forma assíncrona
          console.log(`[PromptSettingsTab] Attempting to load system prompt for pathology: "${pathology}"`);
          const savedPrompt = await getPathologySystemPrompt(pathology);
          console.log(`[PromptSettingsTab] Result from getPathologySystemPrompt:`, 
            savedPrompt ? `Found (${savedPrompt.length} chars)` : "Not found", 
            savedPrompt ? `Content (first 50 chars): ${savedPrompt.substring(0, 50)}...` : ""
          );
          
          if (savedPrompt) {
            console.log(`[PromptSettingsTab] Setting system instructions with prompt from Firestore`);
            // Ensure we're setting a string value
            const promptText = String(savedPrompt);
            console.log(`[PromptSettingsTab] Setting systemInstructions to: ${promptText.substring(0, 50)}...`);
            setSystemInstructions(promptText);
          } else {
            console.log(`[PromptSettingsTab] No system prompt found for pathology: "${pathology}"`);
            setSystemInstructions("");
          }

          // Carregar anexos da patologia
          const attachments = await getPathologyAttachments(pathology);
          if (attachments && attachments.length > 0) {
            console.log(`[PromptSettingsTab] Loaded ${attachments.length} attachments for pathology: "${pathology}"`);
            setPathologyAttachments(attachments);
          } else {
            console.log(`[PromptSettingsTab] No attachments found for pathology: "${pathology}"`);
            setPathologyAttachments([]);
          }
        } catch (error) {
          console.error("[PromptSettingsTab] Error loading pathology data:", error);
          toast.error("Erro ao carregar dados da patologia");
          setSystemInstructions("");
          setPathologyAttachments([]);
        }
      } else {
        // Limpar os campos se não houver patologia selecionada
        setSystemInstructions("");
        setPathologyAttachments([]);
      }
    };
    
    loadPathologyData();
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

  // Função para formatar o tamanho do arquivo
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  // Função para lidar com o upload de anexos
  const handleAttachmentUpload = (files: FileList | File[]) => {
    const validFiles: FileAttachment[] = [];
    const invalidFiles: string[] = [];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    Array.from(files).forEach(file => {
      // Verificar o tipo de arquivo (aceitar apenas PDF, imagens e arquivos de texto)
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'text/plain', 'text/markdown'];
      const isValidType = validTypes.includes(file.type) || 
                          file.name.endsWith('.pdf') || 
                          file.name.endsWith('.jpg') || 
                          file.name.endsWith('.jpeg') || 
                          file.name.endsWith('.png') || 
                          file.name.endsWith('.gif') || 
                          file.name.endsWith('.txt') || 
                          file.name.endsWith('.md');
      
      if (!isValidType) {
        invalidFiles.push(`${file.name} (tipo inválido)`);
        return;
      }
      
      // Verificar o tamanho do arquivo
      if (file.size > maxSize) {
        invalidFiles.push(`${file.name} (tamanho excede 5MB)`);
        return;
      }
      
      // Converter o arquivo para base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64data = e.target?.result as string;
        
        // Criar um objeto de anexo
        const attachment: FileAttachment = {
          name: file.name,
          type: file.type,
          size: file.size,
          base64data: base64data
        };
        
        // Adicionar à lista de anexos
        setPathologyAttachments(prev => [...prev, attachment]);
      };
      
      reader.readAsDataURL(file);
      validFiles.push({
        name: file.name,
        type: file.type,
        size: file.size,
        base64data: '' // Será preenchido pelo leitor
      });
    });
    
    // Mostrar mensagens de erro para arquivos inválidos
    if (invalidFiles.length > 0) {
      toast.error(`Arquivos inválidos: ${invalidFiles.join(', ')}`);
    }
    
    // Mostrar mensagem de sucesso para arquivos válidos
    if (validFiles.length > 0) {
      toast.success(`${validFiles.length} arquivo(s) adicionado(s) com sucesso`);
    }
    
    // Limpar o input de arquivo
    if (attachmentInputRef.current) {
      attachmentInputRef.current.value = '';
    }
  };

  // Função para remover um anexo
  const handleRemoveAttachment = (index: number) => {
    setPathologyAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Funções para drag and drop
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleAttachmentUpload(e.dataTransfer.files);
    }
  };

  const handleAttachmentClick = () => {
    attachmentInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleAttachmentUpload(e.target.files);
    }
  };

  // Função para verificar se um arquivo existe no Firebase Storage
  const checkFileExists = async (pathology: string, fileName: string): Promise<boolean> => {
    try {
      // Usar o caminho correto do Firebase Storage
      const storageRef = ref(storage, `arcyon/prompts-files/${pathology}/${fileName}`);
      console.log(`[PromptSettingsTab] Verificando existência em: gs://iatros-template.firebasestorage.app/arcyon/prompts-files/${pathology}/${fileName}`);
      await getMetadata(storageRef);
      return true; // Se não lançar erro, o arquivo existe
    } catch (error) {
      console.log(`[PromptSettingsTab] Arquivo não encontrado em: gs://iatros-template.firebasestorage.app/arcyon/prompts-files/${pathology}/${fileName}`);
      return false; // Se lançar erro, o arquivo não existe
    }
  };

  // Função para fazer upload de um arquivo para o Firebase Storage
  const uploadFileToStorage = async (attachment: FileAttachment, pathology: string): Promise<void> => {
    console.log(`[PromptSettingsTab] uploadFileToStorage - INICIO`, {
      attachmentName: attachment.name,
      attachmentType: attachment.type,
      attachmentSize: attachment.size,
      pathology: pathology,
      hasBase64: !!attachment.base64data,
      base64Prefix: attachment.base64data ? attachment.base64data.substring(0, 30) + '...' : 'N/A'
    });

    if (!attachment.base64data || !attachment.base64data.startsWith('data:')) {
      console.log(`[PromptSettingsTab] Arquivo "${attachment.name}" já foi enviado anteriormente`);
      return;
    }

    try {
      console.log(`[PromptSettingsTab] Iniciando upload do arquivo "${attachment.name}" para Firebase Storage`);
      
      // Converter base64 para blob
      const response = await fetch(attachment.base64data);
      const blob = await response.blob();
      
      // Log do tamanho do blob para depuração
      console.log(`[PromptSettingsTab] Tamanho do blob para "${attachment.name}": ${blob.size} bytes`);
      
      // Verificar se o blob é válido
      if (blob.size === 0) {
        throw new Error("Blob vazio");
      }
      
      // Criar referência no Firebase Storage com o caminho correto
      const storagePath = `arcyon/prompts-files/${pathology}/${attachment.name}`;
      const fullStoragePath = `gs://iatros-template.firebasestorage.app/${storagePath}`;
      console.log(`[PromptSettingsTab] Caminho de armazenamento completo: ${fullStoragePath}`);
      console.log(`[PromptSettingsTab] Detalhes do caminho:`, {
        storagePath,
        fullStoragePath,
        pathology,
        fileName: attachment.name
      });
      
      const storageRef = ref(storage, storagePath);
      
      // Verificar se a referência foi criada corretamente
      console.log(`[PromptSettingsTab] Referência criada:`, {
        fullPath: storageRef.fullPath,
        bucket: storageRef.bucket,
        name: storageRef.name
      });
      
      // Fazer upload do arquivo com metadados
      const metadata = {
        contentType: attachment.type || 'application/octet-stream',
        customMetadata: {
          uploadedAt: new Date().toISOString(),
          pathology: pathology,
          storageBucket: 'iatros-template.firebasestorage.app'
        }
      };
      
      console.log(`[PromptSettingsTab] Iniciando uploadBytes para "${attachment.name}" com metadados:`, metadata);
      const uploadResult = await uploadBytes(storageRef, blob, metadata);
      console.log(`[PromptSettingsTab] Upload concluído para "${attachment.name}"`, {
        metadata: uploadResult.metadata,
        ref: uploadResult.ref.fullPath,
        totalBytes: uploadResult.metadata.size
      });
      
      // Obter URL do arquivo para confirmar que o upload foi bem-sucedido
      try {
        const downloadURL = await getDownloadURL(uploadResult.ref);
        console.log(`[PromptSettingsTab] URL de download para "${attachment.name}": ${downloadURL}`);
      } catch (urlError) {
        console.error(`[PromptSettingsTab] Erro ao obter URL de download para "${attachment.name}":`, {
          error: urlError,
          code: urlError instanceof Error && 'code' in urlError ? (urlError as any).code : 'unknown',
          message: urlError instanceof Error ? urlError.message : String(urlError)
        });
        // Não lançar erro aqui, pois o upload já foi concluído
      }
    } catch (error) {
      console.error(`[PromptSettingsTab] Erro detalhado ao fazer upload do arquivo "${attachment.name}":`, {
        error,
        code: error instanceof Error && 'code' in error ? (error as any).code : 'unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : 'No stack trace'
      });
      
      // Verificar se é um erro de permissão
      if (error instanceof Error && error.message.includes('permission-denied')) {
        console.error('[PromptSettingsTab] Erro de permissão. Verifique as regras de segurança do Firebase Storage.');
        toast.error(`Erro de permissão ao enviar "${attachment.name}". Verifique as regras do Firebase Storage.`);
      } 
      // Verificar se é um erro de rede
      else if (error instanceof Error && (error.message.includes('network') || error.message.includes('connection'))) {
        console.error('[PromptSettingsTab] Erro de rede. Verifique sua conexão com a internet.');
        toast.error(`Erro de rede ao enviar "${attachment.name}". Verifique sua conexão.`);
      }
      // Verificar se é um erro de quota
      else if (error instanceof Error && error.message.includes('quota')) {
        console.error('[PromptSettingsTab] Erro de quota excedida no Firebase Storage.');
        toast.error(`Quota excedida ao enviar "${attachment.name}". Contate o administrador.`);
      }
      // Outros erros
      else {
        toast.error(`Erro ao enviar arquivo "${attachment.name}": ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      }
      
      throw error;
    }
  };

  // Função para processar o próximo arquivo na fila de uploads
  const processNextUpload = async () => {
    // Log melhorado para debug
    console.log(`[PromptSettingsTab] processNextUpload: índice atual = ${currentUploadIndex}, total = ${pendingUploads.length}`);
    
    // Verificação de segurança para garantir que temos uploads para processar
    if (pendingUploads.length === 0) {
      console.log('[PromptSettingsTab] Nenhum upload pendente para processar');
      return;
    }
    
    if (currentUploadIndex >= pendingUploads.length) {
      // Todos os uploads foram processados
      console.log('[PromptSettingsTab] Todos os uploads foram processados');
      setPendingUploads([]);
      setCurrentUploadIndex(0);
      toast.success("Configurações da patologia salvas com sucesso");
      return;
    }

    const { attachment, exists } = pendingUploads[currentUploadIndex];
    console.log(`[PromptSettingsTab] Processando arquivo: "${attachment.name}", existe = ${exists}`);

    if (exists) {
      // Se o arquivo existe, mostrar diálogo de confirmação
      console.log(`[PromptSettingsTab] Arquivo "${attachment.name}" já existe. Mostrando diálogo de confirmação.`);
      setIsConfirmDialogOpen(true);
    } else {
      // Se o arquivo não existe, fazer upload diretamente
      try {
        await uploadFileToStorage(attachment, pathology);
        console.log(`[PromptSettingsTab] Upload bem-sucedido para "${attachment.name}"`);
        
        // Processar o próximo arquivo
        setCurrentUploadIndex(prevIndex => prevIndex + 1);
        // Usar setTimeout para garantir que o estado seja atualizado antes de chamar processNextUpload novamente
        setTimeout(() => {
          processNextUpload();
        }, 100);
      } catch (error) {
        console.error(`[PromptSettingsTab] Erro ao fazer upload do arquivo "${attachment.name}":`, error);
        // Continuar com o próximo arquivo mesmo em caso de erro
        setCurrentUploadIndex(prevIndex => prevIndex + 1);
        // Usar setTimeout para garantir que o estado seja atualizado antes de chamar processNextUpload novamente
        setTimeout(() => {
          processNextUpload();
        }, 100);
      }
    }
  };

  // Função para confirmar a substituição de um arquivo
  const handleConfirmReplace = async () => {
    setIsConfirmDialogOpen(false);
    
    if (currentUploadIndex < pendingUploads.length) {
      const { attachment } = pendingUploads[currentUploadIndex];
      console.log(`[PromptSettingsTab] Confirmada substituição do arquivo "${attachment.name}"`);
      
      try {
        await uploadFileToStorage(attachment, pathology);
        console.log(`[PromptSettingsTab] Substituição bem-sucedida para "${attachment.name}"`);
      } catch (error) {
        console.error(`[PromptSettingsTab] Erro ao substituir o arquivo "${attachment.name}":`, error);
      }
      
      // Processar o próximo arquivo
      setCurrentUploadIndex(prevIndex => prevIndex + 1);
      // Usar setTimeout para garantir que o estado seja atualizado antes de chamar processNextUpload novamente
      setTimeout(() => {
        processNextUpload();
      }, 100);
    }
  };

  // Função para cancelar a substituição de um arquivo
  const handleCancelReplace = () => {
    setIsConfirmDialogOpen(false);
    
    if (currentUploadIndex < pendingUploads.length) {
      const { attachment } = pendingUploads[currentUploadIndex];
      console.log(`[PromptSettingsTab] Cancelada substituição do arquivo "${attachment.name}"`);
    }
    
    // Pular este arquivo e processar o próximo
    setCurrentUploadIndex(prevIndex => prevIndex + 1);
    // Usar setTimeout para garantir que o estado seja atualizado antes de chamar processNextUpload novamente
    setTimeout(() => {
      processNextUpload();
    }, 100);
  };

  // Função para salvar configurações e atualizar chats
  const handleSaveAndUpdateChats = async () => {
    if (!pathology) {
      toast.error("Por favor, selecione uma patologia antes de salvar");
      return;
    }
    
    try {
      console.log("[PromptSettingsTab] Iniciando salvamento de configurações para patologia:", pathology);
      console.log("[PromptSettingsTab] Número de anexos:", pathologyAttachments.length);
      console.log("[PromptSettingsTab] Detalhes da patologia e anexos:", {
        pathology,
        pathologyAttachments: pathologyAttachments.map(att => ({
          name: att.name,
          type: att.type,
          size: att.size,
          hasBase64: !!att.base64data,
          base64Prefix: att.base64data ? att.base64data.substring(0, 30) + '...' : 'N/A'
        }))
      });
      
      // First save settings as normal to avoid race conditions
      handleSave();
      console.log("[PromptSettingsTab] Configurações básicas salvas");
      
      // Salvar o prompt específico para a patologia de forma assíncrona
      try {
        await savePathologySystemPrompt(pathology, systemInstructions);
        console.log("[PromptSettingsTab] Prompt do sistema salvo com sucesso");
      } catch (promptError) {
        console.error("[PromptSettingsTab] Erro ao salvar prompt do sistema:", promptError);
        toast.error("Erro ao salvar prompt do sistema");
        // Continue with other operations
      }
      
      // Salvar os anexos da patologia
      try {
        await savePathologyAttachments(pathology, pathologyAttachments);
        console.log("[PromptSettingsTab] Anexos salvos com sucesso no Firestore");
      } catch (attachmentsError) {
        console.error("[PromptSettingsTab] Erro ao salvar anexos no Firestore:", {
          error: attachmentsError,
          message: attachmentsError instanceof Error ? attachmentsError.message : String(attachmentsError),
          stack: attachmentsError instanceof Error ? attachmentsError.stack : 'No stack trace'
        });
        toast.error("Erro ao salvar anexos no Firestore");
        // Continue with other operations
      }
      
      // Verificar quais arquivos já existem no Firebase Storage
      const newPendingUploads = [];
      
      console.log("[PromptSettingsTab] Verificando arquivos existentes no Firebase Storage para a patologia:", pathology);
      
      for (const attachment of pathologyAttachments) {
        console.log(`[PromptSettingsTab] Verificando arquivo: ${attachment.name}`, {
          hasBase64: !!attachment.base64data,
          base64Prefix: attachment.base64data ? attachment.base64data.substring(0, 30) + '...' : 'N/A',
          size: attachment.size,
          type: attachment.type
        });
        
        if (attachment.base64data && attachment.base64data.startsWith('data:')) {
          console.log(`[PromptSettingsTab] Verificando existência do arquivo "${attachment.name}"`);
          const exists = await checkFileExists(pathology, attachment.name);
          console.log(`[PromptSettingsTab] Arquivo "${attachment.name}" existe? ${exists}`);
          newPendingUploads.push({ attachment, exists });
        } else {
          console.log(`[PromptSettingsTab] Arquivo "${attachment.name}" não tem dados base64 ou já foi enviado`);
        }
      }
      
      // Se não houver arquivos para fazer upload, pular esta etapa
      if (newPendingUploads.length === 0) {
        console.log("[PromptSettingsTab] Nenhum arquivo novo para fazer upload");
        toast.success("Configurações da patologia salvas com sucesso");
      } else {
        console.log(`[PromptSettingsTab] ${newPendingUploads.length} arquivos para upload:`, 
          newPendingUploads.map(item => ({
            name: item.attachment.name,
            exists: item.exists
          }))
        );
        
        // Configurar a fila de uploads e iniciar o processamento de forma segura
        // Usa uma função assíncrona local para garantir que o estado seja atualizado
        const startUploads = async () => {
          setPendingUploads(newPendingUploads);
          setCurrentUploadIndex(0);
          
          // Esperar um pouco para garantir que o estado foi atualizado
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Verificar explicitamente se temos pendingUploads antes de iniciar
          console.log(`[PromptSettingsTab] Iniciando uploads de ${newPendingUploads.length} arquivos após delay`);
          
          // Usa diretamente newPendingUploads em vez de pendingUploads para garantir que temos os arquivos
          if (newPendingUploads.length > 0) {
            // Primeiro upload manualmente para evitar problemas de estado
            const { attachment, exists } = newPendingUploads[0];
            console.log(`[PromptSettingsTab] Processando primeiro arquivo: "${attachment.name}", existe = ${exists}`);
            
            if (exists) {
              // Se o arquivo existe, mostrar diálogo de confirmação
              console.log(`[PromptSettingsTab] Arquivo "${attachment.name}" já existe. Mostrando diálogo de confirmação.`);
              setIsConfirmDialogOpen(true);
            } else {
              // Se o arquivo não existe, fazer upload diretamente
              try {
                console.log(`[PromptSettingsTab] Iniciando upload do arquivo "${attachment.name}"`);
                await uploadFileToStorage(attachment, pathology);
                console.log(`[PromptSettingsTab] Upload bem-sucedido para "${attachment.name}"`);
                
                // Configurar para o próximo arquivo
                setCurrentUploadIndex(1);
                processNextUpload();
              } catch (error) {
                console.error(`[PromptSettingsTab] Erro ao fazer upload do arquivo "${attachment.name}":`, error);
                setCurrentUploadIndex(1);
                processNextUpload();
              }
            }
          } else {
            console.log('[PromptSettingsTab] Nenhum arquivo para upload após a verificação final');
          }
        };

        // Iniciar o processo de upload
        startUploads();
      }
      
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
        try {
          // Update all chats with the new system prompt
          const updatedChats = chats.map(chat => updateChatSystemPrompt(chat, systemPrompt));
          setChats(updatedChats);
          console.log("[PromptSettingsTab] Chats atualizados com o novo prompt do sistema");
        } catch (chatsError) {
          console.error("[PromptSettingsTab] Erro ao atualizar chats:", chatsError);
          // No mostrar toast para evitar confusión
        }
      }
    } catch (error) {
      console.error("[PromptSettingsTab] Erro geral ao salvar configurações da patologia:", error);
      toast.error("Erro ao salvar configurações da patologia");
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
                  <Upload className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => setIsPreviewOpen(true)} 
                  title="Visualizar Markdown"
                  disabled={systemInstructions.length >= 0}
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
              value={"•".repeat(systemInstructions.length)} 
              onChange={(e) => setSystemInstructions(e.target.value)} 
              placeholder="Digite ou faça upload das instruções do sistema em formato Markdown..." 
              className="h-[300px] font-mono text-sm" 
            />
            <p className="text-xs text-muted-foreground mt-1">
              Estas instruções serão enviadas ao modelo como contexto para guiar suas respostas. 
              Você pode usar a formatação Markdown para organizar o conteúdo.
            </p>
          </div>

          {/* Área de anexos */}
          <div className="grid gap-2">
            <div className="flex justify-between items-center">
              <Label>Arquivos para o System Prompt</Label>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleAttachmentClick}
                className="flex items-center gap-1"
              >
                <FileUp className="h-4 w-4" />
                Anexar Arquivo
              </Button>
              <input 
                type="file" 
                ref={attachmentInputRef} 
                onChange={handleFileInputChange} 
                className="hidden" 
                multiple 
              />
            </div>
            
            {/* Área de arrastar e soltar */}
            <div 
              ref={dropAreaRef}
              className={`border-2 border-dashed rounded-md p-4 transition-colors ${
                isDragging ? 'border-primary bg-primary/10' : 'border-muted-foreground/20'
              }`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">
                  Arraste e solte arquivos aqui ou clique em "Anexar Arquivo"
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Formatos aceitos: PDF, imagens (JPG, PNG, GIF) e arquivos de texto (TXT, MD)
                </p>
              </div>
            </div>
            
            {/* Lista de arquivos anexados */}
            {pathologyAttachments.length > 0 && (
              <div className="mt-2">
                <h4 className="text-sm font-medium mb-2">Arquivos anexados:</h4>
                <div className="space-y-2">
                  {pathologyAttachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-muted/50 p-2 rounded-md">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileText className="h-4 w-4 flex-shrink-0" />
                        <span className="text-sm truncate">{file.name}</span>
                        <span className="text-xs text-muted-foreground">({formatFileSize(file.size)})</span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleRemoveAttachment(index)}
                        className="h-6 w-6"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <p className="text-xs text-muted-foreground mt-1">
              Anexe arquivos relevantes que serão associados ao prompt do sistema para esta patologia.
              Estes arquivos serão armazenados e disponibilizados para o assistente durante as conversas.
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
      
      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Substituir arquivo existente?</AlertDialogTitle>
            <AlertDialogDescription>
              {currentUploadIndex < pendingUploads.length && (
                <>
                  O arquivo "{pendingUploads[currentUploadIndex]?.attachment.name}" já existe na pasta da patologia.
                  Deseja substituí-lo pelo novo arquivo?
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelReplace}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmReplace}>Substituir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default PromptSettingsTab;

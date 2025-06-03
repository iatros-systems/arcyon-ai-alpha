import { useEffect, useState, useRef } from "react";
import ChatMessages from "@/components/ChatMessages";
import ChatInput from "@/components/ChatInput";
import { useChatStore } from "@/store/chat-store";
import { useChatMessages } from "@/hooks/useChatMessages";
import { getPathologySystemPrompt, getPathologyAttachments, getStoredSystemPromptSettings } from "@/utils/settingsStorage";
import { AlertTriangle, FileX, Settings, Info, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { hasFirestoreAttachments } from "@/utils/settingsStorage";

interface ChatContentProps {
  sidebarCollapsed: boolean;
}

const ChatContent = ({ sidebarCollapsed }: ChatContentProps) => {
  const { currentChat, startNewChat, addMessage, updateChatMetadata } = useChatStore();
  const { loading: apiLoading, handleSendMessage } = useChatMessages();
  const [loading, setLoading] = useState(false);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const [hasSystemPrompt, setHasSystemPrompt] = useState(true);
  const [hasAttachments, setHasAttachments] = useState(true);
  const [currentPathology, setCurrentPathology] = useState("");
  const [disclaimerShown, setDisclaimerShown] = useState(false);
  
  // Estado para controlar se os termos foram aceitos para a conversa atual
  const [termsAccepted, setTermsAccepted] = useState(false);
  // Estado para controlar a exibição do modal de termos
  const [showTermsDialog, setShowTermsDialog] = useState(false);

  // Create first chat if none exists
  useEffect(() => {
    if (!currentChat) {
      startNewChat();
    }
  }, [currentChat, startNewChat]);

  // Verificar se os termos foram aceitos para o chat atual
  useEffect(() => {
    if (currentChat) {
      // Verificar se o chat atual já tem os termos aceitos
      const chatHasTermsAccepted = currentChat.metadata?.termsAccepted === true;
      
      // Atualizar o estado local com base nos metadados do chat
      setTermsAccepted(chatHasTermsAccepted);
      
      // Mostrar o diálogo apenas se os termos ainda não foram aceitos para este chat
      setShowTermsDialog(!chatHasTermsAccepted);
    }
  }, [currentChat]);

  // Mostrar o disclaimer quando um novo chat é iniciado e os termos foram aceitos
  useEffect(() => {
    if (currentChat && currentChat.messages.length === 0 && !disclaimerShown && termsAccepted) {
      // Adicionar mensagem de disclaimer como mensagem do sistema
      addMessage({
        role: "system",
        content: "⚠️ **Disclaimer Médico-Legal**: As sugestões e recomendações fornecidas pelo Arcyon são apenas informativas. O médico tem total responsabilidade sobre as decisões clínicas tomadas. O Arcyon não possui autoridade médica ou legal para medicar ou tratar pacientes."
      });
      setDisclaimerShown(true);
    }
  }, [currentChat, disclaimerShown, addMessage, termsAccepted]);

  // Verificar se há um prompt de sistema e anexos
  useEffect(() => {
    checkPathologyResources();

    // Verificar periodicamente
    const intervalId = setInterval(() => {
      checkPathologyResources();
    }, 5000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);



  const checkPathologyResources = async () => {
    const { pathology } = currentChat?.metadata || {};
    //const pathology: any = currentChat?.metadata?.pathology;


    console.log("DEBUG: currentChat", currentChat);
    console.log("DEBUG: currentChat?.metadata", currentChat?.metadata);
    console.log("DEBUG: currentChat?.metadata?.pathology", currentChat?.metadata?.pathology);

    /*if (!pathology) {
      setHasSystemPrompt(false);
      setHasAttachments(false);
      return;
    }*/

    console.log("DEBUG: pathology para anexos:", pathology);
    if (!pathology || pathology === "undefined") {
      setHasSystemPrompt(true);
      setHasAttachments(true);
      return;
    }

    

    try {
      // Verificar si hay prompt de sistema
      const systemPrompt = await getPathologySystemPrompt(pathology);
      setHasSystemPrompt(!!systemPrompt && systemPrompt.trim() !== "");
  
      // NUEVO: Verificar anexos directamente en Firestore
      const exists = await hasFirestoreAttachments(pathology);
    setHasAttachments(exists);
    console.log("Patología usada para anexos:", pathology);
    } catch (error) {
    console.error("Erro ao verificar recursos da patologia:", error);
    setHasSystemPrompt(false);
    setHasAttachments(false);
  }
  };

  // Função para aceitar os termos
  const handleAcceptTerms = () => {
    setTermsAccepted(true);
    setShowTermsDialog(false);
    
    // Salvar o estado de aceitação dos termos nos metadados do chat
    if (currentChat) {
      // Atualizar os metadados do chat para registrar que os termos foram aceitos
      updateChatMetadata(currentChat.id, { 
        ...currentChat.metadata,
        termsAccepted: true 
      });
    }
  };

  // Wrapper para o handleSendMessage que gerencia o estado de loading
  const handleSubmit = async (messageContent: string, files?: File[]) => {
    // Verificar se os termos foram aceitos
    if (!termsAccepted) {
      setShowTermsDialog(true);
      console.log("⚠️ Medico nao aceitou o termos e condicoes.");
      return false;
    }
    
    
    // Verificar se há um prompt de sistema configurado
    if (!hasSystemPrompt) {
      addMessage({
        role: "system",
        content: "⚠️ Não é possível enviar mensagens sem um prompt de sistema configurado. Por favor, configure o prompt do sistema nas configurações."
      });
      console.log("⚠️ Não é possível enviar mensagens sem um prompt de sistema configurado. Por favor, configure o prompt do sistema nas configurações.");
      return false;
    }

    /*// Verificar se há anexos configurados
    if (!hasAttachments) {
      addMessage({
        role: "system",
        content: "⚠️ Não é possível enviar mensagens sem anexos configurados para o prompt do sistema. Por favor, adicione anexos nas configurações."
      });
      console.log("⚠️ Não é possível enviar mensagens sem anexos configurados para o prompt do sistema. Por favor, adicione anexos nas configurações.", files);

      return false;
    }*/

    setLoading(true);
    startTimeRef.current = Date.now(); // Registra o tempo de início
    setResponseTime(null); // Reseta o tempo de resposta anterior
    
    try {
      const result = await handleSendMessage(messageContent, files);
      
      // Calcula o tempo decorrido
      const elapsedTime = Math.round((Date.now() - startTimeRef.current) / 1000);
      setResponseTime(elapsedTime);

      console.log("Mensagem enviada pelo usuário:", messageContent, files);

      
      return result;
    } finally {
      // Pequeno atraso antes de remover o indicador de loading para garantir que a UI seja atualizada
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  };

  // Renderizar aviso se não houver prompt de sistema ou anexos
  const renderWarningMessage = () => {
    if (!hasSystemPrompt) {
      return (
        <div className="flex flex-col items-center justify-center p-6 bg-red-50 dark:bg-red-900/20 rounded-lg mb-4 mx-4 mt-4">
          <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2 text-center">Prompt do Sistema não configurado</h3>
          <p className="text-center mb-4">
            É necessário configurar um prompt do sistema para a patologia <strong>{currentPathology || "atual"}</strong> antes de iniciar o chat.
          </p>
          <Button asChild>
            <Link to="/settings">
              <Settings className="h-4 w-4 mr-2" />
              Ir para Configurações
            </Link>
          </Button>
        </div>
      );
    }
    
    if (!hasAttachments) {
      return (
        <div className="flex flex-col items-center justify-center p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg mb-4 mx-4 mt-4">
          <FileX className="h-12 w-12 text-yellow-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2 text-center">Arquivos não anexados</h3>
          <p className="text-center mb-4">
            É necessário anexar arquivos ao prompt do sistema para a patologia <strong>{currentPathology || "atual"}</strong> antes de iniciar o chat.
          </p>
          <Button asChild>
            <Link to="/settings">
              <Settings className="h-4 w-4 mr-2" />
              Ir para Configurações
            </Link>
          </Button>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="flex flex-col flex-1 h-full relative overflow-hidden">
      {/* Modal de Termos e Condições */}
      <Dialog 
        open={showTermsDialog} 
        onOpenChange={(open) => {
          // Impedir que o diálogo seja fechado sem aceitar os termos
          if (!open && !termsAccepted) {
            setShowTermsDialog(true);
            return;
          }
          setShowTermsDialog(open);
        }}
      >
        <DialogContent 
          className="sm:max-w-md"
          onEscapeKeyDown={(e) => {
            // Impedir que a tecla ESC feche o diálogo
            if (!termsAccepted) {
              e.preventDefault();
            }
          }}
          onInteractOutside={(e) => {
            // Impedir que cliques fora do diálogo o fechem
            if (!termsAccepted) {
              e.preventDefault();
            }
          }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
              Termos de Uso
            </DialogTitle>
            <DialogDescription>
              Antes de iniciar uma nova conversa, é necessário aceitar os termos de uso.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="rounded-md bg-yellow-50 dark:bg-yellow-900/20 p-4 text-sm">
              <p className="font-medium">
                Este assistente usa inteligência artificial e não tem autoridade médica ou legal. As decisões clínicas são de responsabilidade do profissional de saúde.
              </p>
              <ul className="mt-2 list-disc pl-5 space-y-1">
                <li>O Arcyon é uma ferramenta de suporte à decisão médica.</li>
                <li>As informações fornecidas são apenas sugestões e não substituem o julgamento clínico.</li>
                <li>O profissional de saúde é o único responsável por todas as decisões tomadas.</li>
                <li>O Arcyon não possui autoridade médica ou legal para medicar ou tratar pacientes.</li>
              </ul>
              
              <div className="mt-4 border-t border-yellow-200 dark:border-yellow-800 pt-3">
                <p className="text-xs font-medium mb-2">Leis e Autoridades que Regulam IA em Saúde no Brasil:</p>
                <div className="max-h-40 overflow-y-auto pr-2 text-xs text-gray-700 dark:text-gray-300 border border-yellow-200 dark:border-yellow-800 rounded p-2 bg-white/50 dark:bg-gray-800/50">
                  <p className="font-medium mb-1">1. Conselho Federal de Medicina (CFM)</p>
                  <ul className="list-disc pl-5 mb-2">
                    <li>Resolução CFM nº 2.227/2018 (revogada e substituída pelo debate contínuo):
                      <ul className="list-disc pl-5">
                        <li>O CFM reafirma que a decisão médica não pode ser substituída por máquinas.</li>
                      </ul>
                    </li>
                  </ul>
                  
                  <p className="font-medium mb-1">2. Código de Ética Médica (CFM)</p>
                  <ul className="list-disc pl-5 mb-2">
                    <li>O médico não pode delegar decisões clínicas a sistemas automatizados.</li>
                    <li>Artigo 1º: "O alvo de toda a atenção do médico é a saúde do ser humano, em benefício da qual deverá agir com o máximo de zelo e o melhor de sua capacidade profissional."</li>
                  </ul>
                  
                  <p className="font-medium mb-1">3. LGPD (Lei Geral de Proteção de Dados – Lei nº 13.709/2018)</p>
                  <ul className="list-disc pl-5 mb-2">
                    <li>Regula o uso de dados pessoais sensíveis, como dados de saúde.</li>
                    <li>Exige consentimento explícito e obriga que o tratamento de dados por IA esteja claramente definido.</li>
                    <li>Artigo 11: Dados de saúde exigem consentimento explícito e finalidade específica.</li>
                    <li>Art. 20: Garante ao titular o direito de solicitar revisão de decisões automatizadas.</li>
                  </ul>
                  
                  <p className="font-medium mb-1">4. ANVISA</p>
                  <ul className="list-disc pl-5 mb-2">
                    <li>RDC 657/2022: Classifica softwares com função clínica (ex.: diagnóstico por imagem ou recomendação terapêutica) como dispositivos médicos, exigindo registro e certificação como dispositivo médico (SaMD).</li>
                    <li>Segue diretrizes internacionais como da IMDRF e FDA.</li>
                  </ul>
                  
                  <p className="font-medium mb-1">5. Marco Legal da Inteligência Artificial (PL 21/2020 e outros)</p>
                  <ul className="list-disc pl-5 mb-2">
                    <li>Princípios de transparência, explicabilidade, responsabilidade humana e não substituição da decisão clínica.</li>
                  </ul>
                  
                  <p className="font-medium mb-1">6. Código Civil (Lei 10.406/2002)</p>
                  <ul className="list-disc pl-5 mb-2">
                    <li>Artigo 186: Define que o médico responde civilmente por danos causados por negligência, mesmo usando IA.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="sm:justify-center">
            <Button 
              type="button" 
              onClick={handleAcceptTerms}
              className="w-full sm:w-auto"
            >
              Entendi e estou de acordo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {renderWarningMessage()}
      
      <div className={`flex-1 overflow-hidden relative ${(!hasSystemPrompt || !hasAttachments || !termsAccepted) ? 'opacity-50 pointer-events-none' : ''}`}>
        <ChatMessages 
          messages={currentChat?.messages.filter(m => m.role !== "system") || []}
          loading={loading || apiLoading} 
          responseTime={responseTime}
        />
      </div>
      
      {/* Disclaimer no rodapé */}
      <div className="w-full border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 px-4 py-1 flex items-center justify-between">
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
          <Shield className="h-3 w-3 mr-1 flex-shrink-0" />
          <span className="truncate">As recomendações fornecidas por este agente conversacional não substituem avaliação médica. O profissional de saúde é responsável por todas as decisões clínicas. </span>
        </div>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
                <Info className="h-3 w-3 text-gray-500" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <p className="text-xs">
                <strong>Disclaimer Médico-Legal:</strong> As sugestões e recomendações fornecidas pelo Arcyon são apenas informativas. 
                O médico tem total responsabilidade sobre as decisões clínicas tomadas. 
                O Arcyon não possui autoridade médica ou legal para medicar ou tratar pacientes.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <div className="z-10 w-full bg-background">
        <ChatInput 
          onSubmit={handleSubmit} 
          disabled= {loading || apiLoading || !hasSystemPrompt || !termsAccepted} 
        />
      </div>
    </div>
  );
};

export default ChatContent;

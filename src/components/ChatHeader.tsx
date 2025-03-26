import { Button } from "@/components/ui/button";
import { Menu, X, SunMoon, Moon, Settings, Brain, AlertTriangle, FileX } from "lucide-react";
import { Link } from "react-router-dom";
import ApiKeyDialog from "@/components/ApiKeyDialog";
import { useState, useEffect } from "react";
import { getActiveApiName, hasAnyApiConfigured } from "@/services/messageService";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getPathologySystemPrompt, getPathologyAttachments } from "@/utils/settingsStorage";
import { getStoredSystemPromptSettings } from "@/utils/settingsStorage";

interface ChatHeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const ChatHeader = ({ 
  sidebarOpen, 
  setSidebarOpen, 
  darkMode, 
  toggleDarkMode 
}: ChatHeaderProps) => {
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);
  const [activeApi, setActiveApi] = useState("");
  const [hasSystemPrompt, setHasSystemPrompt] = useState(true);
  const [hasAttachments, setHasAttachments] = useState(true);
  const [currentPathology, setCurrentPathology] = useState("");

  useEffect(() => {
    // Atualizar o nome da API ativa quando o componente montar
    setActiveApi(getActiveApiName());

    // Verificar se há um prompt de sistema e anexos
    checkSystemPromptAndAttachments();

    // Adicionar um listener para mudanças no localStorage
    const handleStorageChange = () => {
      setActiveApi(getActiveApiName());
      checkSystemPromptAndAttachments();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Verificar periodicamente se a API mudou (a cada 5 segundos)
    const intervalId = setInterval(() => {
      setActiveApi(getActiveApiName());
      checkSystemPromptAndAttachments();
    }, 5000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, []);

  const checkSystemPromptAndAttachments = () => {
    // Obter a patologia atual
    const settings = getStoredSystemPromptSettings();
    const pathology = settings.pathology;
    setCurrentPathology(pathology);

    // Verificar se há um prompt de sistema
    if (!pathology) {
      setHasSystemPrompt(false);
      setHasAttachments(false);
      return;
    }

    // Verificar se há um prompt de sistema para a patologia atual
    const systemPrompt = getPathologySystemPrompt(pathology);
    setHasSystemPrompt(!!systemPrompt && systemPrompt.trim() !== "");

    // Verificar se há anexos para a patologia atual
    const attachments = getPathologyAttachments(pathology);
    setHasAttachments(attachments && attachments.length > 0);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Determinar a cor do badge com base na API ativa
  const getBadgeVariant = () => {
    if (activeApi.includes("DeepSeek")) {
      return "amber";
    } else if (activeApi.includes("Gemini")) {
      return "blue";
    } else {
      return "destructive";
    }
  };

  return (
    <header className="flex h-14 items-center justify-between border-b px-4 md:px-6 bg-background">
      <div className="flex items-center">
        <Button
          onClick={toggleSidebar}
          variant="ghost"
          size="icon"
          className="md:hidden"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
        
        {hasAnyApiConfigured() && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="ml-2 flex items-center">
                  <Badge 
                    variant={getBadgeVariant() as any} 
                    className="ml-2 px-2 py-0 h-6 flex items-center gap-1"
                  >
                    {activeApi.includes("DeepSeek") && <Brain className="h-3 w-3" />}
                    <span className="text-xs font-medium">
                      {activeApi}
                    </span>
                  </Badge>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>API ativa para geração de respostas</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        {/* Indicador de prompt de sistema vazio */}
        {!hasSystemPrompt && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="ml-2">
                  <Badge 
                    variant="destructive" 
                    className="px-2 py-0 h-6 flex items-center gap-1"
                  >
                    <AlertTriangle className="h-3 w-3" />
                    <span className="text-xs font-medium">
                      Sem Prompt
                    </span>
                  </Badge>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Prompt do sistema não configurado para {currentPathology || "a patologia atual"}</p>
                <p className="text-xs mt-1">Configure o prompt na aba "Prompt do Sistema"</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        {/* Indicador de ausência de arquivos anexados */}
        {hasSystemPrompt && !hasAttachments && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="ml-2">
                  <Badge 
                    variant="warning" 
                    className="px-2 py-0 h-6 flex items-center gap-1 bg-yellow-500 hover:bg-yellow-600"
                  >
                    <FileX className="h-3 w-3" />
                    <span className="text-xs font-medium">
                      Sem Anexos
                    </span>
                  </Badge>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Nenhum arquivo anexado ao prompt do sistema para {currentPathology || "a patologia atual"}</p>
                <p className="text-xs mt-1">Adicione arquivos na aba "Prompt do Sistema"</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleDarkMode}
          title={darkMode ? "Modo claro" : "Modo escuro"}
        >
          {darkMode ? <SunMoon className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          title={hasAnyApiConfigured() ? "Configurações" : "Configurar API"}
          onClick={() => setApiKeyDialogOpen(true)}
          className="md:hidden"
        >
          <Settings className="h-5 w-5" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="hidden md:flex"
        >
          <Link to="/settings">
            <Settings className="h-4 w-4 mr-2" />
            Configurações do chat
          </Link>
        </Button>
      </div>
      
      <ApiKeyDialog
        open={apiKeyDialogOpen}
        onOpenChange={setApiKeyDialogOpen}
      />
    </header>
  );
};

export default ChatHeader;

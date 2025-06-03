import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { setApiKey, hasApiKey, hasApiKeyAsync } from "@/services/api";
import { 
  getStoredModelSettings, 
  saveModelSettings, 
  getStoredSystemPromptSettings, 
  saveSystemPromptSettings,
  getStoredPassword,
  setStoredPassword,
  validatePassword,
  getPathologySystemPrompt
} from "@/utils/settingsStorage";
import { useChatStore } from "@/store/chat-store"; 
import { updateChatSystemPrompt } from "@/utils/chatMessageUtils";
import { CHEST_PAIN_SYSTEM_PROMPT } from "@/store/chat/constants";
import { hasDeepSeekApiKeySync } from "@/services/deepseek";
import { saveApiKeyToFirestore, getApiKeyFromFirestore, checkFirestoreConnection } from "@/services/firestoreService";
import { toast as sonnerToast } from "sonner";

// Tipo para as APIs disponíveis
export type ApiProvider = "gemini" | "deepseek";

export function useSettings() {
  const { toast } = useToast();
  const [apiKey, setApiKeyState] = useState("");
  const [temperature, setTemperature] = useState(0.3);
  const [topP, setTopP] = useState(0.85);
  const [topK, setTopK] = useState(40);
  const [maxTokens, setMaxTokens] = useState(4096);
  const [isSaving, setIsSaving] = useState(false);
  const [advancedMode, setAdvancedMode] = useState(false);
  const [pathology, setPathology] = useState("");
  const [systemInstructions, setSystemInstructions] = useState("");
  const [preferredApiProvider, setPreferredApiProvider] = useState<ApiProvider>("gemini");
  const [showModelThinking, setShowModelThinking] = useState(true);
  const { chats, setChats } = useChatStore();
  
  // Password management states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  useEffect(() => {
    // Função para carregar as configurações
    const loadSettings = async () => {
      try {
        // Carregar a chave da API se disponível
        const apiKeyValue = await getApiKeyFromFirestore('gemini');
        if (apiKeyValue) {
          setApiKeyState(apiKeyValue);
        }
        
        // Carregar configurações do modelo
        const modelSettings = await getStoredModelSettings();
        setTemperature(modelSettings.temperature);
        setTopP(modelSettings.topP);
        setTopK(modelSettings.topK);
        setMaxTokens(modelSettings.maxTokens);
        setAdvancedMode(modelSettings.advancedMode);
        
        // Carregar o provedor de API preferido
        const configDoc = await getApiKeyFromFirestore('config');
        if (configDoc) {
          try {
            const config = JSON.parse(configDoc);
            if (config.preferredApiProvider) {
              setPreferredApiProvider(config.preferredApiProvider);
            } else {
              // Define a API padrão com base nas chaves disponíveis
              const hasDeepseekKey = await hasApiKeyAsync('deepseek');
              const hasGeminiKey = await hasApiKeyAsync('gemini');
              if (hasDeepseekKey) {
                setPreferredApiProvider("deepseek");
              } else if (hasGeminiKey) {
                setPreferredApiProvider("gemini");
              }
            }
            
            // Carregar configuração de exibição do pensamento do modelo
            if (config.showModelThinking !== undefined) {
              setShowModelThinking(config.showModelThinking);
            }
          } catch (error) {
            console.error("Erro ao analisar configurações:", error);
          }
        } else {
          // Define a API padrão com base nas chaves disponíveis
          const hasDeepseekKey = await hasApiKeyAsync('deepseek');
          const hasGeminiKey = await hasApiKeyAsync('gemini');
          if (hasDeepseekKey) {
            setPreferredApiProvider("deepseek");
          } 
          if (hasGeminiKey) {
            setPreferredApiProvider("gemini");
          }
        }
        
        // Carregar configurações do system prompt
        const promptSettings = await getStoredSystemPromptSettings();
        setPathology(promptSettings.pathology);
        
        // Se houver uma patologia selecionada, carregue o prompt específico do Firestore
        if (promptSettings.pathology) {
          console.log(`[useSettings] Loading system prompt for pathology: "${promptSettings.pathology}"`);
          const pathologyPrompt = await getPathologySystemPrompt(promptSettings.pathology);
          console.log(`[useSettings] Loaded system prompt from Firestore: ${pathologyPrompt ? 'Found' : 'Not found'}`);
          setSystemInstructions(pathologyPrompt || "");
        } else {
          // Se não houver patologia selecionada, use as instruções gerais
          setSystemInstructions(promptSettings.systemInstructions || "");
        }
      } catch (error) {
        console.error("Erro ao carregar configurações:", error);
      }
    };
    
    loadSettings();
  }, []);
  
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Salvar a chave da API
      setApiKey(apiKey);
      
      // Verificar conectividade com o Firestore
      const isFirestoreConnected = await checkFirestoreConnection();
      
      // Salvar provedor de API preferido e configuração de exibição do pensamento do modelo
      const configData = JSON.stringify({
        preferredApiProvider,
        showModelThinking
      });
      
      if (isFirestoreConnected) {
        await saveApiKeyToFirestore('config', configData);
      }
      
      // Salvar configurações do modelo
      saveModelSettings({
        temperature,
        topP,
        topK,
        maxTokens,
        advancedMode
      });
      
      // Salvar configurações do system prompt
      saveSystemPromptSettings({
        pathology,
        systemInstructions
      });
      
      // Atualizar o system prompt em todos os chats
      let systemPrompt = '';
      if (systemInstructions) {
        systemPrompt = systemInstructions;
      } else if (pathology === 'iamWithST' || pathology === 'iamWithoutST' || pathology === 'aorticSyndrome') {
        systemPrompt = CHEST_PAIN_SYSTEM_PROMPT;
      }
      
      if (systemPrompt && chats.length > 0) {
        const updatedChats = chats.map(chat => updateChatSystemPrompt(chat, systemPrompt));
        setChats(updatedChats);
      }
      
      // Exibir mensagem personalizada com base na conectividade
      if (isFirestoreConnected) {
        sonnerToast.success("Configurações salvas na nuvem", {
          description: "Suas configurações foram armazenadas no Firestore com sucesso."
        });
      } else {
        sonnerToast.error("Erro ao salvar configurações", {
          description: "Não foi possível conectar ao Firestore. Verifique sua conexão e tente novamente."
        });
      }
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      toast({
        title: "Erro ao salvar configurações",
        description: "Ocorreu um erro ao salvar suas configurações.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleReset = () => {
    setTemperature(0.3);
    setTopP(0.85);
    setTopK(40);
    setMaxTokens(4096);
    setAdvancedMode(false);
  };
  
  const handleChangePassword = () => {
    if (!validatePassword(currentPassword)) {
      toast({
        title: "Senha atual incorreta",
        description: "A senha atual informada não corresponde à senha armazenada.",
        variant: "destructive",
      });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Senhas não conferem",
        description: "A nova senha e a confirmação não são iguais.",
        variant: "destructive",
      });
      return;
    }
    
    if (newPassword.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A nova senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }
    
    setStoredPassword(newPassword);
    
    toast({
      title: "Senha alterada",
      description: "Sua senha de acesso às configurações foi alterada com sucesso.",
    });
    
    // Limpar campos
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return {
    // States
    apiKey,
    temperature,
    topP,
    topK,
    maxTokens,
    isSaving,
    advancedMode,
    pathology,
    systemInstructions,
    currentPassword,
    newPassword,
    confirmPassword,
    preferredApiProvider,
    showModelThinking,

    // Setters
    setApiKeyState,
    setTemperature,
    setTopP,
    setTopK,
    setMaxTokens,
    setAdvancedMode,
    setPathology(promptSettings.pathology || "defaultPathology");
    setSystemInstructions,
    setCurrentPassword,
    setNewPassword,
    setConfirmPassword,
    setPreferredApiProvider,
    setShowModelThinking,

    // Handlers
    handleSave,
    handleReset,
    handleChangePassword
  };
}

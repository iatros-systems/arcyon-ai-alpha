import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Chat from "./pages/Chat";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import { useEffect, useState } from "react";
import SettingsAuth from "./components/SettingsAuth";
import { SettingsProvider } from "./contexts/SettingsContext";
import "./styles/sidebar.css";
import "./styles/prescription.css";
import WorkspaceLayout from "./pages/workspace/WorkspaceLayout";
import WorkspaceHome from "./pages/workspace/WorkspaceHome";
import WorkspaceMembers from "./pages/workspace/WorkspaceMembers";
import WorkspaceBilling from "./pages/workspace/WorkspaceBilling";
import WorkspaceGpt from "./pages/workspace/WorkspaceGpt";
import { getApiKeyFromFirestore, checkFirestoreConnection } from "./services/firestoreService";
import { toast } from "sonner";
import { setApiKey } from "./services/api";
import { setDeepSeekApiKey } from "./services/deepseek";
import { setElevenlabsApiKey } from "./services/elevenlabs";

import FirestoreConnectionTest from "./FirestoreConnectionTest"; // ajuste o caminho se necessário

const queryClient = new QueryClient();

const App = () => {
  const [isSettingsAuthenticated, setIsSettingsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirestoreConnected, setIsFirestoreConnected] = useState(false);
  
  // Set document title
  useEffect(() => {
    document.title = "Arcyon - Assistente para Dor Torácica";
  }, []);

  <FirestoreConnectionTest />

  // Carregar chaves de API do Firestore
  useEffect(() => {
    const loadApiKeys = async () => {
      setIsLoading(true);
      try {
        // Verificar conectividade com o Firestore
        const connected = await checkFirestoreConnection();
        setIsFirestoreConnected(connected);
        
        if (connected) {
          // Carregar chaves de API
          const geminiKey = await getApiKeyFromFirestore('gemini');
          const deepseekKey = await getApiKeyFromFirestore('deepseek');
          const elevenlabsKey = await getApiKeyFromFirestore('elevenlabs');
          
          // Definir chaves de API em memória
          if (geminiKey) setApiKey(geminiKey);
          if (deepseekKey) setDeepSeekApiKey(deepseekKey);
          if (elevenlabsKey) setElevenlabsApiKey(elevenlabsKey);
          
          console.log('API keys loaded from Firestore');
        } else {
          toast.error("Não foi possível conectar ao Firestore", {
            description: "O aplicativo funcionará com funcionalidade limitada. Verifique sua conexão."
          });
        }
      } catch (error) {
        console.error('Error loading API keys:', error);
        toast.error("Erro ao carregar chaves de API", {
          description: "Ocorreu um erro ao carregar as chaves de API do Firestore."
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadApiKeys();
  }, []);

  // Função para autenticar acesso às configurações
  const handleAuthenticate = () => {
    setIsSettingsAuthenticated(true);
  };

  // Tempo de expiração da autenticação (30 minutos)
  useEffect(() => {
    if (isSettingsAuthenticated) {
      const timer = setTimeout(() => {
        setIsSettingsAuthenticated(false);
      }, 30 * 60 * 1000); // 30 minutos

      return () => clearTimeout(timer);
    }
  }, [isSettingsAuthenticated]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SettingsProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/workspace" element={<WorkspaceLayout />}>
                <Route index element={<WorkspaceHome />} />
                <Route path="members" element={<WorkspaceMembers />} />
                <Route path="billing" element={<WorkspaceBilling />} />
                <Route path="gpt" element={<WorkspaceGpt />} />
              </Route>
              <Route 
                path="/settings" 
                element={
                  isSettingsAuthenticated ? 
                  <Settings /> : 
                  <SettingsAuth onAuthenticate={handleAuthenticate} />
                } 
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </SettingsProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

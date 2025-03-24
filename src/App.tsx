
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Chat from "./pages/Chat";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import WorkspaceMembers from "./pages/WorkspaceMembers";
import { useEffect, useState } from "react";
import SettingsAuth from "./components/SettingsAuth";
import { SettingsProvider } from "./contexts/SettingsContext";
import "./styles/sidebar.css";
import "./styles/prescription.css";

const queryClient = new QueryClient();

const App = () => {
  const [isSettingsAuthenticated, setIsSettingsAuthenticated] = useState(false);
  
  // Set document title
  useEffect(() => {
    document.title = "Arcyon - Assistente para Dor Torácica";
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
              <Route path="/workspace/members" element={<WorkspaceMembers />} />
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

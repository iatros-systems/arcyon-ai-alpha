
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Chat from "./pages/Chat";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import { useEffect, useState } from "react";
import SettingsAuth from "./components/SettingsAuth";
import { SettingsProvider } from "./contexts/SettingsContext";

const queryClient = new QueryClient();

const App = () => {
  const [isSettingsAuthenticated, setIsSettingsAuthenticated] = useState(false);
  
  // Set document title
  useEffect(() => {
    document.title = "Arcyon - Assistente para Dor Torácica";
  }, []);

  // Add CSS for sidebar edit functionality and prescription table styling
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .sidebar-item {
        position: relative;
        display: flex;
        border-radius: 0.375rem;
      }
      
      .sidebar-item:hover, .sidebar-item.active {
        background-color: hsl(var(--muted) / 0.5);
      }
      
      .sidebar-item button {
        opacity: 0;
        transition: opacity 0.2s;
      }
      
      .sidebar-item:hover button, .sidebar-item:focus-within button {
        opacity: 1;
      }
      
      /* Estilos para tabelas de prescrição médica */
      .prescription-table {
        width: 100%;
        overflow-x: auto;
        margin: 1rem 0;
        border-radius: 0.375rem;
      }
      
      .prescription-table table {
        width: 100%;
        border-collapse: collapse;
        margin: 0;
        font-size: 0.875rem;
      }
      
      .prescription-table th {
        background-color: hsl(var(--muted) / 0.5);
        font-weight: 500;
        text-align: left;
        padding: 0.75rem 1rem;
        border: 1px solid hsl(var(--border));
      }
      
      .prescription-table td {
        padding: 0.75rem 1rem;
        border: 1px solid hsl(var(--border));
        vertical-align: top;
      }
      
      .prescription-table tr:nth-child(even) {
        background-color: hsl(var(--muted) / 0.2);
      }
      
      .prescription-content {
        width: 100%;
      }
      
      .prescription-content table {
        margin: 1rem 0;
      }
      
      /* Estilos responsivos para tabelas em telas pequenas */
      @media (max-width: 640px) {
        .prescription-table {
          overflow-x: auto;
        }
        
        .prescription-table th, 
        .prescription-table td {
          padding: 0.5rem;
          font-size: 0.75rem;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
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


import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Chat from "./pages/Chat";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";

const queryClient = new QueryClient();

const App = () => {
  // Set document title
  useEffect(() => {
    document.title = "IatrosGPT - Assistente para Dor Torácica";
  }, []);

  // Add CSS for sidebar edit functionality
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
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

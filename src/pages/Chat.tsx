
import { useState, useEffect } from "react";
import ChatHeader from "@/components/ChatHeader";
import Sidebar from "@/components/Sidebar";
import ChatMessages from "@/components/ChatMessages";
import ChatInput from "@/components/ChatInput";
import ApiKeyDialog from "@/components/ApiKeyDialog";
import { useChatStore } from "@/store/chat-store";
import { hasApiKey, sendMessageToGemini } from "@/services/api";
import { useToast } from "@/components/ui/use-toast";

const Chat = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);
  const { currentChat, addMessage, startNewChat } = useChatStore();
  const { toast } = useToast();

  // Check if API key is configured on initial load
  useEffect(() => {
    if (!hasApiKey()) {
      setApiKeyDialogOpen(true);
    }
  }, []);

  // Set up dark mode
  useEffect(() => {
    const isDark = localStorage.getItem("darkMode") === "true";
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    localStorage.setItem("darkMode", (!darkMode).toString());
    if (!darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Create first chat if none exists
  useEffect(() => {
    if (!currentChat) {
      startNewChat();
    }
  }, [currentChat, startNewChat]);

  const handleSendMessage = async (messageContent: string) => {
    if (!hasApiKey()) {
      setApiKeyDialogOpen(true);
      return;
    }

    // Add user message to chat
    addMessage(messageContent, "user");
    
    setLoading(true);
    
    try {
      // Prepare messages for API (excluding system messages)
      const messagesToSend = currentChat
        ? currentChat.messages
            .filter((m) => m.role !== "system")
            .map((m) => ({
              role: m.role,
              content: m.content,
            }))
        : [];
      
      // Add system message as the first message
      const systemMessage = currentChat?.messages.find(m => m.role === "system");
      if (systemMessage) {
        messagesToSend.unshift({
          role: systemMessage.role,
          content: systemMessage.content,
        });
      }
      
      // Add the new message
      messagesToSend.push({
        role: "user",
        content: messageContent,
      });
      
      // Send messages to API
      const response = await sendMessageToGemini(messagesToSend);
      
      // Add AI response to chat
      addMessage(response, "assistant");
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Erro ao enviar mensagem",
        description: "Verifique sua conexão e configuração da API.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      
      <ApiKeyDialog 
        open={apiKeyDialogOpen} 
        onOpenChange={setApiKeyDialogOpen} 
      />
      
      <div className="flex flex-col flex-1 h-full ml-0 md:ml-72">
        <ChatHeader 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen} 
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
        />
        
        <div className="flex flex-col flex-1 overflow-hidden">
          <ChatMessages 
            messages={currentChat?.messages.filter(m => m.role !== "system") || []}
            loading={loading} 
          />
          <ChatInput onSubmit={handleSendMessage} disabled={loading} />
        </div>
      </div>
    </div>
  );
};

export default Chat;

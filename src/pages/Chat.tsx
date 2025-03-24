
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const savedState = localStorage.getItem("sidebar-collapsed");
    return savedState ? savedState === "true" : false;
  });

  // Listen for sidebar state changes
  useEffect(() => {
    const handleSidebarStateChange = () => {
      const collapsed = localStorage.getItem("sidebar-collapsed") === "true";
      setSidebarCollapsed(collapsed);
    };

    // Listen for the custom event fired when sidebar state changes
    window.addEventListener("sidebar-state-changed", handleSidebarStateChange);
    
    // Also listen for storage events for cross-tab synchronization
    window.addEventListener("storage", handleSidebarStateChange);
    
    return () => {
      window.removeEventListener("sidebar-state-changed", handleSidebarStateChange);
      window.removeEventListener("storage", handleSidebarStateChange);
    };
  }, []);

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

  const handleSendMessage = async (messageContent: string, files?: File[]) => {
    if (!hasApiKey()) {
      setApiKeyDialogOpen(true);
      return;
    }

    let finalMessage = messageContent;
    
    // Handle files if present
    if (files && files.length > 0) {
      // Create a list of file names to append to the message
      const fileNames = files.map(file => file.name).join(", ");
      
      // If the user provided a message, append file info, otherwise just mention the files
      if (messageContent.trim()) {
        finalMessage = `${messageContent}\n\nArquivos anexados: ${fileNames}`;
      } else {
        finalMessage = `Arquivos anexados: ${fileNames}`;
      }
      
      // For each file, read its content and process it
      for (const file of files) {
        try {
          // Add the file info message to the chat
          addMessage(finalMessage, "user");
          
          // For images
          if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = async (e) => {
              const base64Data = e.target?.result as string;
              
              // Create a message with the image data for the AI to process
              const imageMessage = `[Imagem: ${file.name}]\n${base64Data}`;
              
              setLoading(true);
              
              try {
                // Send the image data to Gemini
                const systemMessage = currentChat?.messages.find(m => m.role === "system");
                const messagesToSend = [];
                
                if (systemMessage) {
                  messagesToSend.push({
                    role: systemMessage.role,
                    content: systemMessage.content,
                  });
                }
                
                messagesToSend.push({
                  role: "user",
                  content: imageMessage,
                });
                
                const response = await sendMessageToGemini(messagesToSend);
                addMessage(response, "assistant");
              } catch (error) {
                console.error("Error processing image:", error);
                toast({
                  title: "Erro ao processar imagem",
                  description: "Não foi possível analisar a imagem.",
                  variant: "destructive",
                });
              } finally {
                setLoading(false);
              }
            };
            reader.readAsDataURL(file);
            return; // Return early since we're handling images separately
          }
          
          // For PDFs
          if (file.type === 'application/pdf') {
            // Just notify that PDF was uploaded but can't process content at this time
            toast({
              title: "PDF recebido",
              description: "O PDF foi anexado, mas a extração do conteúdo não está disponível no momento.",
              variant: "default",
            });
          }
        } catch (error) {
          console.error("Error processing file:", error);
          toast({
            title: "Erro ao processar arquivo",
            description: "Não foi possível processar o arquivo.",
            variant: "destructive",
          });
        }
      }
      
      return; // Return early as we've already added the image processing
    }

    // Regular text message handling
    // Add user message to chat
    addMessage(finalMessage, "user");
    
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
        content: finalMessage,
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
      
      <div 
        className={`flex flex-col flex-1 h-full transition-all duration-300 ${
          sidebarCollapsed 
            ? 'md:ml-16' 
            : 'md:ml-72'
        }`}
      >
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

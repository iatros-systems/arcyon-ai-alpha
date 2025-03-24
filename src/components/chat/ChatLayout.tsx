
import Sidebar from "@/components/Sidebar";
import ChatHeader from "@/components/ChatHeader";
import ApiKeyDialog from "@/components/ApiKeyDialog";
import ChatContent from "@/components/chat/ChatContent";
import { cn } from "@/lib/utils";

interface ChatLayoutProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  sidebarCollapsed: boolean;
  darkMode: boolean;
  toggleDarkMode: () => void;
  apiKeyDialogOpen: boolean;
  setApiKeyDialogOpen: (open: boolean) => void;
}

const ChatLayout = ({
  sidebarOpen,
  setSidebarOpen,
  sidebarCollapsed,
  darkMode,
  toggleDarkMode,
  apiKeyDialogOpen,
  setApiKeyDialogOpen
}: ChatLayoutProps) => {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      
      <ApiKeyDialog 
        open={apiKeyDialogOpen} 
        onOpenChange={setApiKeyDialogOpen} 
      />
      
      <div 
        className={cn(
          "flex flex-col flex-1 h-full transition-all duration-300", 
          sidebarCollapsed 
            ? 'md:ml-16' 
            : 'md:ml-72'
        )}
      >
        <div className="sticky top-0 z-10 w-full">
          <ChatHeader 
            sidebarOpen={sidebarOpen} 
            setSidebarOpen={setSidebarOpen} 
            darkMode={darkMode}
            toggleDarkMode={toggleDarkMode}
          />
        </div>
        
        <ChatContent sidebarCollapsed={sidebarCollapsed} />
      </div>
    </div>
  );
};

export default ChatLayout;

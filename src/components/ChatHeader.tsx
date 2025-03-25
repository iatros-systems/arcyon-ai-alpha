
import { Button } from "@/components/ui/button";
import { Menu, X, SunMoon, Moon, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import ApiKeyDialog from "@/components/ApiKeyDialog";
import { useState } from "react";
import { hasApiKey } from "@/services/api";

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

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
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
          title={hasApiKey() ? "Configurações" : "Configurar API"}
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

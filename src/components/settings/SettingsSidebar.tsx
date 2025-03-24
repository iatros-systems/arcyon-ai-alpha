
import { Button } from "@/components/ui/button";
import { Settings, Bell, Paintbrush, Headphones, Database, User, Share2, ShieldCheck } from "lucide-react";

interface SettingsSidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const SettingsSidebar = ({ activeSection, setActiveSection }: SettingsSidebarProps) => {
  return (
    <div className="w-48 pr-4">
      <nav className="space-y-1">
        <Button 
          variant={activeSection === "general" ? "secondary" : "ghost"} 
          className="w-full justify-start"
          onClick={() => setActiveSection("general")}
        >
          <Settings className="mr-2 h-4 w-4" />
          Geral
        </Button>
        
        <Button 
          variant={activeSection === "notifications" ? "secondary" : "ghost"} 
          className="w-full justify-start"
          onClick={() => setActiveSection("notifications")}
        >
          <Bell className="mr-2 h-4 w-4" />
          Notificações
        </Button>
        
        <Button 
          variant={activeSection === "personalization" ? "secondary" : "ghost"} 
          className="w-full justify-start"
          onClick={() => setActiveSection("personalization")}
        >
          <Paintbrush className="mr-2 h-4 w-4" />
          Personalização
        </Button>
        
        <Button 
          variant={activeSection === "audio" ? "secondary" : "ghost"} 
          className="w-full justify-start"
          onClick={() => setActiveSection("audio")}
        >
          <Headphones className="mr-2 h-4 w-4" />
          Áudio
        </Button>
        
        <Button 
          variant={activeSection === "data" ? "secondary" : "ghost"} 
          className="w-full justify-start"
          onClick={() => setActiveSection("data")}
        >
          <Database className="mr-2 h-4 w-4" />
          Controles de dados
        </Button>
        
        <Button 
          variant={activeSection === "profile" ? "secondary" : "ghost"} 
          className="w-full justify-start"
          onClick={() => setActiveSection("profile")}
        >
          <User className="mr-2 h-4 w-4" />
          Perfil de construtor
        </Button>
        
        <Button 
          variant={activeSection === "apps" ? "secondary" : "ghost"} 
          className="w-full justify-start"
          onClick={() => setActiveSection("apps")}
        >
          <Share2 className="mr-2 h-4 w-4" />
          Aplicações conectadas
        </Button>
        
        <Button 
          variant={activeSection === "security" ? "secondary" : "ghost"} 
          className="w-full justify-start"
          onClick={() => setActiveSection("security")}
        >
          <ShieldCheck className="mr-2 h-4 w-4" />
          Segurança
        </Button>
      </nav>
    </div>
  );
};

export default SettingsSidebar;


import { useState, useEffect } from "react";
import { X, Settings, Bell, Paintbrush, Headphones, Database, User, Share2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SettingsDialog = ({ open, onOpenChange }: SettingsDialogProps) => {
  const [activeSection, setActiveSection] = useState("general");
  
  // Ensure the document body is reset when component unmounts
  useEffect(() => {
    return () => {
      document.body.style.pointerEvents = "auto";
      document.body.style.overflow = "auto";
    };
  }, []);

  // When dialog state changes, update body styles
  useEffect(() => {
    if (!open) {
      // Small delay to ensure animations complete
      const timeout = setTimeout(() => {
        document.body.style.pointerEvents = "auto";
        document.body.style.overflow = "auto";
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [open]);

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      document.body.style.pointerEvents = "auto";
      document.body.style.overflow = "auto";
    }, 100);
  };
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md md:max-w-lg lg:max-w-xl">
        <SheetHeader className="mb-4">
          <SheetTitle>Configurações</SheetTitle>
          <SheetClose 
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Fechar</span>
          </SheetClose>
        </SheetHeader>
        
        <div className="flex h-[calc(100vh-6rem)]">
          {/* Sidebar menu */}
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
          
          {/* Content area */}
          <div className="flex-1 border-l pl-6 overflow-y-auto">
            {activeSection === "general" && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium">Tema</h3>
                    <Select defaultValue="system">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Tema" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="system">Sistema</SelectItem>
                        <SelectItem value="light">Claro</SelectItem>
                        <SelectItem value="dark">Escuro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Mostrar sempre el código ao usar el análisis de datos</span>
                    <Switch />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Mostrar sugerências de seguimento en los chats</span>
                    <Switch />
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Idioma</span>
                    <Select defaultValue="auto">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Idioma" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Automático</SelectItem>
                        <SelectItem value="pt">Português</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Chats arquivados</span>
                    <Button variant="outline">Administrar</Button>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Arquivar todos los chats</span>
                    <Button variant="outline">Arquivar todo</Button>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Eliminar todos los chats</span>
                    <Button variant="destructive">Eliminar todo</Button>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-sm">Cerrar la sesión en este dispositivo</span>
                    <Button variant="outline">Cerrar sesión</Button>
                  </div>
                </div>
              </div>
            )}
            
            {activeSection !== "general" && (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Esta seção está em desenvolvimento</p>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SettingsDialog;

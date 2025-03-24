
import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";

import SettingsSidebar from "./SettingsSidebar";
import GeneralSettings from "./sections/GeneralSettings";
import SectionPlaceholder from "./sections/SectionPlaceholder";
import SecuritySettings from "./sections/SecuritySettings";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SettingsDialog = ({ open, onOpenChange }: SettingsDialogProps) => {
  const [activeSection, setActiveSection] = useState("general");
  
  // Gerencia os estilos do corpo da página quando o componente é montado/desmontado
  useEffect(() => {
    // Quando o componente é desmontado, garantimos que o body esteja com os estilos de navegação normalizados
    return () => {
      document.body.style.pointerEvents = "";
      document.body.style.overflow = "";
    };
  }, []);

  // Quando o estado do diálogo muda, atualizamos os estilos do body
  useEffect(() => {
    if (open) {
      // Não precisamos fazer nada especial quando o modal abre
    } else {
      // Quando fechamos, restauramos imediatamente os estilos do body
      document.body.style.pointerEvents = "";
      document.body.style.overflow = "";
    }
  }, [open]);
  
  const renderActiveSection = () => {
    switch (activeSection) {
      case "general":
        return <GeneralSettings />;
      case "security":
        return <SecuritySettings />;
      default:
        return <SectionPlaceholder />;
    }
  };
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md md:max-w-lg lg:max-w-xl">
        <SheetHeader className="mb-4">
          <SheetTitle>Configurações</SheetTitle>
          
        </SheetHeader>
        
        <div className="flex h-[calc(100vh-6rem)]">
          {/* Sidebar menu */}
          <SettingsSidebar 
            activeSection={activeSection} 
            setActiveSection={setActiveSection} 
          />
          
          {/* Content area */}
          <div className="flex-1 border-l pl-6 overflow-y-auto">
            {renderActiveSection()}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SettingsDialog;

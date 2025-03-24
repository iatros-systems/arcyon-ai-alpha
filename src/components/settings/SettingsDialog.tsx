
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

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
  
  // Cleanup function to ensure body styles are reset when component unmounts
  useEffect(() => {
    return () => {
      // Using removeProperty to ensure complete style removal
      document.body.style.removeProperty("pointerEvents");
      document.body.style.removeProperty("overflow");
    };
  }, []);

  // Additional effect to ensure styles are reset when dialog closes
  useEffect(() => {
    if (!open) {
      // Immediate cleanup when dialog closes
      document.body.style.removeProperty("pointerEvents");
      document.body.style.removeProperty("overflow");
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-xl">
        <DialogHeader className="mb-4">
          <DialogTitle>Configurações</DialogTitle>
          <DialogDescription className="sr-only">
            Configurações da aplicação
          </DialogDescription>
        </DialogHeader>
        
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
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;

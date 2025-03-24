
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

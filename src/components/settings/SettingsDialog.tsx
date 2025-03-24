
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
import AudioSettings from "./sections/AudioSettings";
import PersonalizationSettings from "./sections/PersonalizationSettings";
import NotificationsSettings from "./sections/NotificationsSettings";
import AppsSettings from "./sections/AppsSettings";
import DataSettings from "./sections/DataSettings";
import ProfileSettings from "./sections/ProfileSettings";
import InvitesSettings from "./sections/InvitesSettings";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SettingsDialog = ({ open, onOpenChange }: SettingsDialogProps) => {
  const [activeSection, setActiveSection] = useState("general");
  
  // Handle body style cleanup
  const resetBodyStyles = () => {
    // Force cleanup of all potentially problematic styles
    document.body.style.removeProperty("pointer-events");
    document.body.style.removeProperty("pointerEvents");
    document.body.style.removeProperty("overflow");
    document.body.style.position = "";
  };
  
  // Cleanup when component unmounts
  useEffect(() => {
    return resetBodyStyles;
  }, []);

  // Cleanup when dialog closes
  useEffect(() => {
    if (!open) {
      // Immediate cleanup
      resetBodyStyles();
      
      // Additional delayed cleanup to handle animation timing issues
      setTimeout(resetBodyStyles, 100);
      setTimeout(resetBodyStyles, 300);
    }
  }, [open]);

  const renderActiveSection = () => {
    switch (activeSection) {
      case "general":
        return <GeneralSettings />;
      case "security":
        return <SecuritySettings />;
      case "audio":
        return <AudioSettings />;
      case "personalization":
        return <PersonalizationSettings />;
      case "notifications":
        return <NotificationsSettings />;
      case "apps":
        return <AppsSettings />;
      case "data":
        return <DataSettings />;
      case "profile":
        return <ProfileSettings />;
      case "invites":
        return <InvitesSettings />;
      default:
        return <SectionPlaceholder />;
    }
  };
  
  // Custom handler to ensure cleanup when dialog closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetBodyStyles();
    }
    onOpenChange(newOpen);
  };
  
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md md:max-w-2xl lg:max-w-3xl">
        <DialogHeader className="mb-4">
          <DialogTitle>Configurações</DialogTitle>
          <DialogDescription className="sr-only">
            Configurações da aplicação
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex h-[calc(100vh-6rem)] max-h-[600px]">
          {/* Sidebar menu */}
          <SettingsSidebar 
            activeSection={activeSection} 
            setActiveSection={setActiveSection} 
          />
          
          {/* Content area */}
          <div className="flex-1 border-l pl-4 pr-2 overflow-y-auto">
            {renderActiveSection()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;

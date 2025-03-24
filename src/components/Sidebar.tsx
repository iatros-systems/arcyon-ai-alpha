
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/store/chat-store";

// Import the new components with updated paths
import SidebarHeader from "./sidebar/header/SidebarHeader";
import NewChatButton from "./sidebar/actions/NewChatButton";
import SidebarTabs from "./sidebar/navigation/SidebarTabs";
import ChatList from "./sidebar/content/ChatList";
import PatientList from "./sidebar/content/PatientList";
import UserProfile from "./sidebar/footer/UserProfile";

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const Sidebar = ({ open, setOpen }: SidebarProps) => {
  const { startNewChat } = useChatStore();
  const [activeSection, setActiveSection] = useState("chats");
  const [collapsed, setCollapsed] = useState(() => {
    // Initialize from localStorage if available
    const savedState = localStorage.getItem("sidebar-collapsed");
    return savedState ? savedState === "true" : false;
  });

  // Save collapsed state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", String(collapsed));
    // Make the storage event fire for other tabs
    window.dispatchEvent(new Event("storage"));
  }, [collapsed]);

  // Toggle sidebar collapsed state
  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div className="relative flex h-full">
      {/* Full sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-full flex-col border-r bg-background transition-all duration-300 ease-in-out md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
          collapsed ? "w-16" : "w-72"
        )}
      >
        <SidebarHeader collapsed={collapsed} toggleCollapsed={toggleCollapsed} />
        <NewChatButton onClick={startNewChat} collapsed={collapsed} />

        <div className="flex-1 overflow-auto">
          <SidebarTabs 
            activeSection={activeSection} 
            setActiveSection={setActiveSection} 
            collapsed={collapsed} 
          />
          
          {activeSection === "chats" && <ChatList collapsed={collapsed} />}
          {activeSection === "patients" && <PatientList collapsed={collapsed} />}
        </div>

        <UserProfile collapsed={collapsed} />
      </div>
    </div>
  );
};

export default Sidebar;

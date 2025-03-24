
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/store/chat-store";
import { useSidebarState } from "@/hooks/useSidebarState";
import { useChatEdit } from "@/hooks/useChatEdit";
import SidebarHeader from "./sidebar/SidebarHeader";
import SidebarNewChat from "./sidebar/SidebarNewChat";
import SidebarNavigation from "./sidebar/SidebarNavigation";
import ChatsSection from "./sidebar/ChatsSection";
import PatientsSection from "./sidebar/PatientsSection";
import SidebarFooter from "./sidebar/SidebarFooter";

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const Sidebar = ({ open, setOpen }: SidebarProps) => {
  const { chats, startNewChat, setCurrentChat, updateChatTitle } = useChatStore();
  const [activeSection, setActiveSection] = useState("chats");
  const { collapsed, toggleCollapsed } = useSidebarState();
  const {
    editingChatId,
    editTitle,
    setEditTitle,
    startEditing,
    saveTitle,
    handleKeyDown
  } = useChatEdit({ updateChatTitle });

  // Close sidebar on mobile when chat is selected
  const handleChatSelect = (chatId: string) => {
    setCurrentChat(chatId);
    if (window.innerWidth < 768) {
      setOpen(false);
    }
  };

  // Group chats by date
  const groupedChats = chats.reduce((acc: Record<string, typeof chats>, chat) => {
    const date = new Date(chat.createdAt).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(chat);
    return acc;
  }, {});

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
        <SidebarHeader 
          collapsed={collapsed} 
          toggleCollapsed={toggleCollapsed} 
        />
        
        <SidebarNewChat 
          collapsed={collapsed} 
          onNewChat={startNewChat} 
        />

        <SidebarNavigation 
          activeSection={activeSection} 
          collapsed={collapsed} 
          setActiveSection={setActiveSection} 
        />

        <div className="flex-1 overflow-auto">
          {activeSection === "chats" && (
            <ChatsSection
              groupedChats={groupedChats}
              collapsed={collapsed}
              editingChatId={editingChatId}
              editTitle={editTitle}
              setEditTitle={setEditTitle}
              startEditing={startEditing}
              saveTitle={saveTitle}
              handleKeyDown={handleKeyDown}
              onChatSelect={handleChatSelect}
            />
          )}

          {activeSection === "patients" && (
            <PatientsSection collapsed={collapsed} />
          )}
        </div>

        <SidebarFooter collapsed={collapsed} />
      </div>
    </div>
  );
};

export default Sidebar;


import { useState } from "react";
import { MessageSquarePlus, Folder, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Project } from "@/store/project-store";
import { Button } from "@/components/ui/button";
import { Chat } from "@/types";
import ChatItem from "./ChatItem";

interface ProjectItemProps {
  project: Project;
  collapsed: boolean;
  isActive?: boolean;
  onSelect: (projectId: string) => void;
  onNewChat: (projectId: string) => void;
  projectChats: Chat[];
  editingChatId: string | null;
  editTitle: string;
  setEditTitle: (title: string) => void;
  startEditing: (chatId: string, currentTitle: string) => void;
  saveTitle: () => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  onChatSelect: (chatId: string) => void;
  onTogglePin: (chatId: string) => void;
}

const ProjectItem = ({ 
  project, 
  collapsed, 
  isActive = false,
  onSelect, 
  onNewChat,
  projectChats,
  editingChatId,
  editTitle,
  setEditTitle,
  startEditing,
  saveTitle,
  handleKeyDown,
  onChatSelect,
  onTogglePin
}: ProjectItemProps) => {
  const [expanded, setExpanded] = useState(isActive);
  
  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
    if (!expanded) {
      onSelect(project.id);
    }
  };

  return (
    <div className="sidebar-item group relative space-y-1">
      <div className="flex items-center">
        <Button
          variant={isActive ? "secondary" : "ghost"}
          className={cn(
            "w-full justify-start",
            collapsed ? "justify-center p-2" : "text-left pr-8"
          )}
          onClick={() => {
            onSelect(project.id);
            if (!collapsed) setExpanded(true);
          }}
        >
          {!collapsed && projectChats.length > 0 && (
            <button 
              className="mr-1 p-1 hover:bg-accent rounded-sm" 
              onClick={toggleExpand}
            >
              {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </button>
          )}
          <Folder className={cn("mr-2 h-4 w-4 shrink-0", isActive && "text-primary")} />
          {!collapsed && (
            <span className="truncate">{project.name}</span>
          )}
        </Button>
        
        {!collapsed && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 absolute right-1 top-1/2 transform -translate-y-1/2 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onNewChat(project.id);
              setExpanded(true);
            }}
            title="Nova conversa no projeto"
          >
            <MessageSquarePlus className="h-4 w-4" />
          </Button>
        )}
      </div>

      {!collapsed && expanded && projectChats.length > 0 && (
        <div className="pl-6 space-y-1">
          {projectChats.map((chat) => (
            <ChatItem
              key={chat.id}
              chat={chat}
              collapsed={collapsed}
              editingChatId={editingChatId}
              editTitle={editTitle}
              setEditTitle={setEditTitle}
              startEditing={startEditing}
              saveTitle={saveTitle}
              handleKeyDown={handleKeyDown}
              onChatSelect={onChatSelect}
              onTogglePin={onTogglePin}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectItem;

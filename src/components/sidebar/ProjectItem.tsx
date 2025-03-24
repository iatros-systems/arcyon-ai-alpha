
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
    <div className="relative mb-2">
      {/* Project Header */}
      <div 
        className={cn(
          "flex items-center p-2 rounded-md hover:bg-accent cursor-pointer",
          isActive && "bg-accent/50"
        )}
        onClick={() => {
          onSelect(project.id);
          if (!collapsed) setExpanded(!expanded);
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
        <Folder className={cn("h-4 w-4 shrink-0", isActive && "text-primary")} />
        {!collapsed && (
          <span className="truncate ml-2 flex-1 text-sm font-medium">{project.name}</span>
        )}
        
        {!collapsed && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:opacity-100 ml-auto"
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

      {/* Project Chats List */}
      {!collapsed && expanded && projectChats.length > 0 && (
        <div className="project-chat-list">
          {projectChats.map((chat) => (
            <div key={chat.id} className="project-chat-item">
              <ChatItem
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectItem;

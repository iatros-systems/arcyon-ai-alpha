
import { MessageSquarePlus, Folder } from "lucide-react";
import { cn } from "@/lib/utils";
import { Project } from "@/store/project-store";
import { Button } from "@/components/ui/button";

interface ProjectItemProps {
  project: Project;
  collapsed: boolean;
  isActive?: boolean;
  onSelect: (projectId: string) => void;
  onNewChat: (projectId: string) => void;
}

const ProjectItem = ({ 
  project, 
  collapsed, 
  isActive = false,
  onSelect, 
  onNewChat 
}: ProjectItemProps) => {
  return (
    <div className="sidebar-item group relative">
      <Button
        variant={isActive ? "secondary" : "ghost"}
        className={cn(
          "w-full justify-start",
          collapsed ? "justify-center p-2" : "text-left pr-8"
        )}
        onClick={() => onSelect(project.id)}
      >
        <Folder className={cn("mr-2 h-4 w-4 shrink-0", isActive && "text-primary")} />
        {!collapsed && (
          <span className="truncate">{project.name}</span>
        )}
      </Button>
      
      {!collapsed && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 absolute right-1 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            onNewChat(project.id);
          }}
          title="Nova conversa no projeto"
        >
          <MessageSquarePlus className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default ProjectItem;

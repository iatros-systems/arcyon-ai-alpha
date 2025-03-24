
import { MessageSquarePlus, Folder } from "lucide-react";
import { cn } from "@/lib/utils";
import { Project } from "@/store/project-store";
import { Button } from "@/components/ui/button";

interface ProjectItemProps {
  project: Project;
  collapsed: boolean;
  onSelect: (projectId: string) => void;
  onNewChat: (projectId: string) => void;
}

const ProjectItem = ({ project, collapsed, onSelect, onNewChat }: ProjectItemProps) => {
  return (
    <div className="sidebar-item group">
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start",
          collapsed && "justify-center p-2"
        )}
        onClick={() => onSelect(project.id)}
      >
        <Folder className="mr-2 h-4 w-4" />
        {!collapsed && (
          <span className="truncate">{project.name}</span>
        )}
      </Button>
      
      {!collapsed && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 absolute right-1 opacity-0 group-hover:opacity-100"
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

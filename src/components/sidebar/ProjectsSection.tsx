
import { useState } from "react";
import { Plus, Folder } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useProjectStore } from "@/store/project-store";
import { useChatStore } from "@/store/chat-store";
import CreateProjectDialog from "@/components/projects/CreateProjectDialog";
import ProjectItem from "./ProjectItem";

interface ProjectsSectionProps {
  collapsed: boolean;
}

const ProjectsSection = ({ collapsed }: ProjectsSectionProps) => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { projects, setCurrentProject } = useProjectStore();
  const { startNewChat } = useChatStore();

  const handleProjectSelect = (projectId: string) => {
    setCurrentProject(projectId);
  };

  const handleNewChat = (projectId: string) => {
    startNewChat(projectId);
  };

  return (
    <>
      <ScrollArea className="h-[calc(100vh-160px)]">
        <div className="px-2 py-2">
          {/* Novo Projeto Button */}
          <Button
            variant="outline"
            className="w-full mb-2 justify-start"
            onClick={() => setCreateDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            {!collapsed && "Novo Proyecto"}
          </Button>
          
          {/* Lista de Projetos */}
          {projects.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground text-sm">
              {!collapsed && "Nenhum projeto criado"}
            </div>
          ) : (
            <div className="space-y-1">
              {projects.map((project) => (
                <ProjectItem
                  key={project.id}
                  project={project}
                  collapsed={collapsed}
                  onSelect={handleProjectSelect}
                  onNewChat={handleNewChat}
                />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
      
      <CreateProjectDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </>
  );
};

export default ProjectsSection;

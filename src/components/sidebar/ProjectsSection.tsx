
import { useState, useEffect } from "react";
import { Plus, Folder } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useProjectStore } from "@/store/project-store";
import { useChatStore } from "@/store/chat-store";
import { useChatEdit } from "@/hooks/useChatEdit";
import CreateProjectDialog from "@/components/projects/CreateProjectDialog";
import ProjectItem from "./ProjectItem";
import { toast } from "sonner";

interface ProjectsSectionProps {
  collapsed: boolean;
}

const ProjectsSection = ({ collapsed }: ProjectsSectionProps) => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { projects, setCurrentProject, currentProject } = useProjectStore();
  const { startNewChat, chats, setCurrentChat, toggleChatPin, updateChatTitle } = useChatStore();
  const {
    editingChatId,
    editTitle,
    setEditTitle,
    startEditing,
    saveTitle,
    handleKeyDown
  } = useChatEdit({ updateChatTitle });

  const handleProjectSelect = (projectId: string) => {
    setCurrentProject(projectId);
  };

  const handleNewChat = (projectId: string) => {
    startNewChat(projectId);
  };

  const handleChatSelect = (chatId: string) => {
    setCurrentChat(chatId);
    // Close sidebar on mobile when chat is selected
    if (window.innerWidth < 768) {
      // This assumes there's a setOpen function in the parent component
      // If not, you may need to add this functionality
    }
  };

  // Get chats for each project
  const getProjectChats = (projectId: string) => {
    return chats.filter(chat => chat.projectId === projectId);
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
            {!collapsed && "Novo Projeto"}
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
                  isActive={currentProject?.id === project.id}
                  projectChats={getProjectChats(project.id)}
                  editingChatId={editingChatId}
                  editTitle={editTitle}
                  setEditTitle={setEditTitle}
                  startEditing={startEditing}
                  saveTitle={saveTitle}
                  handleKeyDown={handleKeyDown}
                  onChatSelect={handleChatSelect}
                  onTogglePin={toggleChatPin}
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

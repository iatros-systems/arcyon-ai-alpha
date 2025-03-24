
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProjectStore } from "@/store/project-store";
import { useChatStore } from "@/store/chat-store";
import { toast } from "sonner";

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateProjectDialog = ({ open, onOpenChange }: CreateProjectDialogProps) => {
  const [projectName, setProjectName] = useState("");
  const { createProject } = useProjectStore();
  const { startNewChat } = useChatStore();

  const handleCreateProject = () => {
    if (!projectName.trim()) return;
    
    try {
      // Criar o projeto
      const newProject = createProject(projectName.trim());
      console.log("Projeto criado via dialog:", newProject);
      
      // Criar um chat inicial para o projeto
      startNewChat(newProject.id);
      
      // Notificar o usuário
      toast.success("Projeto criado com sucesso");
      
      // Limpar o campo e fechar o diálogo
      setProjectName("");
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao criar projeto:", error);
      toast.error("Erro ao criar projeto");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && projectName.trim()) {
      handleCreateProject();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <div className="flex items-center justify-between">
          <DialogTitle>Nome do projeto</DialogTitle>
          {/* Removed the custom close button since Dialog already provides one */}
        </div>
        
        <DialogDescription>
          Crie um novo projeto para organizar suas conversas e arquivos.
        </DialogDescription>
        
        <div className="space-y-4 py-4">
          <Input 
            placeholder="Por exemplo, planificação de uma festa de aniversário" 
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full"
            autoFocus
          />
          
          <div className="flex items-start space-x-2 bg-muted/50 p-3 rounded-md">
            <div className="mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-lightbulb">
                <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/>
                <path d="M9 18h6"/>
                <path d="M10 22h4"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium">O que é um projeto?</p>
              <p className="text-xs text-muted-foreground mt-1">
                Os projetos guardam chats, arquivos e instruções personalizadas em 
                um só lugar. Use-os para o trabalho em curso ou para manter tudo 
                organizado.
              </p>
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex justify-between sm:justify-between">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleCreateProject}
            disabled={!projectName.trim()}
            className="bg-gray-500 hover:bg-gray-600"
          >
            Criar projeto
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectDialog;

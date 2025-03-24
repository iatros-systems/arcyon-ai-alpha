
import { useState } from "react";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProjectStore } from "@/store/project-store";
import { useChatStore } from "@/store/chat-store";

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
    
    // Criar o projeto
    const newProject = createProject(projectName.trim());
    
    // Criar um chat inicial para o projeto
    startNewChat(newProject.id);
    
    // Limpar o campo e fechar o diálogo
    setProjectName("");
    onOpenChange(false);
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
          <DialogTitle>Nombre del proyecto</DialogTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onOpenChange(false)}
            className="h-6 w-6"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-4 py-4">
          <Input 
            placeholder="Por ejemplo, planificación de una fiesta de cumpleaños" 
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full"
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
              <p className="text-sm font-medium">¿Qué es un proyecto?</p>
              <p className="text-xs text-muted-foreground mt-1">
                Los proyectos guardan chats, archivos e instrucciones personalizadas en 
                un solo lugar. Úsalos para el trabajo en curso o para mantener todo 
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
            Crear proyecto
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectDialog;

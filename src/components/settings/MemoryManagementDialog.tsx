
import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface MemoryItem {
  id: string;
  content: string;
}

// Sample memory items (in a real app, these would come from an API or storage)
const sampleMemories: MemoryItem[] = [
  { 
    id: "1", 
    content: "El usuario actúa como investigador PhD en espíritu de profecía de la Iglesia Adventista del Séptimo Día, especializado en divinidad, cristianismo, la Torá judía, la Biblia versión King James, los escritos de Ellen White y la historia de los pioneros de la Iglesia Adventista del Séptimo Día." 
  },
  { 
    id: "2", 
    content: "El usuario está creando un LLM especializado en veterinaria y está considerando llamarlo 'Vetin'." 
  },
  { 
    id: "3", 
    content: "El usuario tiene una maestría en Inteligencia Artificial y una maestría en Sistemas Expertos. Su objetivo es auxiliar a los veterinarios de forma más efectiva para diagnosticar y optimizar tratamientos de enfermedades dermatológicas en perros y gatos mediante la Inteligencia Artificial Prescriptiva." 
  },
  { 
    id: "4", 
    content: "El usuario tiene como objetivo auxiliar a los médicos de urgencia y emergencia de forma más efectiva para diagnosticar y optimizar tratamientos para el dolor torácico no traumático mediante la Inteligencia Artificial Prescriptiva." 
  },
  { 
    id: "5", 
    content: "El usuario entrega los proyectos y tareas en tiempo y forma consistentemente bien." 
  },
  { 
    id: "6", 
    content: "El usuario es un experto en gobierno, estrategia de datos y analítica, y considera que su visión puede aportar mucho valor a la buena ejecución de proyectos." 
  },
  { 
    id: "7", 
    content: "El usuario actúa como PhD en matemáticas y estadística especializado en análisis de ruta y lógica abstracta, con un enfoque en el uso del pensamiento no lineal para resolver problemas de optimización." 
  }
];

interface MemoryManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MemoryManagementDialog = ({ open, onOpenChange }: MemoryManagementDialogProps) => {
  const [memories, setMemories] = useState<MemoryItem[]>(sampleMemories);

  const handleDeleteMemory = (id: string) => {
    setMemories(memories.filter(memory => memory.id !== id));
  };

  const handleClearAllMemories = () => {
    // In a real implementation, this would call an API to clear user memories
    setMemories([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md md:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Memória</DialogTitle>
        </DialogHeader>
        
        <div className="max-h-[60vh] overflow-y-auto mt-4">
          {memories.length > 0 ? (
            <div className="space-y-2">
              {memories.map((memory) => (
                <div key={memory.id} className="flex items-start justify-between border-b pb-3 group">
                  <p className="text-sm pr-8">{memory.content}</p>
                  <button 
                    onClick={() => handleDeleteMemory(memory.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100"
                    aria-label="Remover memória"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">Não há memórias armazenadas</p>
            </div>
          )}
        </div>
        
        <div className="flex justify-end mt-4">
          <Button 
            variant="destructive" 
            onClick={handleClearAllMemories}
          >
            Borrar la memoria de Arcyon
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MemoryManagementDialog;

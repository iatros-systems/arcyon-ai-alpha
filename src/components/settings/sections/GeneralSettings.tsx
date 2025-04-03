
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const GeneralSettings = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium">Tema</h3>
          <Select defaultValue="system">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tema" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="system">Sistema</SelectItem>
              <SelectItem value="light">Claro</SelectItem>
              <SelectItem value="dark">Escuro</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm">Mostrar sempre el código ao usar el análisis de datos</span>
          <Switch />
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm">Mostrar sugerências de seguimento en los chats</span>
          <Switch />
        </div>
      </div>
      
      <Separator />
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm">Idioma</span>
          <Select defaultValue="auto">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Idioma" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Automático</SelectItem>
              <SelectItem value="pt">Português</SelectItem>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Español</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Separator />
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm">Chats arquivados</span>
          <Button variant="outline">Administrar</Button>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm">Arquivar todos los chats</span>
          <Button variant="outline">Arquivar todo</Button>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm">Eliminar todos los chats</span>
          <Button variant="destructive">Eliminar todo</Button>
        </div>
        
        <div className="flex justify-between items-center pt-2">
          <span className="text-sm">Cerrar la sesión en este dispositivo</span>
          <Button variant="outline">Cerrar sesión</Button>
        </div>
      </div>
    </div>
  );
};

export default GeneralSettings;

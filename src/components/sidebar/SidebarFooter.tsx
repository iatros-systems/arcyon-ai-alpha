
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings, Users, List, Palette } from "lucide-react";

interface SidebarFooterProps {
  collapsed: boolean;
}

const SidebarFooter = ({ collapsed }: SidebarFooterProps) => {
  return (
    <div className={cn("border-t p-4", collapsed && "p-2")}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="h-9 w-9 rounded-full bg-iatros-blue flex items-center justify-center text-white">
              RF
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Dr. Romulo Farias</p>
                <p className="text-xs text-muted-foreground truncate">Emergência</p>
              </div>
            )}
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" alignOffset={-20}>
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <Users className="mr-2 h-4 w-4" />
              <span>Administrar espacio de trabajo</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <List className="mr-2 h-4 w-4" />
              <span>Tareas</span>
              <span className="ml-auto text-xs bg-muted px-1.5 py-0.5 rounded-sm">BETA</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Users className="mr-2 h-4 w-4" />
              <span>Mis GPT</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Palette className="mr-2 h-4 w-4" />
              <span>Personalizar ChatGPT</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Configuración</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Cerrar sesión</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default SidebarFooter;

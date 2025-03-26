import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarHeaderProps {
  collapsed: boolean;
  toggleCollapsed: () => void;
}

const SidebarHeader = ({ collapsed, toggleCollapsed }: SidebarHeaderProps) => {
  return (
    <div className="relative">
      {/* Collapse toggle button */}
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute right-2 top-7 z-50 h-6 w-6 rounded-full border bg-background shadow-md"
        onClick={toggleCollapsed}
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </Button>

      <div className="flex h-16 items-center border-b px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md flex items-center justify-center overflow-hidden">
            {/* Usando uma imagem padrão do diretório public */}
            <img 
              src="/logo.svg" 
              alt="ArcyconAI Logo" 
              className="w-full h-full object-cover"
            />
          </div>
          {!collapsed && <h1 className="text-xl font-semibold">ArcyconAI</h1>}
        </div>
      </div>
    </div>
  );
};

export default SidebarHeader;

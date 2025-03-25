
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
        className="absolute right-2 top-2 z-50 h-6 w-6 rounded-full border bg-background shadow-md"
        onClick={toggleCollapsed}
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </Button>

      <div className="flex h-14 items-center border-b px-4 pt-2">
        <div className="flex items-center gap-2 mt-4">
          <div className="h-8 w-8 rounded-md flex items-center justify-center">
            <img 
              src="/lovable-uploads/9c6a7a02-a819-4f62-bfda-f4c27c57306f.png" 
              alt="Arcyon Logo" 
              className="h-8 w-8" 
            />
          </div>
          {!collapsed && <h1 className="text-xl font-semibold text-[#6366f1]">Arcyon</h1>}
        </div>
      </div>
    </div>
  );
};

export default SidebarHeader;

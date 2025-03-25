
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
          <div className="h-8 w-8 bg-iatros-blue rounded-md flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
          </div>
          {!collapsed && <h1 className="text-xl font-semibold">Arcyon</h1>}
        </div>
      </div>
    </div>
  );
};

export default SidebarHeader;

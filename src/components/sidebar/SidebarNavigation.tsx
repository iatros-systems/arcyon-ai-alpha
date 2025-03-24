
import { Button } from "@/components/ui/button";
import { MessageSquare, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarNavigationProps {
  activeSection: string;
  collapsed: boolean;
  setActiveSection: (section: string) => void;
}

const SidebarNavigation = ({ activeSection, collapsed, setActiveSection }: SidebarNavigationProps) => {
  return (
    <div className="flex border-b sticky top-0 z-10 bg-background">
      <Button
        variant="ghost"
        className={cn(
          "flex-1 justify-center rounded-none border-b-2 border-transparent",
          activeSection === "chats" && "border-primary",
          collapsed && "p-0"
        )}
        onClick={() => setActiveSection("chats")}
      >
        <MessageSquare className="mr-2 h-4 w-4" />
        {!collapsed && "Chats"}
      </Button>
      <Button
        variant="ghost"
        className={cn(
          "flex-1 justify-center rounded-none border-b-2 border-transparent",
          activeSection === "projects" && "border-primary",
          collapsed && "p-0"
        )}
        onClick={() => setActiveSection("projects")}
      >
        <FolderOpen className="mr-2 h-4 w-4" />
        {!collapsed && "Proyectos"}
      </Button>
    </div>
  );
};

export default SidebarNavigation;

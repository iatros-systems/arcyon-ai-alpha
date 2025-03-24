
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarNewChatProps {
  collapsed: boolean;
  onNewChat: () => void;
}

const SidebarNewChat = ({ collapsed, onNewChat }: SidebarNewChatProps) => {
  return (
    <div className={cn("p-4", collapsed && "p-2")}>
      <Button 
        onClick={onNewChat} 
        className={cn("w-full justify-start gap-2", collapsed && "justify-center px-0")}
      >
        <Plus className="h-4 w-4" />
        {!collapsed && <span>Nova conversa</span>}
      </Button>
    </div>
  );
};

export default SidebarNewChat;

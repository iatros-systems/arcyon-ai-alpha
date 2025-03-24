
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface NewChatButtonProps {
  onClick: () => void;
  collapsed: boolean;
}

const NewChatButton = ({ onClick, collapsed }: NewChatButtonProps) => {
  return (
    <div className={cn("p-4", collapsed && "p-2")}>
      <Button onClick={onClick} className={cn("w-full justify-start gap-2", collapsed && "justify-center px-0")}>
        <Plus className="h-4 w-4" />
        {!collapsed && <span>Nova conversa</span>}
      </Button>
    </div>
  );
};

export default NewChatButton;

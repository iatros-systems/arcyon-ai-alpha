
import { MessageSquare, Stethoscope, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Chat } from "@/types";

interface ChatItemProps {
  chat: Chat;
  collapsed: boolean;
  editingChatId: string | null;
  editTitle: string;
  setEditTitle: (title: string) => void;
  startEditing: (chatId: string, currentTitle: string) => void;
  saveTitle: () => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  onChatSelect: (chatId: string) => void;
}

const ChatItem = ({
  chat,
  collapsed,
  editingChatId,
  editTitle,
  setEditTitle,
  startEditing,
  saveTitle,
  handleKeyDown,
  onChatSelect
}: ChatItemProps) => {
  return (
    <div
      key={chat.id}
      className={cn(
        "sidebar-item p-2 cursor-pointer",
        chat.isCurrent && "active"
      )}
    >
      {editingChatId === chat.id && !collapsed ? (
        <div className="flex items-center gap-2">
          <Input
            autoFocus
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={saveTitle}
            className="h-7 text-sm"
          />
        </div>
      ) : (
        <div className="flex items-center gap-2" onClick={() => onChatSelect(chat.id)}>
          {chat.type === "chest-pain" ? (
            <Stethoscope className="h-4 w-4 text-iatros-blue" />
          ) : (
            <MessageSquare className="h-4 w-4" />
          )}
          {!collapsed && (
            <>
              <span className="text-sm truncate flex-1">{chat.title}</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100" 
                onClick={(e) => {
                  e.stopPropagation();
                  startEditing(chat.id, chat.title);
                }}
              >
                <PenLine className="h-3 w-3" />
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatItem;

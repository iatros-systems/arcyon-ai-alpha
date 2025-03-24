
import { MessageSquare, PenLine, Pin, Trash2 } from "lucide-react";
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
  onTogglePin: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
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
  onChatSelect,
  onTogglePin,
  onDeleteChat
}: ChatItemProps) => {
  return (
    <div
      key={chat.id}
      className={cn(
        "sidebar-item flex items-center p-2 rounded-md cursor-pointer group",
        chat.isCurrent && "bg-accent/50 active",
        chat.pinned && "border-l-2 border-primary pl-1"
      )}
      onClick={() => onChatSelect(chat.id)}
    >
      <MessageSquare className="h-3.5 w-3.5 flex-shrink-0" />
      
      {editingChatId === chat.id && !collapsed ? (
        <Input
          autoFocus
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={saveTitle}
          className="h-7 text-sm ml-1.5"
        />
      ) : (
        <>
          {!collapsed && (
            <span className="text-sm truncate flex-1 ml-1.5">{chat.title}</span>
          )}
          
          {!collapsed && (
            <div className="flex ml-1 opacity-0 group-hover:opacity-100">
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn(
                  "h-5 w-5",
                  chat.pinned && "text-primary opacity-100"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  onTogglePin(chat.id);
                }}
              >
                <Pin className="h-3 w-3" fill={chat.pinned ? "currentColor" : "none"} />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-5 w-5" 
                onClick={(e) => {
                  e.stopPropagation();
                  startEditing(chat.id, chat.title);
                }}
              >
                <PenLine className="h-3 w-3" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-5 w-5 text-destructive hover:text-destructive" 
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteChat(chat.id);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ChatItem;

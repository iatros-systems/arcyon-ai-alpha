
import { EllipsisVertical, MessageSquare, PenLine, Pin, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Chat } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
        "sidebar-item flex items-center p-2 rounded-md cursor-pointer",
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
            <span className="text-sm truncate flex-1 ml-1.5 text-left">{chat.title}</span>
          )}
          
          {!collapsed && (
            <div className="ml-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-5 w-5" 
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <EllipsisVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                
                <DropdownMenuContent align="end" className="w-40 bg-popover">
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      onTogglePin(chat.id);
                    }}
                  >
                    <Pin className="mr-2 h-4 w-4" fill={chat.pinned ? "currentColor" : "none"} />
                    {chat.pinned ? "Desafixar" : "Fixar"}
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditing(chat.id, chat.title);
                    }}
                  >
                    <PenLine className="mr-2 h-4 w-4" />
                    Renomear
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    className="text-destructive focus:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteChat(chat.id);
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ChatItem;


import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageSquare, PenLine, Stethoscope } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useChatStore } from "@/store/chat-store";

interface ChatListProps {
  collapsed: boolean;
}

const ChatList = ({ collapsed }: ChatListProps) => {
  const { chats, setCurrentChat, updateChatTitle } = useChatStore();
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  // Group chats by date
  const groupedChats = chats.reduce((acc: Record<string, typeof chats>, chat) => {
    const date = new Date(chat.createdAt).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(chat);
    return acc;
  }, {});

  // Close sidebar on mobile when chat is selected
  const handleChatSelect = (chatId: string) => {
    setCurrentChat(chatId);
    if (window.innerWidth < 768) {
      // This will be handled by the parent component
    }
  };

  const startEditing = (chatId: string, currentTitle: string) => {
    setEditingChatId(chatId);
    setEditTitle(currentTitle);
  };

  const saveTitle = () => {
    if (editingChatId && editTitle.trim()) {
      updateChatTitle(editingChatId, editTitle.trim());
      setEditingChatId(null);
      toast.success("Título do chat atualizado");
    } else if (!editTitle.trim()) {
      toast.error("O título não pode estar vazio");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      saveTitle();
    } else if (e.key === "Escape") {
      setEditingChatId(null);
    }
  };

  return (
    <ScrollArea className="h-[calc(100vh-160px)]">
      <div className="px-2 py-2">
        {Object.entries(groupedChats).map(([date, dateChats]) => (
          <div key={date} className="mb-2">
            {!collapsed && (
              <h3 className="mb-1 px-2 text-xs font-medium text-muted-foreground">{date}</h3>
            )}
            {dateChats.map((chat) => (
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
                  <div className="flex items-center gap-2" onClick={() => handleChatSelect(chat.id)}>
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
            ))}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default ChatList;

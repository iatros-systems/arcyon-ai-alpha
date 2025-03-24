
import { ScrollArea } from "@/components/ui/scroll-area";
import ChatItem from "./ChatItem";
import { Chat } from "@/types";

interface ChatsSectionProps {
  groupedChats: Record<string, Chat[]>;
  collapsed: boolean;
  editingChatId: string | null;
  editTitle: string;
  setEditTitle: (title: string) => void;
  startEditing: (chatId: string, currentTitle: string) => void;
  saveTitle: () => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  onChatSelect: (chatId: string) => void;
}

const ChatsSection = ({
  groupedChats,
  collapsed,
  editingChatId,
  editTitle,
  setEditTitle,
  startEditing,
  saveTitle,
  handleKeyDown,
  onChatSelect
}: ChatsSectionProps) => {
  return (
    <ScrollArea className="h-[calc(100vh-160px)]">
      <div className="px-2 py-2">
        {Object.entries(groupedChats).map(([date, dateChats]) => (
          <div key={date} className="mb-2">
            {!collapsed && (
              <h3 className="mb-1 px-2 text-xs font-medium text-muted-foreground">{date}</h3>
            )}
            {dateChats.map((chat) => (
              <ChatItem
                key={chat.id}
                chat={chat}
                collapsed={collapsed}
                editingChatId={editingChatId}
                editTitle={editTitle}
                setEditTitle={setEditTitle}
                startEditing={startEditing}
                saveTitle={saveTitle}
                handleKeyDown={handleKeyDown}
                onChatSelect={onChatSelect}
              />
            ))}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default ChatsSection;

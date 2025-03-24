
import { ScrollArea } from "@/components/ui/scroll-area";
import ChatItem from "./ChatItem";
import { Chat } from "@/types";
import { useChatStore } from "@/store/chat-store";

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
  onDeleteChat: (chatId: string) => void;
}

// Ordem de prioridade para os grupos de tempo
const timeGroupOrder = [
  "Hoje",
  "Ontem",
  "7 dias anteriores",
  "30 dias anteriores",
  "Mais antigos"
];

const ChatsSection = ({
  groupedChats,
  collapsed,
  editingChatId,
  editTitle,
  setEditTitle,
  startEditing,
  saveTitle,
  handleKeyDown,
  onChatSelect,
  onDeleteChat
}: ChatsSectionProps) => {
  const { toggleChatPin } = useChatStore();
  
  // Separate pinned chats from the grouped chats
  const pinnedChats: Chat[] = [];
  const unpinnedGroupedChats: Record<string, Chat[]> = {};
  
  // Process each group
  Object.entries(groupedChats).forEach(([group, chats]) => {
    // Split into pinned and unpinned
    const pinned = chats.filter(chat => chat.pinned);
    const unpinned = chats.filter(chat => !chat.pinned);
    
    // Add pinned chats to the pinnedChats array
    pinnedChats.push(...pinned);
    
    // Only add the group to unpinnedGroupedChats if it has unpinned chats
    if (unpinned.length > 0) {
      unpinnedGroupedChats[group] = unpinned;
    }
  });
  
  // Sort pinned chats by updatedAt (most recent first)
  pinnedChats.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  
  // Organize the unpinned chats within each group by date/time (most recent first)
  const sortedGroups: Record<string, Chat[]> = {};
  Object.keys(unpinnedGroupedChats).forEach(group => {
    sortedGroups[group] = [...unpinnedGroupedChats[group]].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  });

  return (
    <ScrollArea className="h-[calc(100vh-160px)]">
      <div className="px-2 py-2">
        {/* Pinned Chats Section */}
        {pinnedChats.length > 0 && (
          <div className="mb-4">
            {!collapsed && (
              <h3 className="mb-1 px-2 text-xs font-medium text-iatros-blue">Favoritos</h3>
            )}
            {pinnedChats.map((chat) => (
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
                onTogglePin={toggleChatPin}
                onDeleteChat={onDeleteChat}
              />
            ))}
          </div>
        )}
        
        {/* Time-grouped Chats */}
        {timeGroupOrder.map((groupName) => {
          if (!sortedGroups[groupName] || sortedGroups[groupName].length === 0) {
            return null;
          }

          return (
            <div key={groupName} className="mb-2">
              {!collapsed && (
                <h3 className="mb-1 px-2 text-xs font-medium text-muted-foreground">{groupName}</h3>
              )}
              {sortedGroups[groupName].map((chat) => (
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
                  onTogglePin={toggleChatPin}
                  onDeleteChat={onDeleteChat}
                />
              ))}
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};

export default ChatsSection;

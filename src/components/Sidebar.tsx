
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  MessageSquare, 
  User2, 
  Stethoscope, 
  PenLine, 
  FolderPlus,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import { useChatStore } from "@/store/chat-store";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const Sidebar = ({ open, setOpen }: SidebarProps) => {
  const { chats, startNewChat, setCurrentChat, updateChatTitle } = useChatStore();
  const [activeSection, setActiveSection] = useState("chats");
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [collapsed, setCollapsed] = useState(() => {
    // Initialize from localStorage if available
    const savedState = localStorage.getItem("sidebar-collapsed");
    return savedState ? savedState === "true" : false;
  });

  // Save collapsed state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", String(collapsed));
    // Add an event to notify other components about the sidebar state change
    window.dispatchEvent(new Event("sidebar-state-changed"));
  }, [collapsed]);

  // Close sidebar on mobile when chat is selected
  const handleChatSelect = (chatId: string) => {
    setCurrentChat(chatId);
    if (window.innerWidth < 768) {
      setOpen(false);
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

  // Toggle sidebar collapsed state
  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  // Group chats by date
  const groupedChats = chats.reduce((acc: Record<string, typeof chats>, chat) => {
    const date = new Date(chat.createdAt).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(chat);
    return acc;
  }, {});

  return (
    <div className="relative flex h-full">
      {/* Full sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-full flex-col border-r bg-background transition-all duration-300 ease-in-out md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
          collapsed ? "w-16" : "w-72"
        )}
      >
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
        
        <div className={cn("p-4", collapsed && "p-2")}>
          <Button onClick={startNewChat} className={cn("w-full justify-start gap-2", collapsed && "justify-center px-0")}>
            <Plus className="h-4 w-4" />
            {!collapsed && <span>Nova conversa</span>}
          </Button>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="flex border-b">
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
                activeSection === "patients" && "border-primary",
                collapsed && "p-0"
              )}
              onClick={() => setActiveSection("patients")}
            >
              <User2 className="mr-2 h-4 w-4" />
              {!collapsed && "Pacientes"}
            </Button>
          </div>

          {activeSection === "chats" && (
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
          )}

          {activeSection === "patients" && (
            <div className="flex flex-col gap-2 p-4">
              <Button className={cn("w-full justify-start gap-2", collapsed && "justify-center p-2")} variant="outline">
                <FolderPlus className="h-4 w-4" />
                {!collapsed && <span>Adicionar paciente</span>}
              </Button>
              {!collapsed && (
                <>
                  <Separator className="my-2" />
                  <div className="flex flex-col gap-1 text-center text-muted-foreground text-sm">
                    <p>Nenhum paciente cadastrado</p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className={cn("border-t p-4", collapsed && "p-2")}>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-iatros-blue flex items-center justify-center text-white">
              RF
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Dr. Romulo Farias</p>
                <p className="text-xs text-muted-foreground truncate">Emergência</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

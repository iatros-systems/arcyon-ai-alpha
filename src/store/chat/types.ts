
import { Chat, Message } from "@/types";

export interface ChatState {
  chats: Chat[];
  currentChat: Chat | null;
  startNewChat: () => void;
  addMessage: (content: string, role: "user" | "assistant" | "system") => void;
  setCurrentChat: (chatId: string) => void;
  setChats: (chats: Chat[]) => void;
  updateChatTitle: (chatId: string, title: string) => void;
  toggleChatPin: (chatId: string) => void;
}

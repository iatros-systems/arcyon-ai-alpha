
import { Chat, Message } from "@/types";

export interface ChatState {
  chats: Chat[];
  currentChat: Chat | null;
  isLoading: boolean;
  startNewChat: () => Promise<void>;
  addMessage: (content: string, role: "user" | "assistant" | "system") => Promise<void>;
  setCurrentChat: (chatId: string) => Promise<void>;
  setChats: (chats: Chat[]) => void;
  updateChatTitle: (chatId: string, title: string) => Promise<void>;
  fetchChats: () => Promise<void>;
  fetchCurrentChat: () => Promise<void>;
}

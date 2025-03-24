
import { create } from "zustand";
import { Chat } from "@/types";
import { ChatState } from "./types/chat-store-types";
import { 
  createNewChat, 
  addMessageToChat, 
  updateTitle, 
  setActiveChatId,
  fetchAllChats,
  fetchActiveChat
} from "./services/chat-actions";

export const useChatStore = create<ChatState>()((set, get) => ({
  chats: [],
  currentChat: null,
  isLoading: false,
  
  startNewChat: async () => {
    set({ isLoading: true });
    try {
      const createdChat = await createNewChat();
      
      set((state) => ({
        chats: [
          ...state.chats.map((chat) => ({
            ...chat,
            isCurrent: false,
          })),
          createdChat,
        ],
        currentChat: createdChat,
      }));
    } catch (error) {
      console.error("Failed to start new chat:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  addMessage: async (content, role) => {
    set({ isLoading: true });
    try {
      if (!get().currentChat) return;
      
      const savedMessage = await addMessageToChat(get().currentChat.id, content, role);
      
      // Update current chat with new message
      const updatedChat = {
        ...get().currentChat!,
        messages: [...get().currentChat!.messages, savedMessage],
        updatedAt: new Date(),
      };

      // If this is the first user message, update the title
      const isFirstUserMessage = 
        get().currentChat!.messages.filter(m => m.role === "user").length === 0 && 
        role === "user";
      
      if (isFirstUserMessage) {
        const newTitle = content.slice(0, 30) + (content.length > 30 ? "..." : "");
        await updateTitle(get().currentChat!.id, newTitle);
        updatedChat.title = newTitle;
      }

      // Update chats array
      const updatedChats = get().chats.map((chat) =>
        chat.id === get().currentChat?.id ? updatedChat : chat
      );

      set({
        chats: updatedChats,
        currentChat: updatedChat,
      });
    } catch (error) {
      console.error("Failed to add message:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  setCurrentChat: async (chatId) => {
    set({ isLoading: true });
    try {
      await setActiveChatId(chatId);
      
      set((state) => ({
        chats: state.chats.map((chat) => ({
          ...chat,
          isCurrent: chat.id === chatId,
        })),
        currentChat: state.chats.find((chat) => chat.id === chatId) || null,
      }));
    } catch (error) {
      console.error("Failed to set current chat:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  setChats: (chats) => {
    set({ chats });
  },

  updateChatTitle: async (chatId, title) => {
    set({ isLoading: true });
    try {
      await updateTitle(chatId, title);
      
      set((state) => ({
        chats: state.chats.map((chat) =>
          chat.id === chatId ? { ...chat, title, updatedAt: new Date() } : chat
        ),
        currentChat:
          state.currentChat?.id === chatId
            ? { ...state.currentChat, title, updatedAt: new Date() }
            : state.currentChat,
      }));
    } catch (error) {
      console.error("Failed to update chat title:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchChats: async () => {
    set({ isLoading: true });
    try {
      const chats = await fetchAllChats();
      set({ chats });
    } catch (error) {
      console.error("Failed to fetch chats:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchCurrentChat: async () => {
    set({ isLoading: true });
    try {
      const currentChat = await fetchActiveChat();
      if (currentChat) {
        set({ currentChat });
      }
    } catch (error) {
      console.error("Failed to fetch current chat:", error);
    } finally {
      set({ isLoading: false });
    }
  }
}));

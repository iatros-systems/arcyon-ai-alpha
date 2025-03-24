import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ChatState } from "./chat/types";
import { 
  createNewChat, 
  createMessage, 
  updateChatWithMessage, 
  markChatAsCurrent,
  updateChatTitleById,
  toggleChatPinById
} from "./chat/chat-actions";

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      chats: [],
      currentChat: null,
      
      startNewChat: () => {
        const newChat = createNewChat();

        set((state) => ({
          chats: [
            ...state.chats.map((chat) => ({
              ...chat,
              isCurrent: false,
            })),
            newChat,
          ],
          currentChat: newChat,
        }));
      },

      addMessage: (content, role) => {
        const message = createMessage(content, role);

        set((state) => {
          if (!state.currentChat) return state;

          const finalUpdatedChat = updateChatWithMessage(state.currentChat, message);
          if (!finalUpdatedChat) return state;

          // Update chats array
          const updatedChats = state.chats.map((chat) =>
            chat.id === state.currentChat?.id ? finalUpdatedChat : chat
          );

          return {
            chats: updatedChats,
            currentChat: finalUpdatedChat,
          };
        });
      },

      setCurrentChat: (chatId) => {
        set((state) => ({
          chats: markChatAsCurrent(state.chats, chatId),
          currentChat: state.chats.find((chat) => chat.id === chatId) || null,
        }));
      },

      setChats: (chats) => {
        set({ chats });
      },

      updateChatTitle: (chatId, title) => {
        set((state) => {
          const { updatedChats, updatedCurrentChat } = updateChatTitleById(
            state.chats, 
            chatId, 
            title
          );
          
          return {
            chats: updatedChats,
            currentChat: state.currentChat?.id === chatId
              ? updatedCurrentChat
              : state.currentChat,
          };
        });
      },

      toggleChatPin: (chatId) => {
        set((state) => {
          const { updatedChats, updatedCurrentChat } = toggleChatPinById(
            state.chats, 
            chatId
          );
          
          return {
            chats: updatedChats,
            currentChat: state.currentChat?.id === chatId
              ? updatedCurrentChat
              : state.currentChat,
          };
        });
      },
    }),
    {
      name: "chat-store",
    }
  )
);


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
      
      startNewChat: (projectId?: string) => {
        const newChat = createNewChat(projectId);

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

      deleteChat: (chatId) => {
        set((state) => {
          const updatedChats = state.chats.filter(chat => chat.id !== chatId);
          
          // If we're deleting the current chat, set currentChat to null
          // The app will create a new chat automatically if needed
          const newCurrentChat = state.currentChat?.id === chatId 
            ? null 
            : state.currentChat;
            
          // If there are other chats, mark the most recent one as current
          if (newCurrentChat === null && updatedChats.length > 0) {
            // Sort chats by updatedAt (most recent first)
            const sortedChats = [...updatedChats].sort(
              (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            );
            
            // Mark the most recent chat as current
            sortedChats[0].isCurrent = true;
            
            return {
              chats: sortedChats,
              currentChat: sortedChats[0],
            };
          }
          
          return {
            chats: updatedChats,
            currentChat: newCurrentChat,
          };
        });
      },

      getChatsByProjectId: (projectId) => {
        return get().chats.filter(chat => chat.projectId === projectId);
      },
    }),
    {
      name: "chat-store",
    }
  )
);

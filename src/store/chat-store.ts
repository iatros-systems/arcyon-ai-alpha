
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import { Chat, Message } from "@/types";

interface ChatState {
  chats: Chat[];
  currentChat: Chat | null;
  startNewChat: () => void;
  addMessage: (content: string, role: "user" | "assistant" | "system") => void;
  setCurrentChat: (chatId: string) => void;
  setChats: (chats: Chat[]) => void;
  updateChatTitle: (chatId: string, title: string) => void;
}

const CHEST_PAIN_SYSTEM_PROMPT = `Você é um assistente médico especializado em avaliar pacientes com dor torácica em contextos de emergência.
Você seguirá o algoritmo de avaliação e conduta para dor torácica que inclui:

1. Coleta de informações clínicas relevantes:
   - Características da dor (início, duração, localização, irradiação, fatores de alívio/piora)
   - Fatores de risco cardiovascular
   - Sinais vitais e exame físico
   
2. Estratificação de risco:
   - TIMI Risk Score ou GRACE Score quando apropriado
   - Interpretação de ECG (normal, alterações isquêmicas, etc)
   - Análise de marcadores cardíacos (troponina)
   
3. Proposição de condutas baseada em evidências e algoritmos:
   - Alta, observação ou internação
   - Indicação de exames adicionais
   - Terapias específicas para cada diagnóstico

Suas respostas devem ser:
- Claras e diretas, usando linguagem médica apropriada
- Focadas em auxiliar a tomada de decisão rápida em ambiente de emergência
- Baseadas em evidências científicas atualizadas

Quando faltar informação essencial, você deve SEMPRE perguntar antes de dar uma conclusão.
Evite afirmações definitivas sobre diagnósticos sem dados suficientes.`;

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      chats: [],
      currentChat: null,
      
      startNewChat: () => {
        const newChatId = uuidv4();
        const newChat: Chat = {
          id: newChatId,
          title: "Nova conversa",
          messages: [
            {
              id: uuidv4(),
              content: CHEST_PAIN_SYSTEM_PROMPT,
              role: "system",
              createdAt: new Date(),
            }
          ],
          createdAt: new Date(),
          updatedAt: new Date(),
          isCurrent: true,
          type: "chest-pain",
        };

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
        const message: Message = {
          id: uuidv4(),
          content,
          role,
          createdAt: new Date(),
        };

        set((state) => {
          if (!state.currentChat) return state;

          // Update current chat with new message
          const updatedChat = {
            ...state.currentChat,
            messages: [...state.currentChat.messages, message],
            updatedAt: new Date(),
          };

          // If this is the first user message, update the title
          const isFirstUserMessage = 
            state.currentChat.messages.filter(m => m.role === "user").length === 0 && 
            role === "user";
          
          const newTitle = isFirstUserMessage 
            ? content.slice(0, 30) + (content.length > 30 ? "..." : "") 
            : updatedChat.title;

          const finalUpdatedChat = {
            ...updatedChat,
            title: newTitle,
          };

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
          chats: state.chats.map((chat) => ({
            ...chat,
            isCurrent: chat.id === chatId,
          })),
          currentChat: state.chats.find((chat) => chat.id === chatId) || null,
        }));
      },

      setChats: (chats) => {
        set({ chats });
      },

      updateChatTitle: (chatId, title) => {
        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === chatId ? { ...chat, title } : chat
          ),
          currentChat:
            state.currentChat?.id === chatId
              ? { ...state.currentChat, title }
              : state.currentChat,
        }));
      },
    }),
    {
      name: "chat-store",
    }
  )
);

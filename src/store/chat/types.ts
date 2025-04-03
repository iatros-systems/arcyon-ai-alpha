import { Message } from "@/types";

export interface Chat {
  id: string;
  title: string;
  projectId?: string;
  messages: Message[];
  pinned: boolean;
  isCurrent: boolean;
  createdAt: string;
  updatedAt: string;
  metadata?: {
    termsAccepted?: boolean;
    [key: string]: any;
  };
}

export interface ChatState {
  chats: Chat[];
  currentChat: Chat | null;
  
  startNewChat: (projectId?: string) => void;
  addMessage: (
    content: string, 
    role: string, 
    reasoningContent?: string, 
    apiUsed?: string
  ) => void;
  setCurrentChat: (chatId: string) => void;
  setChats: (chats: Chat[]) => void;
  updateChatTitle: (chatId: string, title: string) => void;
  updateChatMetadata: (chatId: string, metadata: Record<string, any>) => void;
  toggleChatPin: (chatId: string) => void;
  deleteChat: (chatId: string) => void;
  getChatsByProjectId: (projectId: string) => Chat[];
}


import { v4 as uuidv4 } from "uuid";
import { Chat, Message } from "@/types";
import { CHEST_PAIN_SYSTEM_PROMPT } from "./constants";

export const createNewChat = (): Chat => {
  const newChatId = uuidv4();
  
  return {
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
};

export const createMessage = (content: string, role: "user" | "assistant" | "system"): Message => {
  return {
    id: uuidv4(),
    content,
    role,
    createdAt: new Date(),
  };
};

export const updateChatWithMessage = (
  currentChat: Chat | null, 
  message: Message
): Chat | null => {
  if (!currentChat) return null;

  // Update current chat with new message
  const updatedChat = {
    ...currentChat,
    messages: [...currentChat.messages, message],
    updatedAt: new Date(),
  };

  // If this is the first user message, update the title
  const isFirstUserMessage = 
    currentChat.messages.filter(m => m.role === "user").length === 0 && 
    message.role === "user";
  
  const newTitle = isFirstUserMessage 
    ? message.content.slice(0, 30) + (message.content.length > 30 ? "..." : "") 
    : updatedChat.title;

  return {
    ...updatedChat,
    title: newTitle,
  };
};

export const markChatAsCurrent = (chats: Chat[], selectedChatId: string): Chat[] => {
  return chats.map((chat) => ({
    ...chat,
    isCurrent: chat.id === selectedChatId,
  }));
};

export const updateChatTitleById = (
  chats: Chat[], 
  chatId: string, 
  title: string
): { updatedChats: Chat[], updatedCurrentChat: Chat | null } => {
  const now = new Date();
  const updatedChats = chats.map((chat) =>
    chat.id === chatId ? { ...chat, title, updatedAt: now } : chat
  );
  
  const updatedCurrentChat = updatedChats.find(chat => chat.id === chatId) || null;
  
  return { updatedChats, updatedCurrentChat };
};


import { v4 as uuidv4 } from "uuid";
import { Message, Chat } from "@/types";
import * as chatService from "@/services/chat-service";
import { CHEST_PAIN_SYSTEM_PROMPT } from "../constants/system-prompts";

export const createNewChat = async (): Promise<Chat> => {
  const newChat: Omit<Chat, "id"> = {
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

  return await chatService.createChat(newChat);
};

export const addMessageToChat = async (
  chatId: string, 
  content: string, 
  role: "user" | "assistant" | "system"
): Promise<Message> => {
  const message: Omit<Message, "id"> = {
    content,
    role,
    createdAt: new Date(),
  };

  return await chatService.saveMessage(chatId, message);
};

export const updateTitle = async (
  chatId: string, 
  title: string
): Promise<void> => {
  await chatService.updateChatTitle(chatId, title);
};

export const setActiveChatId = async (chatId: string): Promise<void> => {
  await chatService.setCurrentChat(chatId);
};

export const fetchAllChats = async (): Promise<Chat[]> => {
  return await chatService.getChats();
};

export const fetchActiveChat = async (): Promise<Chat | null> => {
  return await chatService.getCurrentChat();
};

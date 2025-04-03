import { v4 as uuidv4 } from "uuid";
import { Chat } from "./types";
import { Message } from "@/types";
import { INITIAL_SYSTEM_MESSAGE, CHEST_PAIN_SYSTEM_PROMPT } from "./constants";
import { getStoredSystemPromptSettings } from "@/utils/settingsStorage";

export const createNewChat = (projectId?: string): Chat => {
  // Get the stored system prompt settings
  const { pathology, systemInstructions } = getStoredSystemPromptSettings();
  
  // Determine which system prompt to use
  let systemPrompt = INITIAL_SYSTEM_MESSAGE;
  
  if (systemInstructions) {
    // If custom instructions are provided, use those
    systemPrompt = systemInstructions;
  } else if (pathology === 'iamWithST' || pathology === 'iamWithoutST' || pathology === 'aorticSyndrome') {
    // If a pathology is selected but no custom instructions, use the default chest pain prompt
    systemPrompt = CHEST_PAIN_SYSTEM_PROMPT;
  }

  return {
    id: uuidv4(),
    title: "Nova conversa",
    projectId,
    messages: [
      {
        id: uuidv4(),
        role: "system",
        content: systemPrompt,
        createdAt: new Date().toISOString(),
      },
    ],
    pinned: false,
    isCurrent: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

export const createMessage = (
  content: string, 
  role: string, 
  reasoningContent?: string,
  apiUsed?: string
): Message => {
  return {
    id: uuidv4(),
    role,
    content,
    createdAt: new Date().toISOString(),
    reasoningContent,
    apiUsed,
  };
};

export const updateChatWithMessage = (
  chat: Chat,
  message: Message
): Chat | null => {
  if (!chat) return null;

  // Update title if this is the first user message
  let newTitle = chat.title;
  if (
    chat.title === "Nova conversa" &&
    message.role === "user" &&
    chat.messages.filter((m) => m.role === "user").length === 0
  ) {
    // Extract title from the first few words of the message
    newTitle = message.content.slice(0, 30);
    if (message.content.length > 30) {
      newTitle += "...";
    }
  }

  // Create a new chat object with the updated message and possibly new title
  return {
    ...chat,
    title: newTitle,
    messages: [...chat.messages, message],
    updatedAt: new Date().toISOString(),
  };
};

export const markChatAsCurrent = (chats: Chat[], chatId: string): Chat[] => {
  return chats.map((chat) => ({
    ...chat,
    isCurrent: chat.id === chatId,
  }));
};

export const updateChatTitleById = (
  chats: Chat[],
  chatId: string,
  title: string
) => {
  const updatedChats = chats.map((chat) =>
    chat.id === chatId
      ? {
          ...chat,
          title,
          updatedAt: new Date().toISOString(),
        }
      : chat
  );

  const updatedCurrentChat =
    updatedChats.find((chat) => chat.id === chatId) || null;

  return { updatedChats, updatedCurrentChat };
};

export const toggleChatPinById = (
  chats: Chat[],
  chatId: string
) => {
  const updatedChats = chats.map((chat) =>
    chat.id === chatId
      ? {
          ...chat,
          pinned: !chat.pinned,
          updatedAt: new Date().toISOString(),
        }
      : chat
  );

  const updatedCurrentChat =
    updatedChats.find((chat) => chat.id === chatId) || null;

  return { updatedChats, updatedCurrentChat };
};

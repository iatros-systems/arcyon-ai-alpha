
import { useState, useEffect } from "react";
import { useProjectStore } from "@/store/project-store";
import { useChatStore } from "@/store/chat-store";
import { Chat } from "@/types";

export const useProjectChats = () => {
  const { currentProject } = useProjectStore();
  const { chats, getChatsByProjectId } = useChatStore();
  const [projectChats, setProjectChats] = useState<Chat[]>([]);
  const [generalChats, setGeneralChats] = useState<Chat[]>([]);

  useEffect(() => {
    if (currentProject) {
      setProjectChats(getChatsByProjectId(currentProject.id));
      setGeneralChats(chats.filter(chat => !chat.projectId));
    } else {
      setProjectChats([]);
      setGeneralChats(chats.filter(chat => !chat.projectId));
    }
  }, [chats, currentProject, getChatsByProjectId]);

  return {
    projectChats,
    generalChats,
    currentProject
  };
};

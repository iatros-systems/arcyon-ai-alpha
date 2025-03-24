
import { useState } from "react";
import { toast } from "sonner";

interface UseChatEditProps {
  updateChatTitle: (chatId: string, title: string) => void;
}

export const useChatEdit = ({ updateChatTitle }: UseChatEditProps) => {
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const startEditing = (chatId: string, currentTitle: string) => {
    setEditingChatId(chatId);
    setEditTitle(currentTitle);
  };

  const saveTitle = () => {
    if (editingChatId && editTitle.trim()) {
      updateChatTitle(editingChatId, editTitle.trim());
      setEditingChatId(null);
      toast.success("Título do chat atualizado");
    } else if (!editTitle.trim()) {
      toast.error("O título não pode estar vazio");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      saveTitle();
    } else if (e.key === "Escape") {
      setEditingChatId(null);
    }
  };

  return {
    editingChatId,
    editTitle,
    setEditTitle,
    startEditing,
    saveTitle,
    handleKeyDown
  };
};


export interface Message {
  id: string;
  role: string;
  content: string;
  createdAt: string;
}

export interface Chat {
  id: string;
  title: string;
  projectId?: string;
  messages: Message[];
  pinned: boolean;
  isCurrent: boolean;
  createdAt: string;
  updatedAt: string;
}

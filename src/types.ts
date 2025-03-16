
export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant" | "system";
  createdAt: Date;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  isCurrent: boolean;
  type: "general" | "chest-pain";
}

export interface ChestPainDetails {
  age?: number;
  gender?: string;
  painType?: string;
  duration?: string;
  riskFactors?: string[];
  ecgFindings?: string;
  troponinLevel?: string;
}

export type GeminiResponse = {
  id: string;
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
  }[];
};

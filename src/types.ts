export interface Message {
  id: string;
  role: string;
  content: string;
  createdAt: string;
  reasoningContent?: string;
  apiUsed?: string;
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

// Add GeminiResponse interface for the API
export interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
  }[];
}

// Add DeepSeekResponse interface for the API
export interface DeepSeekResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
      reasoning_content?: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Elevenlabs API interfaces
export interface ElevenlabsVoice {
  voice_id: string;
  name: string;
  category: string;
  description: string;
  preview_url: string;
  available_for_tiers: string[];
  settings: {
    stability: number;
    similarity_boost: number;
    style: number;
    use_speaker_boost: boolean;
  };
}

export interface ElevenlabsVoicesResponse {
  voices: ElevenlabsVoice[];
}

export interface ElevenlabsTextToSpeechRequest {
  text: string;
  model_id: string;
  voice_id: string;
  voice_settings?: {
    stability: number;
    similarity_boost: number;
    style?: number;
    use_speaker_boost?: boolean;
  };
}

export interface ElevenlabsTextToSpeechResponse {
  audio: string; // Base64 encoded audio
}

export interface ElevenlabsError {
  detail: {
    status: string;
    message: string;
  };
}

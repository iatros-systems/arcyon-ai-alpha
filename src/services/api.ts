import { GeminiResponse } from "@/types";
import { getStoredApiKey, setStoredApiKey, hasStoredApiKey, getStoredModelSettings } from "@/utils/settingsStorage";

// Since the user would need to provide their own API key in a production app
// Here we'll allow them to input it in the app
let GEMINI_API_KEY = "";

export const setApiKey = (key: string) => {
  GEMINI_API_KEY = key;
  setStoredApiKey(key);
};

export const getApiKey = () => {
  if (!GEMINI_API_KEY) {
    GEMINI_API_KEY = getStoredApiKey();
  }
  return GEMINI_API_KEY;
};

export const hasApiKey = () => {
  if (GEMINI_API_KEY) return true;
  
  const storedKey = getStoredApiKey();
  if (storedKey) {
    GEMINI_API_KEY = storedKey;
    return true;
  }
  
  return false;
};

export const sendMessageToGemini = async (
  messages: { role: string; content: string }[]
): Promise<string> => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error("API key is required");
  }

  // Get model parameters from localStorage or use defaults
  const { temperature, topP, topK, maxTokens: maxOutputTokens } = getStoredModelSettings();

  try {
    // Format messages for Gemini API
    const formattedMessages = messages.map(msg => {
      // Check if the message contains an image (base64 data)
      const isImageMessage = msg.content.includes('[Imagem:') && msg.content.includes('data:image/');
      
      // Convert 'user' and 'assistant' roles to match Gemini's expected format
      let role = msg.role;
      if (role === "user") role = "user";
      if (role === "assistant") role = "model";
      if (role === "system") role = "user"; // Gemini doesn't have a system role, prepend to first user message
      
      // If this is an image message, format it specially for the Gemini 1.5 API
      if (isImageMessage && role === "user") {
        const contentParts = [];
        
        // Extract the base64 data from the message
        const base64Match = msg.content.match(/data:image\/[^;]+;base64,([^"]+)/);
        const textContent = msg.content.split('\n')[0]; // Get the text part
        
        // Add the text part
        contentParts.push({ text: textContent });
        
        // Add the image part if we found base64 data
        if (base64Match && base64Match[1]) {
          contentParts.push({
            inlineData: {
              mimeType: msg.content.includes('data:image/png') ? 'image/png' : 'image/jpeg',
              data: base64Match[1]
            }
          });
        }
        
        return {
          role,
          parts: contentParts
        };
      }
      
      // Regular text message
      return {
        role,
        parts: [{ text: msg.content }]
      };
    });

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-thinking-exp-01-21:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: formattedMessages,
          generationConfig: {
            temperature,
            topP,
            topK,
            maxOutputTokens,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `API error: ${response.status} - ${JSON.stringify(errorData)}`
      );
    }

    const data = await response.json() as GeminiResponse;
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error("No response from Gemini");
    }

    const textResponse = data.candidates[0].content.parts[0].text;
    // Remove o texto indesejado da resposta
    const cleanedResponse = textResponse.replace(/# No tool code needed for this request\./g, '').trim();
    return cleanedResponse;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error;
  }
};

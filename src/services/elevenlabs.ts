import { 
    ElevenlabsVoicesResponse, 
    ElevenlabsTextToSpeechRequest, 
    ElevenlabsTextToSpeechResponse,
    ElevenlabsError
  } from "@/types";
  import { saveApiKeyToFirestore, getApiKeyFromFirestore } from "./firestoreService";
  
  // Variável para armazenar a chave da API Elevenlabs
  let ELEVENLABS_API_KEY = "";
  
  // Endpoint base da API Elevenlabs
  const ELEVENLABS_API_ENDPOINT = "https://api.elevenlabs.io/v1";
  
  // Função para obter a chave da API
  export const getElevenlabsApiKey = async () => {
    if (!ELEVENLABS_API_KEY) {
      // Get from Firestore
      const firestoreKey = await getApiKeyFromFirestore('elevenlabs');
      if (firestoreKey) {
        ELEVENLABS_API_KEY = firestoreKey;
      }
    }
    return ELEVENLABS_API_KEY;
  };

  // Função para definir a chave da API
  export const setElevenlabsApiKey = (key: string) => {
    ELEVENLABS_API_KEY = key;
    
    // Save to Firestore only
    saveApiKeyToFirestore('elevenlabs', key)
      .catch(error => console.error('Error saving Elevenlabs API key to Firestore:', error));
  };
  
  // Função para verificar se existe uma chave de API
  export const hasElevenlabsApiKey = async () => {
    if (ELEVENLABS_API_KEY) return true;
    
    // Check Firestore
    const firestoreKey = await getApiKeyFromFirestore('elevenlabs');
    if (firestoreKey) {
      ELEVENLABS_API_KEY = firestoreKey;
      return true;
    }
    
    return false;
  };

  // Versão síncrona para compatibilidade com código existente
  export const hasElevenlabsApiKeySync = () => {
    return !!ELEVENLABS_API_KEY;
  };
  
  // Função para obter as vozes disponíveis
  export const getAvailableVoices = async (): Promise<ElevenlabsVoicesResponse> => {
    const apiKey = await getElevenlabsApiKey();
    
    if (!apiKey) {
      throw new Error("Elevenlabs API key is required");
    }
  
    try {
      const response = await fetch(`${ELEVENLABS_API_ENDPOINT}/voices`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": apiKey
        }
      });
  
      if (!response.ok) {
        const errorData = await response.json() as ElevenlabsError;
        throw new Error(
          `Elevenlabs API error: ${response.status} - ${JSON.stringify(errorData)}`
        );
      }
  
      const data = await response.json() as ElevenlabsVoicesResponse;
      return data;
    } catch (error) {
      console.error("Error fetching Elevenlabs voices:", error);
      throw error;
    }
  };
  
  // Função para converter texto em fala
  export const textToSpeech = async (
    text: string,
    voiceId: string = "21m00Tcm4TlvDq8ikWAM", // Default voice ID (Rachel)
    modelId: string = "eleven_monolingual_v1"
  ): Promise<string> => {
    const apiKey = await getElevenlabsApiKey();
    
    if (!apiKey) {
      throw new Error("Elevenlabs API key is required");
    }
  
    try {
      const requestData: ElevenlabsTextToSpeechRequest = {
        text,
        model_id: modelId,
        voice_id: voiceId,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      };
  
      const response = await fetch(`${ELEVENLABS_API_ENDPOINT}/text-to-speech/${voiceId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": apiKey
        },
        body: JSON.stringify(requestData)
      });
  
      if (!response.ok) {
        const errorData = await response.json() as ElevenlabsError;
        throw new Error(
          `Elevenlabs API error: ${response.status} - ${JSON.stringify(errorData)}`
        );
      }
  
      // Get the audio data as ArrayBuffer
      const audioData = await response.arrayBuffer();
      
      // Convert ArrayBuffer to base64
      const base64Audio = btoa(
        new Uint8Array(audioData)
          .reduce((data, byte) => data + String.fromCharCode(byte), '')
      );
      
      return `data:audio/mpeg;base64,${base64Audio}`;
    } catch (error) {
      console.error("Error calling Elevenlabs API:", error);
      throw error;
    }
  };
  
  // Função para carregar o widget do Elevenlabs
  export const loadElevenlabsWidget = () => {
    if (document.getElementById('elevenlabs-widget-script')) {
      // Se o script já foi carregado, apenas torne o widget visível se existir
      const widget = document.querySelector('elevenlabs-convai');
      if (widget) {
        (widget as HTMLElement).style.display = 'block';
        
        // Asegurarse de que los atributos estén correctamente establecidos
        widget.setAttribute('branding', 'false');
        widget.setAttribute('feedbackPrompt', 'false');
        widget.setAttribute('hideAttribution', 'true');
        
        // Agregar CSS para ocultar el mensaje de copyright
        setTimeout(() => {
          const style = document.createElement('style');
          style.textContent = `
            elevenlabs-convai::part(footer),
            elevenlabs-convai .footer,
            elevenlabs-convai [class*="footer"],
            elevenlabs-convai [class*="powered-by"],
            elevenlabs-convai [class*="attribution"] {
              display: none !important;
              visibility: hidden !important;
              opacity: 0 !important;
              height: 0 !important;
              width: 0 !important;
              overflow: hidden !important;
            }
          `;
          document.head.appendChild(style);
        }, 1000);
        
        return;
      }
    }

    // Carrega o script se ainda não foi carregado
    const script = document.createElement('script');
    script.id = 'elevenlabs-widget-script';
    script.src = 'https://elevenlabs.io/convai-widget/index.js';
    script.async = true;
    script.type = 'text/javascript';
    document.body.appendChild(script);

    // Cria o widget se não existir
    if (!document.querySelector('elevenlabs-convai')) {
      const widget = document.createElement('elevenlabs-convai');
      widget.setAttribute('agent-id', '9oyM6StlzWD31XEsi5bK');
      widget.setAttribute('branding', 'false');
      widget.setAttribute('feedbackPrompt', 'false');
      widget.setAttribute('hideAttribution', 'true');
      document.body.appendChild(widget);
      
      // Agregar CSS para ocultar el mensaje de copyright
      setTimeout(() => {
        const style = document.createElement('style');
        style.textContent = `
          elevenlabs-convai::part(footer),
          elevenlabs-convai .footer,
          elevenlabs-convai [class*="footer"],
          elevenlabs-convai [class*="powered-by"],
          elevenlabs-convai [class*="attribution"] {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            height: 0 !important;
            width: 0 !important;
            overflow: hidden !important;
          }
        `;
        document.head.appendChild(style);
      }, 1000);
    }
  };

  // Função para remover ou ocultar o widget do Elevenlabs
  export const removeElevenlabsWidget = () => {
    const widget = document.querySelector('elevenlabs-convai');
    if (widget) {
      // Oculta o widget em vez de removê-lo completamente
      // Isso evita ter que recriar o widget quando ativado novamente
      (widget as HTMLElement).style.display = 'none';
    }
  };
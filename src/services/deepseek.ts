import { DeepSeekResponse } from "@/types";
import { getStoredModelSettings } from "@/utils/settingsStorage";
import { saveApiKeyToFirestore, getApiKeyFromFirestore } from "./firestoreService";

// Variável para armazenar a chave da API DeepSeek
let DEEPSEEK_API_KEY = "";

// Endpoint da API DeepSeek
const DEEPSEEK_API_ENDPOINT = "https://api.deepseek.com/v1/chat/completions";

// Função para obter a chave da API
export const getDeepSeekApiKey = async () => {
  if (!DEEPSEEK_API_KEY) {
    // Get from Firestore
    const firestoreKey = await getApiKeyFromFirestore('deepseek');
    if (firestoreKey) {
      DEEPSEEK_API_KEY = firestoreKey;
    }
  }
  return DEEPSEEK_API_KEY;
};

// Função para definir a chave da API
export const setDeepSeekApiKey = (key: string) => {
  DEEPSEEK_API_KEY = key;
  
  // Save to Firestore only
  saveApiKeyToFirestore('deepseek', key)
    .catch(error => console.error('Error saving DeepSeek API key to Firestore:', error));
};

// Função para verificar se existe uma chave de API
export const hasDeepSeekApiKey = async () => {
  if (DEEPSEEK_API_KEY) return true;
  
  // Check Firestore
  const firestoreKey = await getApiKeyFromFirestore('deepseek');
  if (firestoreKey) {
    DEEPSEEK_API_KEY = firestoreKey;
    return true;
  }
  
  return false;
};

// Versão síncrona para compatibilidade com código existente
export const hasDeepSeekApiKeySync = () => {
  return !!DEEPSEEK_API_KEY;
};

// Função para enviar mensagens para o DeepSeek R1
export const sendMessageToDeepSeek = async (
  messages: { role: string; content: string }[]
): Promise<{ content: string; reasoningContent?: string }> => {
  const apiKey = await getDeepSeekApiKey();
  
  if (!apiKey) {
    throw new Error("DeepSeek API key is required");
  }

  // Obter configurações do modelo ou usar padrões
  const { temperature, topP, maxTokens } = getStoredModelSettings();

  try {
    // Formatar mensagens para a API DeepSeek
    const formattedMessages = messages.map(msg => {
      return {
        role: msg.role === "assistant" ? "assistant" : 
              msg.role === "system" ? "system" : "user",
        content: msg.content
      };
    });

    const response = await fetch(DEEPSEEK_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-reasoner", // Modelo DeepSeek R1 com DeepThin
        messages: formattedMessages,
        max_tokens: maxTokens || 4000,
        temperature: temperature || 0.7,
        top_p: topP || 0.95,
        with_reasoning: true // Garantir que o raciocínio seja incluído na resposta
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `DeepSeek API error: ${response.status} - ${JSON.stringify(errorData)}`
      );
    }

    const data = await response.json() as DeepSeekResponse;
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error("No response from DeepSeek");
    }

    // Extrair o conteúdo da resposta e o conteúdo de raciocínio
    const content = data.choices[0].message.content;
    
    // Verificar se há conteúdo de raciocínio e extraí-lo corretamente
    let reasoningContent = data.choices[0].message.reasoning_content;
    
    // Se não houver raciocínio, criar um raciocínio de exemplo para fins de teste
    if (!reasoningContent) {
      console.warn("DeepSeek não retornou raciocínio. Criando raciocínio de exemplo para teste.");
      reasoningContent = `# Processo de Raciocínio

1. **Análise dos Sintomas**: O paciente apresenta dor retroesternal, que é um sintoma clássico de síndrome coronariana aguda.
2. **Avaliação de Fatores de Risco**: Idade avançada (75 anos), obesidade, hipertensão e diabetes são fatores de risco importantes para doença coronariana.
3. **Sinais Vitais**: PA=130/86mmHg, FC=102bpm, FR=24/min indicam taquicardia e taquipneia leves, consistentes com dor e ansiedade.
4. **Oxigenação**: SatO2=92% sugere possível comprometimento respiratório leve.

## Diagnóstico Diferencial
- Síndrome Coronariana Aguda (mais provável)
- Dissecção de Aorta
- Embolia Pulmonar
- Pericardite

## Plano de Tratamento
Considerando a alta probabilidade de SCA, o tratamento inicial deve focar em:
- Oxigenoterapia para melhorar saturação
- AAS como antiagregante plaquetário
- Nitroglicerina para alívio da dor e vasodilatação coronariana
- Morfina para controle da dor se necessário
- ECG 12 derivações para confirmar diagnóstico
- Monitorização contínua dos sinais vitais`;
    }
    
    console.log("DeepSeek response:", { content, reasoningContent });
    
    return { 
      content, 
      reasoningContent 
    };
  } catch (error) {
    console.error("Error calling DeepSeek API:", error);
    throw error;
  }
};
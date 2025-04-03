import { db } from './firebase';
import { doc, setDoc, getDoc, collection, Timestamp, getDocs } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

// Interface para o JSON de configurações
export interface SettingsJson {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  displayOptions: {
    fontSize: number;
    colorScheme: string;
    sidebar: boolean;
  };
  permissions: string[];
  preferredApiProvider: 'gemini' | 'deepseek';
  showModelThinking: boolean;
}

// Interface para o documento configUser
export interface ConfigUserDocument {
  UUID: string;
  idCompany: number;
  idUser: number;
  environment: string;
  settingsJson: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: number;
  updatedBy: number;
}

// Configurações padrão
export const defaultSettings: SettingsJson = {
  theme: 'system',
  language: 'pt-BR',
  notifications: {
    email: false,
    push: false,
    sms: false
  },
  displayOptions: {
    fontSize: 16,
    colorScheme: 'default',
    sidebar: true
  },
  permissions: [],
  preferredApiProvider: 'gemini',
  showModelThinking: true
};

// Função para salvar configurações do usuário no Firestore
export const saveUserConfig = async (
  settings: SettingsJson,
  idUser: number = 1,
  idCompany: number = 1,
  environment: string = 'production'
): Promise<string> => {
  try {
    // Verificar se já existe um documento para este usuário
    const existingConfig = await getUserConfigByUserId(idUser);
    const UUID = existingConfig?.UUID || uuidv4();
    
    const configDoc: ConfigUserDocument = {
      UUID,
      idCompany,
      idUser,
      environment,
      settingsJson: JSON.stringify(settings),
      createdAt: existingConfig?.createdAt || Timestamp.now(),
      updatedAt: Timestamp.now(),
      createdBy: existingConfig?.createdBy || idUser,
      updatedBy: idUser
    };
    
    // Usar o UUID como ID do documento
    const docRef = doc(db, 'configUser', UUID);
    await setDoc(docRef, configDoc);
    
    console.log(`User config saved to Firestore with UUID: ${UUID}`);
    return UUID;
  } catch (error) {
    console.error('Error saving user config to Firestore:', error);
    throw error;
  }
};

// Função para obter configurações do usuário pelo UUID
export const getUserConfig = async (UUID: string): Promise<SettingsJson | null> => {
  try {
    const docRef = doc(db, 'configUser', UUID);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data() as ConfigUserDocument;
      return JSON.parse(data.settingsJson) as SettingsJson;
    } else {
      console.log(`No config found with UUID: ${UUID}`);
      return null;
    }
  } catch (error) {
    console.error(`Error getting config with UUID ${UUID}:`, error);
    return null;
  }
};

// Função para obter configurações do usuário pelo ID do usuário
export const getUserConfigByUserId = async (idUser: number): Promise<ConfigUserDocument | null> => {
  try {
    const configCollection = collection(db, 'configUser');
    const querySnapshot = await getDocs(configCollection);
    
    let userConfig: ConfigUserDocument | null = null;
    
    querySnapshot.forEach((doc) => {
      const data = doc.data() as ConfigUserDocument;
      if (data.idUser === idUser) {
        userConfig = data;
      }
    });
    
    return userConfig;
  } catch (error) {
    console.error(`Error getting config for user ID ${idUser}:`, error);
    return null;
  }
};

// Função para carregar configurações do usuário com fallback para localStorage
export const loadUserSettings = async (idUser: number = 1): Promise<SettingsJson> => {
  try {
    // Tentar obter do Firestore
    const userConfig = await getUserConfigByUserId(idUser);
    
    if (userConfig) {
      return JSON.parse(userConfig.settingsJson) as SettingsJson;
    }
    
    // Tentar obter do localStorage
    const localSettings = localStorage.getItem('user-settings');
    if (localSettings) {
      try {
        const parsedSettings = JSON.parse(localSettings) as SettingsJson;
        
        // Sincronizar com o Firestore se possível
        saveUserConfig(parsedSettings, idUser).catch(error => {
          console.error('Error syncing local settings to Firestore:', error);
        });
        
        return parsedSettings;
      } catch (error) {
        console.error('Error parsing local settings:', error);
      }
    }
    
    // Usar configurações padrão
    return defaultSettings;
  } catch (error) {
    console.error('Error loading user settings:', error);
    return defaultSettings;
  }
};

// Função para salvar configurações com suporte offline
export const saveUserSettings = async (
  settings: SettingsJson,
  idUser: number = 1
): Promise<void> => {
  try {
    // Salvar no localStorage para acesso offline
    localStorage.setItem('user-settings', JSON.stringify(settings));
    
    // Tentar salvar no Firestore
    await saveUserConfig(settings, idUser);
  } catch (error) {
    console.error('Error saving user settings:', error);
    
    // Garantir que pelo menos o localStorage foi atualizado
    localStorage.setItem('user-settings', JSON.stringify(settings));
  }
};

// Função para testar a conexão com o Firestore e a capacidade de salvar/recuperar configurações
export const testFirestoreConnection = async (): Promise<boolean> => {
  try {
    console.log("Iniciando teste de conexão com o Firestore...");
    
    // Criar configurações de teste
    const testSettings: SettingsJson = {
      ...defaultSettings,
      theme: 'dark',
      language: 'pt-BR',
      notifications: {
        email: true,
        push: false,
        sms: true
      }
    };
    
    console.log("Configurações de teste:", testSettings);
    
    // Salvar no Firestore
    console.log("Salvando configurações no Firestore...");
    const uuid = await saveUserConfig(testSettings, 999, 1, 'test');
    console.log(`Configurações salvas com UUID: ${uuid}`);
    
    // Recuperar do Firestore
    console.log("Recuperando configurações do Firestore...");
    const retrievedSettings = await getUserConfig(uuid);
    console.log("Configurações recuperadas:", retrievedSettings);
    
    // Verificar se os dados recuperados correspondem aos dados salvos
    const isEqual = JSON.stringify(retrievedSettings) === JSON.stringify(testSettings);
    console.log(`Teste de igualdade: ${isEqual ? 'PASSOU' : 'FALHOU'}`);
    
    return isEqual;
  } catch (error) {
    console.error("Erro durante o teste do Firestore:", error);
    return false;
  }
};
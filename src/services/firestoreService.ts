import { db } from './firebase';
import { doc, setDoc, getDoc, collection, Timestamp, getDocs } from 'firebase/firestore';

// Interface for API key document
interface ApiKeyDocument {
  nameProvider: string;
  environment: string;
  apiKey: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  updatedBy: string;
}

// Interface for generic data document
interface GenericDataDocument {
  key: string;
  value: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  updatedBy: string;
}

// Function to check Firestore connectivity
export const checkFirestoreConnection = async (): Promise<boolean> => {
  try {
    // Verificar se a configuração do Firebase é válida
    const firebaseApp = db?.app;
    if (!firebaseApp) {
      console.error('Firebase app not initialized');
      return false;
    }

    // Tentar obter um documento com timeout para evitar bloqueios longos
    const timeoutPromise = new Promise<boolean>((_, reject) => {
      setTimeout(() => reject(new Error('Firestore connection timeout')), 5000);
    });

    const connectionPromise = new Promise<boolean>(async (resolve) => {
      try {
        // Tentar obter um documento do Firestore para verificar conectividade
        const docRef = doc(db, 'apisKeys', 'connectivity_test');
        await getDoc(docRef);
        resolve(true);
      } catch (error) {
        console.error('Error connecting to Firestore:', error);
        resolve(false);
      }
    });

    // Usar o que resolver primeiro: ou a conexão bem-sucedida ou o timeout
    return await Promise.race([connectionPromise, timeoutPromise]) as boolean;
  } catch (error) {
    console.error('Error checking Firestore connection:', error);
    return false;
  }
};

// Function to save API key to Firestore
export const saveApiKeyToFirestore = async (
  provider: 'gemini' | 'deepseek' | 'elevenlabs' | 'config',
  apiKey: string,
  environment: string = 'production',
  userId: string = 'system'
): Promise<void> => {
  try {
    const docRef = doc(db, 'apisKeys', provider);
    
    const apiKeyDoc: ApiKeyDocument = {
      nameProvider: provider,
      environment: environment,
      apiKey: apiKey,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      createdBy: userId,
      updatedBy: userId
    };
    
    await setDoc(docRef, apiKeyDoc);
    console.log(`${provider} API key saved to Firestore`);
  } catch (error) {
    console.error(`Error saving ${provider} API key to Firestore:`, error);
    throw error;
  }
};

// Function to get API key from Firestore
export const getApiKeyFromFirestore = async (
  provider: 'gemini' | 'deepseek' | 'elevenlabs' | 'config'
): Promise<string | null> => {
  try {
    const docRef = doc(db, 'apisKeys', provider);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data() as ApiKeyDocument;
      return data.apiKey;
    } else {
      console.log(`No ${provider} API key found in Firestore`);
      return null;
    }
  } catch (error) {
    console.error(`Error getting ${provider} API key from Firestore:`, error);
    return null;
  }
};

// Function to save generic data to Firestore
export const saveDataToFirestore = async (
  key: string,
  value: string,
  userId: string = 'system'
): Promise<void> => {
  try {
    const docRef = doc(db, 'appData', key);
    
    const dataDoc: GenericDataDocument = {
      key: key,
      value: value,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      createdBy: userId,
      updatedBy: userId
    };
    
    await setDoc(docRef, dataDoc);
    console.log(`Data with key "${key}" saved to Firestore`);
  } catch (error) {
    console.error(`Error saving data with key "${key}" to Firestore:`, error);
    throw error;
  }
};

// Function to get generic data from Firestore
export const getDataFromFirestore = async (
  key: string
): Promise<string | null> => {
  try {
    console.log(`[getDataFromFirestore] Attempting to get document with key "${key}" from 'appData' collection`);
    
    const docRef = doc(db, 'appData', key);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data() as GenericDataDocument;
      console.log(`[getDataFromFirestore] Document found for key "${key}". Document data:`, data);
      
      if (data.value) {
        console.log(`[getDataFromFirestore] Value field found in document. Length: ${data.value.length} chars`);
        return data.value;
      } else {
        console.log(`[getDataFromFirestore] Value field is empty or undefined in document:`, data);
        return null;
      }
    } else {
      console.log(`[getDataFromFirestore] No document found for key "${key}" in 'appData' collection`);
      return null;
    }
  } catch (error) {
    console.error(`[getDataFromFirestore] Error getting data with key "${key}" from Firestore:`, error);
    return null;
  }
};

// Function to list all API keys from Firestore
export const listApiKeysFromFirestore = async (): Promise<ApiKeyDocument[]> => {
  try {
    const apiKeysCollection = collection(db, 'apisKeys');
    const querySnapshot = await getDocs(apiKeysCollection);
    
    const apiKeys: ApiKeyDocument[] = [];
    querySnapshot.forEach((doc) => {
      apiKeys.push(doc.data() as ApiKeyDocument);
    });
    
    return apiKeys;
  } catch (error) {
    console.error('Error listing API keys from Firestore:', error);
    return [];
  }
};
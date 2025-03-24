
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  serverTimestamp,
  where 
} from "firebase/firestore";
import { db } from "./firebase";
import { Message, Chat } from "@/types";
import { v4 as uuidv4 } from "uuid";

// Collections
const CHATS_COLLECTION = "chats";
const MESSAGES_COLLECTION = "messages";

// Save a new message to Firestore
export const saveMessage = async (chatId: string, message: Omit<Message, "id">): Promise<Message> => {
  try {
    const messageWithTimestamp = {
      ...message,
      createdAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, CHATS_COLLECTION, chatId, MESSAGES_COLLECTION), messageWithTimestamp);
    
    return {
      id: docRef.id,
      ...message
    };
  } catch (error) {
    console.error("Error saving message:", error);
    throw error;
  }
};

// Get all messages for a chat
export const getChatMessages = async (chatId: string): Promise<Message[]> => {
  try {
    const q = query(
      collection(db, CHATS_COLLECTION, chatId, MESSAGES_COLLECTION),
      orderBy("createdAt", "asc")
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        content: data.content,
        role: data.role,
        createdAt: data.createdAt?.toDate() || new Date(),
      };
    });
  } catch (error) {
    console.error("Error getting chat messages:", error);
    throw error;
  }
};

// Create a new chat
export const createChat = async (chat: Omit<Chat, "id">): Promise<Chat> => {
  try {
    const chatWithTimestamp = {
      ...chat,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, CHATS_COLLECTION), chatWithTimestamp);
    
    // Add system message if it exists
    const systemMessage = chat.messages.find(m => m.role === "system");
    if (systemMessage) {
      await saveMessage(docRef.id, systemMessage);
    }
    
    return {
      id: docRef.id,
      ...chat
    };
  } catch (error) {
    console.error("Error creating chat:", error);
    throw error;
  }
};

// Get all chats
export const getChats = async (): Promise<Chat[]> => {
  try {
    const q = query(
      collection(db, CHATS_COLLECTION),
      orderBy("updatedAt", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    
    const chats = await Promise.all(querySnapshot.docs.map(async (doc) => {
      const data = doc.data();
      
      // Get messages for this chat
      const messages = await getChatMessages(doc.id);
      
      return {
        id: doc.id,
        title: data.title,
        messages: messages,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        isCurrent: data.isCurrent || false,
        type: data.type || "chest-pain",
      };
    }));
    
    return chats;
  } catch (error) {
    console.error("Error getting chats:", error);
    throw error;
  }
};

// Update chat title
export const updateChatTitle = async (chatId: string, title: string): Promise<void> => {
  try {
    const chatRef = doc(db, CHATS_COLLECTION, chatId);
    
    await updateDoc(chatRef, {
      title: title,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error updating chat title:", error);
    throw error;
  }
};

// Set current chat
export const setCurrentChat = async (chatId: string): Promise<void> => {
  try {
    // First, reset all chats to isCurrent = false
    const chatsQuery = query(
      collection(db, CHATS_COLLECTION),
      where("isCurrent", "==", true)
    );
    
    const querySnapshot = await getDocs(chatsQuery);
    
    // Update all previously current chats
    const updatePromises = querySnapshot.docs.map(doc => 
      updateDoc(doc.ref, { isCurrent: false })
    );
    
    await Promise.all(updatePromises);
    
    // Set the new current chat
    const chatRef = doc(db, CHATS_COLLECTION, chatId);
    await updateDoc(chatRef, { isCurrent: true });
  } catch (error) {
    console.error("Error setting current chat:", error);
    throw error;
  }
};

// Get current chat
export const getCurrentChat = async (): Promise<Chat | null> => {
  try {
    const q = query(
      collection(db, CHATS_COLLECTION),
      where("isCurrent", "==", true),
      orderBy("updatedAt", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    const data = doc.data();
    
    // Get messages for this chat
    const messages = await getChatMessages(doc.id);
    
    return {
      id: doc.id,
      title: data.title,
      messages: messages,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      isCurrent: true,
      type: data.type || "chest-pain",
    };
  } catch (error) {
    console.error("Error getting current chat:", error);
    throw error;
  }
};

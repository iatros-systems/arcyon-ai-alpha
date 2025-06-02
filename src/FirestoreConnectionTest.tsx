import React, { useEffect } from "react";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const FirestoreConnectionTest: React.FC = () => {
  useEffect(() => {
    async function testFirestoreConnection() {
      try {
        const db = getFirestore();
        await setDoc(doc(db, "testConnection", "testDoc"), { timestamp: Date.now() });
        console.log("✅ Conexão com Firestore bem-sucedida!");
        alert("Conexão com Firestore bem-sucedida!");
      } catch (error) {
        console.error("❌ Falha ao conectar ao Firestore:", error);
        alert("Falha ao conectar ao Firestore: " + (error as Error).message);
      }
    }
    testFirestoreConnection();
  }, []);

  return null; // Não renderiza nada na tela
};

export default FirestoreConnectionTest;
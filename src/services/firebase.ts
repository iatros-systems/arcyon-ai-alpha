
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzSyD3f2gJ9M9aV-EXAMPLE_KEY_1234567890",
  authDomain: "iatros-healthcare.firebaseapp.com",
  projectId: "iatros-healthcare",
  storageBucket: "iatros-healthcare.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

export default app;

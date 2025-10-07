// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, orderBy, onSnapshot } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBySY8xhJFEkCk54oiL5Ktv6Hkl5TweqLM",
  authDomain: "animagic-landing.firebaseapp.com",
  projectId: "animagic-landing",
  storageBucket: "animagic-landing.firebasestorage.app",
  messagingSenderId: "171274238722",
  appId: "1:171274238722:web:81d791da7219d10715a01b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Collection name for cotacoes
export const COTACOES_COLLECTION = "cotacoes";

// Export Firebase functions
export { addDoc, getDocs, updateDoc, deleteDoc, doc, collection, query, orderBy, onSnapshot };

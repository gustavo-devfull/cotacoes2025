// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, orderBy, onSnapshot, getDoc, setDoc } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
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

// Initialize Auth
export const auth = getAuth(app);

// Collection names
export const COTACOES_COLLECTION = "cotacoes";
export const USERS_COLLECTION = "users";

// Export Firebase functions
export { 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc, 
  collection, 
  query, 
  orderBy, 
  onSnapshot,
  getDoc,
  setDoc,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type FirebaseUser
};






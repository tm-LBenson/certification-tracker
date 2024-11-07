// src/firebase.tsx
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBxf97mvIOVO01qoRLVxjHVvdSJC0AR_1g",
  authDomain: "checklist-codex.firebaseapp.com",
  projectId: "checklist-codex",
  storageBucket: "checklist-codex.firebasestorage.app",
  messagingSenderId: "598109016281",
  appId: "1:598109016281:web:7e6195529b564e38666ec8",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };

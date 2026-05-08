import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAKx02euHazgvL6J5fZ5774TGTNz_XLtkQ",
  authDomain: "nutriai-2026.firebaseapp.com",
  projectId: "nutriai-2026",
  storageBucket: "nutriai-2026.firebasestorage.app",
  messagingSenderId: "928554333362",
  appId: "1:928554333362:web:eff262661085c4e49085ab",
  measurementId: "G-R6K584ERXF"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);

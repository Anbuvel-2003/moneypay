// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBMB6jiT7FSAWNKLmskwkdCHu_1at0HRlI",
  authDomain: "moneypaypro-f7033.firebaseapp.com",
  projectId: "moneypaypro-f7033",
  storageBucket: "moneypaypro-f7033.firebasestorage.app",
  messagingSenderId: "711645948960",
  appId: "1:711645948960:web:cbcaedd8c277a8f394a045"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const realtimeDb = getDatabase(app);

export default app;
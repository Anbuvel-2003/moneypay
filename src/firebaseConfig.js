  // Import the functions you need from the SDKs you need
  import { initializeApp } from "firebase/app";
  import { getAuth } from "firebase/auth";
  import { getFirestore } from "firebase/firestore";
  import { getDatabase } from "firebase/database";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyDT5VrR63CWBlew_WO8qFzB4Lgh99GsfzM",
    authDomain: "moneypay-798a0.firebaseapp.com",
    projectId: "moneypay-798a0",
    storageBucket: "moneypay-798a0.firebasestorage.app",
    messagingSenderId: "834476116019",
    appId: "1:834476116019:web:3d5d1b5f72748cb56e7b46",
    measurementId: "G-H7TBXS3WHJ"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  export const auth = getAuth(app);
  export const db= getFirestore(app);
  export const realtimeDb = getDatabase(app);

  export default app;
  
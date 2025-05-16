import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// const firebaseConfig = {
//   // You'll need to replace these with your Firebase config
//   apiKey: "YOUR_API_KEY",
//   authDomain: "YOUR_AUTH_DOMAIN",
//   projectId: "YOUR_PROJECT_ID",
//   storageBucket: "YOUR_STORAGE_BUCKET",
//   messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
//   appId: "YOUR_APP_ID"
// };

const firebaseConfig = {
    apiKey: "AIzaSyBQ4Z6GZzrXJesqgRGKDZhbpE0xOV3RMHU",
    authDomain: "life-saver-3.firebaseapp.com",
    projectId: "life-saver-3",
    storageBucket: "life-saver-3.firebasestorage.app",
    messagingSenderId: "42109103150",
    appId: "1:42109103150:web:88006a2c171f97b6fd43bf",
    measurementId: "G-7065T2XN2R"
  };

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); 
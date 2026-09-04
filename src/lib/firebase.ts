import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBR6n6nYGpGyzGhr3zPnwIsULX6ceiGLqE",
  authDomain: "monky-58ab1.firebaseapp.com",
  projectId: "monky-58ab1",
  storageBucket: "monky-58ab1.firebasestorage.app",
  messagingSenderId: "69346813139",
  appId: "1:69346813139:web:a2ae3b5e97b3da94d3a026",
  measurementId: "G-YG57XNK1BW"
};

// Initialize Firebase (check if already initialized to prevent duplicate app errors in Next.js)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Analytics only on the client side
let analytics: any = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export const auth = getAuth(app);
export const db = getFirestore(app);
export { app, analytics };

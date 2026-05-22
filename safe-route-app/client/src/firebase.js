import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCNX9E07BQUeTF6wOxHZwXUtaCbl24V1Hc",
  authDomain: "trinetra-3286d.firebaseapp.com",
  projectId: "trinetra-3286d",
  storageBucket: "trinetra-3286d.firebasestorage.app",
  messagingSenderId: "317649840566",
  appId: "1:317649840566:web:541fda529f50daaa76b917",
  measurementId: "G-6RHXP10QQX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export instances for the rest of the app
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;

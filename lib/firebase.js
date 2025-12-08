// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCUj5OdsTd1bz4qFbsPN2d4MMzLayJhZFE",
  authDomain: "smart-moss-panel.firebaseapp.com",
  projectId: "smart-moss-panel",
  storageBucket: "smart-moss-panel.firebasestorage.app",
  messagingSenderId: "892979604814",
  appId: "1:892979604814:web:225ee8c4b8c9ace63dc21f",
  measurementId: "G-GG99G75Z8S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Analytics hanya di browser, bukan di server-side
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

const db = getFirestore(app);

export { db, analytics };
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBeSuvD_bvgo3QYPv5ZP4koeb5xZBD95-M",
  authDomain: "km-lineup-builder.firebaseapp.com",
  projectId: "km-lineup-builder",
  storageBucket: "km-lineup-builder.firebasestorage.app",
  messagingSenderId: "171794451087",
  appId: "1:171794451087:web:f93a9b4d974ab2ea577efa",
  measurementId: "G-B2V5XJDDJV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
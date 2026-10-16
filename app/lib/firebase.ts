// copy pasted from firebase setup and config
// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // added this for authentication feature 
import {getFirestore} from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDfVLnt12bMEARaSL-X8eBwT-RDgpQn0cw",
  authDomain: "wordleroyale-52773.firebaseapp.com",
  projectId: "wordleroyale-52773",
  storageBucket: "wordleroyale-52773.firebasestorage.app",
  messagingSenderId: "659625531660",
  appId: "1:659625531660:web:f75a66c7d9f8e8aa2b1129",
  measurementId: "G-8TSZLP6DXH"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// firestore configs
export const auth = getAuth(app);
export const db = getFirestore(app);

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBtqMROOOUm0p7ZLbnFPCPkMWXjz1za0fc",
  authDomain: "common-shop-e8b1a.firebaseapp.com",
  databaseURL: "https://common-shop-e8b1a-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "common-shop-e8b1a",
  storageBucket: "common-shop-e8b1a.firebasestorage.app",
  messagingSenderId: "530033163258",
  appId: "1:530033163258:web:3a4336791df57b5171c243",
  measurementId: "G-V2PG855H9D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getDatabase(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, analytics, db, auth, storage };

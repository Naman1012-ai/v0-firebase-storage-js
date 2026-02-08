import { initializeApp, getApps, getApp } from "firebase/app"
import { getDatabase } from "firebase/database"

const firebaseConfig = {
  apiKey: "AIzaSyCzQbkW-7lEE26PicC_VxaDc3VCwGdGUdI",
  authDomain: "biolynx-54d12.firebaseapp.com",
  databaseURL: "https://biolynx-54d12-default-rtdb.firebaseio.com",
  projectId: "biolynx-54d12",
  storageBucket: "biolynx-54d12.firebasestorage.app",
  messagingSenderId: "828008568380",
  appId: "1:828008568380:web:e9a",
}

// Initialize Firebase only once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
const database = getDatabase(app)

export { app, database }

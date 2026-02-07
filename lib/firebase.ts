import { initializeApp, getApps } from "firebase/app"
import { getDatabase } from "firebase/database"
import { getAuth } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyD7sy6fRvdOfiQ0kkk4qgqMLSr2o1NXpcA",
  authDomain: "biolynx-db1.firebaseapp.com",
  databaseURL: "https://biolynx-db1-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "biolynx-db1",
  storageBucket: "biolynx-db1.firebasestorage.app",
  messagingSenderId: "307559800167",
  appId: "1:307559800167:web:85a1bd438911921022a3c2",
  measurementId: "G-EL6HVCWNQN",
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
const database = getDatabase(app)
const auth = getAuth(app)

export { app, database, auth }

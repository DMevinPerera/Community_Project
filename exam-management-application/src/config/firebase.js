import { initializeApp } from "firebase/app";
import { 
  getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc 
} from "firebase/firestore";
import { getStorage } from "firebase/storage"; // Import the getStorage function

const firebaseConfig = {
  apiKey: "AIzaSyCh_tvbcHNDt9P0mayim0FwFU9UF8nCARM",
  authDomain: "smart-tuition-794cf.firebaseapp.com",
  projectId: "smart-tuition-794cf",
  storageBucket: "smart-tuition-794cf.appspot.com",
  messagingSenderId: "721357334677",
  appId: "1:721357334677:web:c0a4364901a5072a18939c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore and Storage
const db = getFirestore(app);
const storage = getStorage(app);

// Reference to a Firestore collection
const categoriesCollectionRef = collection(db, "categories");

// Export Firestore functions and references
export { db, storage, addDoc, getDocs, doc, updateDoc, deleteDoc, categoriesCollectionRef };

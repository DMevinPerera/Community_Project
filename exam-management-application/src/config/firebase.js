import { initializeApp } from "firebase/app";
import { 
  getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where 
} from "firebase/firestore";
import { getStorage } from "firebase/storage"; // Import the getStorage function
import { getAuth } from "firebase/auth"; // Import the getAuth function

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

// Initialize Firestore, Storage, and Auth
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app); // Initialize Firebase Auth

// Reference to a Firestore collection
const categoriesCollectionRef = collection(db, "categories");

export const deleteQuestionFromFirestore = async (quesId) => {
  try {
    const questionRef = doc(db, "questions", quesId);
    await deleteDoc(questionRef);
    console.log("Question deleted successfully");
  } catch (error) {
    console.error("Error deleting question:", error);
  }
};

// Export Firestore functions and references
export { 
  db, 
  storage, 
  auth, // Export auth
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  categoriesCollectionRef,
  query,
  where
};
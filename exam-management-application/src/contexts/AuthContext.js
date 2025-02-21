import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../config/firebase"; // Import Firebase auth

// Create the AuthContext
const AuthContext = createContext();

// Custom hook to use the AuthContext
export function useAuth() {
  return useContext(AuthContext);
}

// AuthProvider component to wrap your app
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user); // Set the current user
      setLoading(false); // Set loading to false once the user is fetched
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  // Value to be provided by the context
  const value = {
    currentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children} {/* Render children only when not loading */}
    </AuthContext.Provider>
  );
}
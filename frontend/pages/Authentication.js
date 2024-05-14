import React, { createContext, useState, useEffect, useContext } from "react";
import * as SecureStore from "expo-secure-store";

const AuthContext = createContext({});

const AUTH_KEY = "isAuthenticated";

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load authentication status from SecureStore
  const loadAuthStatus = async () => {
    try {
      const storedAuthStatus = await SecureStore.getItemAsync(AUTH_KEY);
      if (storedAuthStatus) {
        setIsAuthenticated(storedAuthStatus === "true");
      }
    } catch (error) {
      console.error("Failed to load auth status:", error);
    }
  };

  // Save authentication status to SecureStore
  const saveAuthStatus = async (status) => {
    try {
      await SecureStore.setItemAsync(AUTH_KEY, status.toString());
    } catch (error) {
      console.error("Failed to save auth status:", error);
    }
  };

  // Load authentication status on app startup
  useEffect(() => {
    loadAuthStatus();
  }, []);

  // Update SecureStore when authentication status changes
  useEffect(() => {
    saveAuthStatus(isAuthenticated);
  }, [isAuthenticated]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
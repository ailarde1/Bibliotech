import React, { createContext, useState, useEffect, useContext } from "react";

const AuthContext = createContext({});


const AUTH_KEY = "isAuthenticated";

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext({});

// Sends Authentication status back to children
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

// A hook to use the auth context
export const useAuth = () => useContext(AuthContext);
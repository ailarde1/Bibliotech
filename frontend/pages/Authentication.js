import React, { createContext, useState, useEffect, useContext } from "react";

const AuthContext = createContext({});

<<<<<<< Updated upstream
// Sends Authentication status back to children
=======

const AUTH_KEY = "isAuthenticated";

>>>>>>> Stashed changes
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

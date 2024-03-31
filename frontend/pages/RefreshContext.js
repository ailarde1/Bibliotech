import React, { createContext, useContext, useState, useCallback } from 'react';


//needed for auto refreshing pages

const RefreshContext = createContext();

export const useRefresh = () => useContext(RefreshContext);

export const RefreshProvider = ({ children }) => {
  const [refreshBookshelf, setRefreshBookshelf] = useState(false);

  const triggerRefresh = useCallback(() => {
    setRefreshBookshelf(true);
  }, []);

  const resetRefresh = useCallback(() => {
    setRefreshBookshelf(false);
  }, []);

  return (
    <RefreshContext.Provider value={{ refreshBookshelf, triggerRefresh, resetRefresh }}>
      {children}
    </RefreshContext.Provider>
  );
};
import React, { createContext, useContext, useEffect, useState } from "react";
import { DeviceEventEmitter } from "react-native";

const RefreshContext = createContext();

export const useRefresh = () => useContext(RefreshContext);

export const RefreshProvider = ({ children }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(null);

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      "refreshEvent",
      (event) => {
        setRefreshTrigger(event);
      }
    );

    return () => subscription.remove();
  }, []);

  const triggerRefresh = (page) => {
    DeviceEventEmitter.emit("refreshEvent", page);
  };

  return (
    <RefreshContext.Provider value={{ refreshTrigger, triggerRefresh }}>
      {children}
    </RefreshContext.Provider>
  );
};

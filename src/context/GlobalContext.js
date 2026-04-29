import React, { createContext, useContext, useState } from "react";

const GlobalContext = createContext();

export function GlobalProvider({ children }) {
  const [cameraUrl, setCameraUrl] = useState("192.168.0.20");
  const [cameraPort, setCameraPort] = useState("8765");

  const [droneApiUrl, setDroneApiUrl] = useState("192.168.0.20")
  const [droneApiPort, setDroneApiPort] = useState("8080");

  return (
    <GlobalContext.Provider value={{ 
        cameraUrl, setCameraUrl,
        cameraPort, setCameraPort,
        droneApiUrl, setDroneApiUrl,
        droneApiPort, setDroneApiPort,
    }}>
      {children}
    </GlobalContext.Provider>
  );
}

export function useGlobal() {
  return useContext(GlobalContext);
}
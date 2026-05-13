import React, { createContext, useContext, useState } from "react";

const GlobalContext = createContext();

export function GlobalProvider({ children }) {
  const [cameraUrl, setCameraUrl] = useState("127.0.0.1");
  const [cameraPort, setCameraPort] = useState("8765");

  const [droneApiUrl, setDroneApiUrl] = useState("192.168.0.20")
  const [droneApiPort, setDroneApiPort] = useState("8080");
  const [recordMode, setRecordMode] = useState("live_stream"); // 'api', 'live_stream' ou 'rtmp'
  const [rtmpUrl, setRtmpUrl] = useState("rtmp://192.168.0.20/live/stream");
  const [rtmpPreviewFps, setRtmpPreviewFps] = useState("60");


  return (
    <GlobalContext.Provider value={{
      cameraUrl, setCameraUrl,
      cameraPort, setCameraPort,
      droneApiUrl, setDroneApiUrl,
      droneApiPort, setDroneApiPort,
      recordMode, setRecordMode,
      rtmpUrl, setRtmpUrl,
      rtmpPreviewFps, setRtmpPreviewFps,
    }}>

      {children}
    </GlobalContext.Provider>
  );
}

export function useGlobal() {
  return useContext(GlobalContext);
}

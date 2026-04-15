import React, { useEffect, useState } from "react";

export default function TrainTerminal() {
  const [logs, setLogs] = useState("");

  useEffect(() => {
    const socket = new WebSocket(
      `ws://${window.location.hostname}:3001/convert-stream`
    );

    socket.onmessage = (event) => {
      setLogs((prev) => prev + event.data);
    };

    socket.onclose = () => {
      setLogs((prev) => prev + "\n[conexão encerrada]\n");
    };

    return () => {
      socket.close();
    };
  }, []);

  return (
    <pre
      style={{
        width: "100%",
        height: "100%",
        margin: 0,
        padding: "12px",
        background: "#111",
        color: "#00ff88",
        overflow: "auto",
        fontFamily: "monospace",
        whiteSpace: "pre-wrap",
      }}
    >
      {logs}
    </pre>
  );
}
import React, { useEffect, useState, useRef } from "react";
import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import StopIcon from '@mui/icons-material/Stop';

export default function TrainTerminal({ endpoint, resetKey, stopProccesFunction }) {
  const [logs, setLogs] = useState("");
  const [connected, setConnected] = useState(false);
  const [loadingStopProcess, setLoadingStopProcess] = useState(false)

  const containerRef = useRef(null);

  //Limpa logs automaticamente quando resetKey muda
  useEffect(() => { setLogs("") }, [resetKey]);

  useEffect(() => {
    if (!endpoint) return;

    const socket = new WebSocket(`ws://${window.location.hostname}:3001/${endpoint}`);

    socket.onopen = () => { setConnected(true) };
    socket.onmessage = (event) => { setLogs((prev) => prev + event.data) };
    socket.onerror = () => { setLogs((prev) => prev + "\n[erro na conexão websocket]\n") }

    socket.onclose = () => {
      setConnected(false)
      setLogs((prev) => prev + "\n[conexão encerrada]\n")
    }

    return () => { socket.close() }

  }, [endpoint]);

  useEffect(() => {
    if (containerRef.current) 
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
  }, [logs]);

  const handleStopProcess = async () => {
    try {
      setLoadingStopProcess(true)
      await stopProccesFunction(endpoint)
    } catch (error) {
      console.error("Erro ao parar processo:", error);
    }finally{
      setLoadingStopProcess(false)
    }
  }

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#111",
        border: "1px solid #2a2a2a",
      }}
    >
      <Stack

        direction="row"
        alignItems="center"
        sx={{
          width: "100%",
          px: 1.5,
          py: 1,
          backgroundColor: "#1b1b1b",
          borderBottom: "1px solid #2a2a2a",
          boxSizing: "border-box",
        }}
      >
        {/* LADO ESQUERDO */}
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography
            variant="body2"
            sx={{ color: "#fff", fontWeight: 600 }}
          >
            Terminal
          </Typography>

          <Chip
            size="small"
            label={connected ? "Conectado" : "Desconectado"}
            color={connected ? "success" : "warning"}
          />
        </Stack>

        <Button
          variant="contained"
          size="small"
          color="error"
          startIcon={<StopIcon />}
          sx={{ marginLeft: "auto", marginRight: 0 }}
          disabled={loadingStopProcess}
          onClick={handleStopProcess}
        >
          Parar processo
        </Button>
      </Stack>

      <Box
        ref={containerRef}
        component="pre"
        sx={{
          flex: 1,
          minHeight: 0,
          m: 0,
          p: 1.5,
          overflow: "auto",
          fontFamily: "monospace",
          whiteSpace: "pre-wrap",
          color: "#00ff88",
          backgroundColor: "#111",
        }}
      >
        {logs}
      </Box>
    </Box>
  );
}
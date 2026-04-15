import React, { useRef, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Chip,
} from "@mui/material";
import JSMpeg from "jsmpeg-player";

export default function CameraWindow() {
  const canvasRef = useRef(null);
  const playerRef = useRef(null);

  const [status, setStatus] = useState("Desconectado");

  const WS_URL = "ws://192.168.0.20:8765";

  const handleStart = () => {
    if (playerRef.current) return;

    playerRef.current = new JSMpeg.Player(WS_URL, {
      canvas: canvasRef.current,
      autoplay: true,
      audio: false,
    });

    setStatus("Transmitindo");
  };

  const handleStop = () => {
    if (playerRef.current) {
      playerRef.current.destroy();
      playerRef.current = null;
      setStatus("Desconectado");
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%", // 🔥 ocupa tudo do pai
        display: "flex"
      }}
    >
      <Card
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#d9eaff",
          borderRadius: 0, // opcional: remove borda arredondada
        }}
      >
        <CardContent
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            p: 1,
          }}
        >
          {/* Header */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 1 }}
          >
            <Typography variant="subtitle1">Vídeo</Typography>
            <Chip
              label={status}
              size="small"
              color={
                status === "Transmitindo"
                  ? "success"
                  : status === "Erro"
                  ? "error"
                  : "default"
              }
            />
          </Stack>

          {/* Botões */}
          <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
            <Button size="small" variant="contained" onClick={handleStart}>
              Start
            </Button>
            <Button size="small" variant="contained" color="error" onClick={handleStop}>
              Stop
            </Button>
          </Stack>

          {/* Área do vídeo */}
          <Box
            sx={{
              flex: 1, // 🔥 ocupa todo espaço restante
              backgroundColor: "#000",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              overflow: "hidden",
            }}
          >
            <canvas
              ref={canvasRef}
              style={{
                width: "100%",
                height: "100%", // 🔥 importante
                objectFit: "contain",
              }}
            />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
import React, { useRef, useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Chip,
  CircularProgress,
} from "@mui/material";

import JSMpeg from "jsmpeg-player"; 
import { startRecord, stopRecord } from "../apiRequests/camera";

export default function CameraWindow() {
  const canvasRef = useRef(null);
  const playerRef = useRef(null);
  const firstFrameRenderedRef = useRef(false);

  const [status, setStatus] = useState("Desconectado");
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  const WS_URL = "ws://192.168.0.20:8765";

  const destroyPlayer = () => {
    if (playerRef.current) {
      try {
        playerRef.current.destroy();
      } catch (err) {
        console.error("Erro ao destruir player:", err);
      } finally {
        playerRef.current = null;
      }
    }

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    firstFrameRenderedRef.current = false;
  };

  const handleStart = async () => {
    if (!canvasRef.current || loading) return;

    setLoading(true);
    setLoadingMessage("Iniciando vídeo...");
    setStatus("Conectando");

    try {
      if (playerRef.current) {
        destroyPlayer();
      }

      firstFrameRenderedRef.current = false;

      playerRef.current = new JSMpeg.Player(WS_URL, {
        canvas: canvasRef.current,
        autoplay: true,
        audio: false,
        disableGl: true,

        onPlay: () => {
          setStatus("Conectando");
        },

        onVideoDecode: () => {
          if (!firstFrameRenderedRef.current) {
            firstFrameRenderedRef.current = true;
            setLoading(false);
            setLoadingMessage("");
            setStatus("Transmitindo");
          }
        },

        onPause: () => {
          if (!firstFrameRenderedRef.current) {
            setLoading(false);
            setLoadingMessage("");
            setStatus("Desconectado");
          }
        },

        onEnded: () => {
          setLoading(false);
          setLoadingMessage("");
          setStatus("Desconectado");
        },
      });

      // fallback: se nada chegar em alguns segundos, assume erro de conexão/stream
      setTimeout(() => {
        if (!firstFrameRenderedRef.current && playerRef.current) {
          setLoading(false);
          setLoadingMessage("");
          setStatus("Erro");
        }
      }, 5000);
    } catch (err) {
      console.error("Erro ao iniciar player:", err);
      setLoading(false);
      setLoadingMessage("");
      setStatus("Erro");
    }
  };

  const handleStop = async () => {
    if (loading) return;

    setLoading(true);
    setLoadingMessage("Parando vídeo...");

    try {
      destroyPlayer();
      setStatus("Desconectado");
    } finally {
      setLoading(false);
      setLoadingMessage("");
    }
  };

  useEffect(() => {
    return () => {
      destroyPlayer();
    };
  }, []);

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
      }}
    >
      <Card
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#d9eaff",
          borderRadius: 0,
          minHeight: 0,
        }}
      >
        <CardContent
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            p: 1,
            minHeight: 0,
          }}
        >
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
                  : status === "Conectando"
                  ? "warning"
                  : "default"
              }
            />
          </Stack>

          <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
            <Button
              size="small"
              variant="contained"
              onClick={handleStart}
              disabled={loading || status === "Transmitindo" || status === "Conectando"}
            >
              Start
            </Button>

            <Button
              size="small"
              variant="contained"
              color="error"
              onClick={handleStop}
              disabled={loading || status === "Desconectado"}
            >
              Stop
            </Button>
          </Stack>

          <Box
            sx={{
              flex: 1,
              backgroundColor: "#000",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              overflow: "hidden",
              minHeight: 0,
              position: "relative",
            }}
          >
            <canvas
              ref={canvasRef}
              width={1280}
              height={720}
              style={{
                width: "100%",
                height: "100%",
                display: "block",
              }}
            />

            {loading && (
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  backgroundColor: "rgba(0, 0, 0, 0.65)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 2,
                  zIndex: 2,
                }}
              >
                <CircularProgress color="inherit" />
                <Typography sx={{ color: "#fff" }}>
                  {loadingMessage || "Carregando..."}
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
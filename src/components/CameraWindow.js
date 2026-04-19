import React, { useRef, useState, useEffect } from "react";
import { useSnackbar } from "../context/SnackbarContext";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  CircularProgress,
  Switch,
  FormControlLabel
} from "@mui/material";

import JSMpeg from "jsmpeg-player"; 
//import { startRecord, stopRecord } from "../apiRequests/camera";

export default function CameraWindow() {

  const WS_URL = "ws://192.168.0.20:8765";
  const TIMEOUT_CONNECTION = 5000

  const canvasRef = useRef(null);
  const playerRef = useRef(null);
  const firstFrameRenderedRef = useRef(false);

  const { showSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  const [isSwitchOn, setIsSwitchOn] = useState(false);


  const handleToggle = async (event) => {
    const checked = event.target.checked;

    if (loading) return;

    setIsSwitchOn(checked);

    if (checked) 
      await handleStart();
    else 
      await handleStop();

  };

  const destroyPlayer = () => {
    if (playerRef.current) {
      try {
        playerRef.current.destroy();
      } catch (err) {
        showSnackbar("Erro ao encerrar camera", "error");
      } finally {
        playerRef.current = null;
      }
    }

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) 
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    firstFrameRenderedRef.current = false;
  };

  const handleStart = async () => {
    if (!canvasRef.current) return;

    setLoading(true);
    setLoadingMessage("Iniciando vídeo...");

    try {
      if (playerRef.current) 
        destroyPlayer()

      firstFrameRenderedRef.current = false;

      playerRef.current = new JSMpeg.Player(WS_URL, {
        canvas: canvasRef.current,
        autoplay: true,
        audio: false,
        disableGl: true,

        onVideoDecode: () => {
          if (!firstFrameRenderedRef.current) {
            firstFrameRenderedRef.current = true
            setLoading(false)
          }
        },
      })

      setTimeout(() => {
        if (!firstFrameRenderedRef.current) {
          setLoading(false)
          setIsSwitchOn(false)
          showSnackbar(`Tentativa de conexão ultrapassou o limite de ${TIMEOUT_CONNECTION/1000}s`, "error")
        }
      }, TIMEOUT_CONNECTION)

    } catch (err) {
      setLoading(false);
      setIsSwitchOn(false);
      showSnackbar("Erro inesperado ocorreu", "error", 6000);
    }
  };

  const handleStop = async () => {
    if (loading) return;

    setLoading(true);
    setLoadingMessage("Parando vídeo...");

    try {
      destroyPlayer();
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
    <Box sx={{ width: "100%", height: "100%", display: "flex",}}>
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
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
          <FormControlLabel
            control={
              <Switch
                checked={isSwitchOn}
                onChange={handleToggle}
                disabled={loading}
              />
            }
            label={isSwitchOn ? "Ligado" : "Desligado"}
          />
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
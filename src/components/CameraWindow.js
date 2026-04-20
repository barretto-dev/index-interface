import React, { useRef, useState } from "react";
import { useSnackbar } from "../context/SnackbarContext";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  CircularProgress,
  Switch,
  FormControlLabel,
} from "@mui/material";

import JSMpeg from "jsmpeg-player"; 
import { startRecord, stopRecord } from "../apiRequests/camera";

export default function CameraWindow() {

  const WS_URL = "ws://192.168.0.20:8765";
  const TIMEOUT_CONNECTION = 15000

  const canvasRef = useRef(null);
  const playerRef = useRef(null);
  const firstFrameRenderedRef = useRef(false);

  const { showSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isRecordOn, setIsRecordOn] = useState(false);


  const handleCameraToggle = async (event) => {
    const checked = event.target.checked;

    if (loading) return;

    if(isRecordOn){
      showSnackbar("Por favor pare a gravação antes de desligar a camera", "warning")
      return
    }

    setIsCameraOn(checked);

    if (checked) 
      await handleStartCamera();
    else 
      await handleStopCamera();

  };

  const handleStartCamera = async () => {
    if (!canvasRef.current) return;

    setLoading(true);
    setLoadingMessage("Iniciando vídeo...");

    try {
      if (playerRef.current) destroyPlayer()

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
          setIsCameraOn(false)
          showSnackbar(`Tentativa de conexão ultrapassou o limite de ${TIMEOUT_CONNECTION/1000}s`, "error")
        }
      }, TIMEOUT_CONNECTION)

    } catch (err) {
      setLoading(false);
      setIsCameraOn(false);
      showSnackbar("Erro inesperado ocorreu", "error", 6000);
    }
  };

  const handleStopCamera = async () => {
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

  const handleRecordToggle = async (event) => {
    const checked = event.target.checked;

    if (loading) return;

    setIsRecordOn(checked);

    if (checked)
      await handleStartRecord();
    else 
      await handleStopRecord();

  };

  const handleStartRecord = async () => {
    try {
      setLoading(true);
      setLoadingMessage("Iniciando gravação...");
      const {status, msg} = await startRecord();

      if(status === "error") setIsRecordOn(false)
      showSnackbar(msg, status)

    } catch (err) {
      console.error(err);
      showSnackbar("Erro inesperado ocorreu", "error")
      setIsRecordOn(false)
    }finally{
      setLoading(false)
    }
  }

  const handleStopRecord = async () => {
    try {
      setLoading(true);
      setLoadingMessage("Parando gravação...");
      const {status, msg} = await stopRecord();

      if(status === "error") setIsRecordOn(true)
      showSnackbar(msg, status)

    } catch (err) {
      console.error(err);
      showSnackbar("Erro inesperado ocorreu", "error")
      setIsRecordOn(true)
    }finally{
      setLoading(false)
    }
  };

  return (
    <Box sx={{ width: "100%", height: "100%", display: "flex",}}>
      <Card sx={{ flex: 1, display: "flex", flexDirection: "column", backgroundColor: "#d9eaff", borderRadius: 0, minHeight: 0 }}>
        <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column", p: 1, minHeight: 0 }}>

          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
            <FormControlLabel
              control={<Switch checked={isCameraOn} onChange={handleCameraToggle} disabled={loading}/>}
              label={isCameraOn ? "Camera ON" : "Camera OFF"}
            />
            <FormControlLabel
              control={<Switch checked={isRecordOn} onChange={handleRecordToggle}disabled={loading || !isCameraOn}/>}
              label={isRecordOn ? "Record ON" : "Record OFF"}
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
            <canvas ref={canvasRef} width={1280} height={720} style={{ width: "100%", height: "100%", display: "block",}}/>

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
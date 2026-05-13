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
  FormControlLabel,
  IconButton,
} from "@mui/material";

import JSMpeg from '@cycjimmy/jsmpeg-player';
import { startRecord, stopRecord } from "../apiRequests/cameraReq";
import { startGeneration, stopGeneration } from "../apiRequests/pointCloudReq";
import { useGlobal } from "../context/GlobalContext";
import SettingsModal from "./SettingsModal"
import SettingsIcon from '@mui/icons-material/Settings';
import PointCloudWindow from "./PointCloudWindow";

export default function CameraWindow() {

  const CAMERA_WINDOW_BOX_STYLE = { 
    flex: 1,
    backgroundColor: "#000",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    minHeight: 0,
    position: "relative",
  }

  const LOADING_BOX_STYLE = {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 2,
    zIndex: 2,
  }

  const { cameraUrl, cameraPort, recordMode, rtmpUrl, rtmpPreviewFps } = useGlobal()
  const pointCloudWsUrl = process.env.REACT_APP_POINTCLOUD_WS_URL || `ws://${window.location.hostname}:8764`;
  const streamHost = ["127.0.0.1", "localhost", "0.0.0.0"].includes(cameraUrl)
    ? window.location.hostname
    : cameraUrl;
  const cameraWsUrl = "ws://" + streamHost + ":" + cameraPort;


  const [settingsOpen, setSettingsOpen] = React.useState(false);

  const TIMEOUT_CONNECTION = 10000

  const canvasRef = useRef(null);
  const playerRef = useRef(null);
  const firstFrameRenderedRef = useRef(false);
  const connectionTimeoutRef = useRef(null);

  const { showSnackbar } = useSnackbar();

  const [loadingCamera, setLoadingCamera] = useState(false);
  const [loadingCameraMessage, setLoadingCameraMessage] = useState("");

  const [loadingPointcloud, setLoadingPointcloud] = useState(false);
  const [loadingPointcloudMessage, setLoadingPointcloudMessage] = useState("");

  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isRecordOn, setIsRecordOn] = useState(false);
  const [isPointCloudOn, setIsPointCloudOn] = useState(false);
  const [recordTime, setRecordTime] = useState(0); //seconds

  useEffect(() => {
    let interval = null;

    if (isRecordOn) {
      interval = setInterval(() => {
        setRecordTime((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
      setRecordTime(0)
    }

    return () => clearInterval(interval);
  }, [isRecordOn]);

  //Recebe segundos e retorna string no formato MM:SS
  const formatTime = (secs) => {
    const minutes = Math.floor(secs / 60);
    const remainingrecordTime = secs % 60;
    return `${String(minutes).padStart(2, "0")}:${String(remainingrecordTime).padStart(2, "0")}`
  };

  const handleCameraToggle = async (event) => {
    const checked = event.target.checked;

    if (loadingCamera) return;

    if (isRecordOn) {
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

    setLoadingCamera(true);
    setLoadingCameraMessage("Iniciando vídeo...");

    try {
      if (playerRef.current) destroyPlayer()

      firstFrameRenderedRef.current = false;
      const ws_url = recordMode === "rtmp"
        ? `ws://${window.location.hostname}:3001/rtmp-preview?url=${encodeURIComponent(rtmpUrl)}&fps=${encodeURIComponent(rtmpPreviewFps)}`
        : cameraWsUrl

      playerRef.current = new JSMpeg.Player(ws_url, {
        canvas: canvasRef.current,
        autoplay: true,
        audio: false,
        videoBufferSize: 1024 * 1024,
        disableGl: true,

        onVideoDecode: () => {
          if (!firstFrameRenderedRef.current) {
            firstFrameRenderedRef.current = true
            setLoadingCamera(false)
          }
        },
      })

      connectionTimeoutRef.current = setTimeout(() => {
        if (!firstFrameRenderedRef.current) {
          destroyPlayer();
          setLoadingCamera(false)
          setIsCameraOn(false)
          showSnackbar(`Tentativa de conexão ultrapassou o limite de ${TIMEOUT_CONNECTION / 1000}s`, "error")
        }
      }, TIMEOUT_CONNECTION)

    } catch (err) {
      setLoadingCamera(false);
      setIsCameraOn(false);
      showSnackbar("Erro inesperado ocorreu", "error", 6000);
    }
  };

  const handleStopCamera = async () => {
    if (loadingCamera) return;

    setLoadingCamera(true);
    setLoadingCameraMessage("Parando vídeo...");

    try {
      destroyPlayer();
    } finally {
      setLoadingCamera(false);
      setLoadingCameraMessage("");
    }
  };

  const destroyPlayer = () => {

    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
      connectionTimeoutRef.current = null;
    }

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

  const handlePointCloudToggle = async (event) => {
    const checked = event.target.checked;

    if (loadingCamera) return;

    if (!isCameraOn) {
      showSnackbar("Por favor inicie camera para exibir a pointcloud", "warning")
      return
    }

    if(isRecordOn){
      showSnackbar("Por favor encerrer a gravação antes de exibir a pointcloud", "warning")
      return
    }

    //setIsPointCloudOn(checked);

    if (checked)
      await startPointCloud();
    else
      await stopPointCloud();
  };

  const startPointCloud = async() => {
    try {
      setLoadingPointcloud(true)
      setLoadingPointcloudMessage("Iniciando pointcloud...")

      const { status, msg } = await startGeneration(cameraUrl, cameraPort);

      //Give time to 3d recon deep start completely
      await new Promise(resolve => setTimeout(resolve, 5000));

      if (status === "error") setIsPointCloudOn(false)
      showSnackbar(msg, status)

    } catch (err) {
      console.error(err);
      showSnackbar("Erro inesperado ocorreu", "error")
      setIsPointCloudOn(false)
    } finally {
      setLoadingPointcloud(false)
      setIsPointCloudOn(true);
    }
  }

  const stopPointCloud = async() => {
    try {
      setLoadingPointcloud(true)
      setLoadingPointcloudMessage("Encerrando pointcloud...")

      const { status, msg } = await stopGeneration();
      if (status === "error") setIsPointCloudOn(true)
      showSnackbar(msg, status)

    } catch (err) {
      console.error(err);
      showSnackbar("Erro inesperado ocorreu", "error")
      setIsPointCloudOn(true)
    } finally {
      setLoadingPointcloud(false)
      setIsPointCloudOn(false);
    }
  }

  const handleRecordToggle = async (event) => {
    const checked = event.target.checked;

    if (loadingCamera) return;

    setIsRecordOn(checked);

    if (checked)
      await handleStartRecord();
    else
      await handleStopRecord();

  };

  const handleStartRecord = async () => {
    try {
      setLoadingCamera(true);
      setLoadingCameraMessage("Iniciando gravação...");

      const fallbackConfig = {
        wsUrl: cameraWsUrl,
        recordMode: recordMode,
        rtmpUrl: rtmpUrl
      };


      const { status, msg } = await startRecord(fallbackConfig);

      if (status === "error") setIsRecordOn(false)

      showSnackbar(msg, status)

    } catch (err) {
      console.error(err);
      showSnackbar("Erro inesperado ocorreu", "error")
      setIsRecordOn(false)
    } finally {
      setLoadingCamera(false)
    }
  }

  const handleStopRecord = async () => {
    try {
      setLoadingCamera(true);
      setLoadingCameraMessage("Parando gravação...");

      const fallbackConfig = {
        recordMode: recordMode
      };

      const { status, msg } = await stopRecord(fallbackConfig);


      if (status === "error") setIsRecordOn(true)
      showSnackbar(msg, status)

    } catch (err) {
      console.error(err);
      showSnackbar("Erro inesperado ocorreu", "error")
      setIsRecordOn(true)
    } finally {
      setLoadingCamera(false)
    }
  };

  return (
    <Box sx={{ width: "100%", height: "100%", display: "flex", }}>
      <Card sx={{ flex: 1, display: "flex", flexDirection: "column", backgroundColor: "#d9eaff", borderRadius: 0, minHeight: 0 }}>
        <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column", p: 1, minHeight: 0 }}>

          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
            <FormControlLabel
              control={<Switch checked={isCameraOn} onChange={handleCameraToggle} disabled={loadingCamera || loadingPointcloud} />}
              label={isCameraOn ? "Camera ON" : "Camera OFF"}
            />
            <FormControlLabel
              control={<Switch checked={isPointCloudOn} onChange={handlePointCloudToggle} disabled={loadingCamera || loadingPointcloud} />}
              label={isPointCloudOn ? "PointCloud ON" : "PointCloud OFF"}
            />
            <FormControlLabel
              control={<Switch checked={isRecordOn} onChange={handleRecordToggle} disabled={loadingCamera || !isCameraOn} />}
              label={isRecordOn ? "Record ON" : "Record OFF"}
            />

            {isRecordOn && (
              <Typography variant="h5" sx={{ paddingTop: "3px", color: "red" }}>
                {formatTime(recordTime)}
              </Typography>
            )}
            <IconButton onClick={() => setSettingsOpen(true)}>
              <SettingsIcon />
            </IconButton>
          </Stack>

          <Box sx={{flex: 1, display: "flex",gap: 1, minHeight: 0,}}>
            <Box sx={CAMERA_WINDOW_BOX_STYLE}>
              <canvas
                ref={canvasRef}
                width={1280}
                height={720}
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  width: "auto",
                  height: "auto",
                  display: "block",
                  objectFit: "contain",
                }}
              />

              {loadingCamera && (
                 <Box sx={LOADING_BOX_STYLE}>
                  <CircularProgress sx={{ color: "#fff" }} />
                  <Typography sx={{ color: "#fff" }}>
                    {loadingCameraMessage || "Carregando..."}
                  </Typography>
                </Box>
              )}
            </Box>

            <Box sx={CAMERA_WINDOW_BOX_STYLE}>
              <PointCloudWindow 
                isPointCloudOn={isPointCloudOn} 
                wsUrl={pointCloudWsUrl} 
                loading={loadingPointcloud}
                loadingMessage={loadingPointcloudMessage}
              />

              {loadingPointcloud && (
                <Box sx={LOADING_BOX_STYLE}>
                  <CircularProgress sx={{ color: "#fff" }} />
                  <Typography sx={{ color: "#fff" }}>
                    {loadingPointcloudMessage || "Carregando..."}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </Box>
  );
}

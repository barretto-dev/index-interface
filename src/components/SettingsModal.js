import React, { useState, useEffect } from "react";
import { Modal, Box, Typography, Stack, TextField, Button, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel } from "@mui/material";

import { useGlobal } from "../context/GlobalContext";

export default function SettingsModal({ open, onClose }) {
  const [inputCameraUrl, setInputCameraUrl] = useState("");
  const [inputCameraPort, setInputCameraPort] = useState("");
  const [inputDroneApiUrl, setInputDroneApiUrl] = useState("");
  const [inputDroneApiPort, setInputDroneApiPort] = useState("");
  const [inputRecordMode, setInputRecordMode] = useState("live_stream");
  const [inputRtmpUrl, setInputRtmpUrl] = useState("");
  const [inputRtmpPreviewFps, setInputRtmpPreviewFps] = useState("60");


  const { 
    cameraUrl, setCameraUrl,
    cameraPort, setCameraPort,
    droneApiUrl, setDroneApiUrl,
    droneApiPort, setDroneApiPort,
    recordMode, setRecordMode,
    rtmpUrl, setRtmpUrl,
    rtmpPreviewFps, setRtmpPreviewFps } = useGlobal()


    useEffect(() => {
        setInputCameraUrl(cameraUrl)
        setInputCameraPort(cameraPort)
        setInputDroneApiUrl(droneApiUrl)
        setInputDroneApiPort(droneApiPort)
        setInputRecordMode(recordMode)
        setInputRtmpUrl(rtmpUrl)
        setInputRtmpPreviewFps(rtmpPreviewFps)
    }, [open]);


  const handleSave = () => {
    setCameraUrl(inputCameraUrl)
    setCameraPort(inputCameraPort)
    setDroneApiUrl(inputDroneApiUrl)
    setDroneApiPort(inputDroneApiPort)
    setRecordMode(inputRecordMode)
    setRtmpUrl(inputRtmpUrl)
    setRtmpPreviewFps(inputRtmpPreviewFps)
    onClose();

  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 500,
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 24,
          p: 3,
        }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>
          Configurações
        </Typography>

        <Stack spacing={2}>
          <Stack direction="row" spacing={2}>
            <TextField
              label="CameraUrl"
              value={inputCameraUrl}
              onChange={(e) => setInputCameraUrl(e.target.value)}
              fullWidth
            />

            <TextField
              label="CameraPort"
              value={inputCameraPort}
              onChange={(e) => setInputCameraPort(e.target.value)}
              fullWidth
            />
          </Stack>

          <Stack direction="row" spacing={2}>
            <TextField
              label="droneApiUrl"
              value={inputDroneApiUrl}
              onChange={(e) => setInputDroneApiUrl(e.target.value)}
              fullWidth
            />

            <TextField
              label="droneApiPort"
              value={inputDroneApiPort}
              onChange={(e) => setInputDroneApiPort(e.target.value)}
              fullWidth
            />
          </Stack>

          <FormControl>
            <FormLabel>Modo de Gravação</FormLabel>
            <RadioGroup
              row
              value={inputRecordMode}
              onChange={(e) => setInputRecordMode(e.target.value)}
            >
              <FormControlLabel value="api" control={<Radio />} label="API (Drone)" />
              <FormControlLabel value="live_stream" control={<Radio />} label="Live Stream (Fallback)" />
              <FormControlLabel value="rtmp" control={<Radio />} label="RTMP" />
            </RadioGroup>
          </FormControl>

          <TextField
            label="RTMP URL"
            value={inputRtmpUrl}
            onChange={(e) => setInputRtmpUrl(e.target.value)}
            placeholder="rtmp://host/app/stream"
            fullWidth
            disabled={inputRecordMode !== "rtmp"}
          />

          <TextField
            label="RTMP Preview FPS"
            type="number"
            value={inputRtmpPreviewFps}
            onChange={(e) => setInputRtmpPreviewFps(e.target.value)}
            inputProps={{ min: 1, max: 120 }}
            fullWidth
            disabled={inputRecordMode !== "rtmp"}
          />


          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button onClick={onClose}>Cancelar</Button>

            <Button variant="contained" onClick={handleSave}>
              Salvar
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Modal>
  );
}

import React, { useState, useEffect } from "react";
import { Modal, Box, Typography, Stack, TextField, Button } from "@mui/material";
import { useGlobal } from "../context/GlobalContext";

export default function SettingsModal({ open, onClose }) {
  const [inputCameraUrl, setInputCameraUrl] = useState("");
  const [inputCameraPort, setInputCameraPort] = useState("");
  const [inputDroneApiUrl, setInputDroneApiUrl] = useState("");
  const [inputDroneApiPort, setInputDroneApiPort] = useState("");

  const { 
    cameraUrl, setCameraUrl,
    cameraPort, setCameraPort,
    droneApiUrl, setDroneApiUrl,
    droneApiPort, setDroneApiPort } = useGlobal()

    useEffect(() => {
        setInputCameraUrl(cameraUrl)
        setInputCameraPort(cameraPort)
        setInputDroneApiUrl(droneApiUrl)
        setInputDroneApiPort(droneApiPort)
    }, [open]);

  const handleSave = () => {
    setCameraUrl(inputCameraUrl)
    setCameraPort(inputCameraPort)
    setDroneApiUrl(inputDroneApiUrl)
    setDroneApiPort(inputDroneApiPort)
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
import React, { useState } from "react";
import logo from "./assets/logo-cimatec.png";
import './App.css';
import { Button, Stack, Typography, Box, Chip } from "@mui/material";

import { useSnackbar } from "./context/SnackbarContext";
import { useGlobal } from "./context/GlobalContext";

import CameraWindow from "./components/CameraWindow";
import ProcessWindow from "./components/ProcessWindow";
import FolderModal from "./components/FolderModal";

import { downloadAndSaveZip, startPreparetion, stopPreparation } from "./apiRequests/imageReq";
import { startTrain, stopTrain } from "./apiRequests/gaussianSplattingReq";
import { getOutputFolders } from "./apiRequests/outputReq";
import { startSibr } from "./apiRequests/sbirReq";
import CircularProgressWithLabel from "./components/CircularProgressWithLabel";

function App() {

  const ENUM_TERMINAL_TYPES = {
    "prepare-frames": "prepare-frames-stream",
    "start-trainning": "gaussian-train-stream"
  }

  const { showSnackbar } = useSnackbar();
  const { droneApiUrl, droneApiPort, recordMode } = useGlobal()


  const [folderModalOpen, setFolderModalOpen] = useState(false);

  const [loading, setLoading] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadingMessage, setLoadingMessage] = useState("")

  const [terminalType, setTerminalType] = useState(null);
  const [resetTerminal, setResetTerminal] = useState(0);
  const [processEvents, setProcessEvents] = useState([]);

  const addProcessEvent = (status, title, detail = "") => {
    const time = new Date().toLocaleTimeString("pt-BR", { hour12: false });
    setProcessEvents((prev) => [
      ...prev,
      { id: `${Date.now()}-${prev.length}`, time, status, title, detail },
    ]);
  };

  const clearProcessEvents = () => {
    setProcessEvents([]);
  };

  const handleStopProcess = async (termType) => {
    try {

      let status = null
      let msg = null

      if (termType === ENUM_TERMINAL_TYPES["prepare-frames"]) {
        const res = await stopPreparation();
        status = res.status
        msg = res.msg
      } else if (termType === ENUM_TERMINAL_TYPES["start-trainning"]) {
        const res = await stopTrain()
        status = res.status
        msg = res.msg
      } else {
        showSnackbar(`Não foi encontrado terminalType == ${termType}`, "error")
        return
      }

      showSnackbar(msg, status)
      setLoading(false)

    } catch (err) {
      console.error(err);
      showSnackbar("Erro inesperado em na página", "error")
    }
  }

  const getFrames = async () => {
    addProcessEvent(
      "executando",
      "Recebendo frames da camera",
      `POST /images/download-and-save usando http://${droneApiUrl}:${droneApiPort}/api/camera/download-latest`
    );
    const framesRes = await downloadAndSaveZip(droneApiUrl, droneApiPort);
    if (framesRes.status === "error") {
      addProcessEvent("erro", "Falha ao receber frames", framesRes.msg);
      showSnackbar(framesRes.msg, framesRes.status);
      return false
    }
    addProcessEvent("ok", "Frames recebidos", framesRes.msg);
    return true
  }

  const startFramePreparation = async () => {
    addProcessEvent(
      "executando",
      "Preparando frames com COLMAP",
      "POST /images/prepare/start -> python3 convert.py -s /development/frames"
    );
    setResetTerminal((prev) => prev + 1);
    setTerminalType(ENUM_TERMINAL_TYPES["prepare-frames"]);
    const prepareRes = await startPreparetion();

    if (prepareRes.status === "error") {
      addProcessEvent("erro", "Falha no preparo dos frames", prepareRes.msg);
      showSnackbar(prepareRes.msg, prepareRes.status);
      return false
    }
    addProcessEvent("ok", "Preparo dos frames concluido", prepareRes.msg);
    return true
  }

  const startTrainning = async () => {
    addProcessEvent(
      "executando",
      "Treinando Gaussian Splatting",
      "POST /gaussian/train/start -> python3 train.py -s /development/frames/ --iterations 7000 --resolution 2"
    );
    setResetTerminal((prev) => prev + 1);
    setTerminalType(ENUM_TERMINAL_TYPES["start-trainning"]);

    const trainRes = await startTrain();
    if (trainRes.status === "error") {
      addProcessEvent("erro", "Falha no treinamento", trainRes.msg);
      showSnackbar(trainRes.msg, trainRes.status);
      return false
    }
    addProcessEvent("ok", "Treinamento concluido", trainRes.msg);
    return true
  }

  const getNewReconstructionName = async () => {
    addProcessEvent("executando", "Buscando a reconstrução mais recente", "GET /output/folders");
    const folder_list = await getOutputFolders();
    if (folder_list.length === 0) {
      addProcessEvent("erro", "Nenhuma pasta de reconstrução encontrada");
      showSnackbar("Não foi encontrado nenhum pasta de reconstrução", "error");
      return null
    }
    addProcessEvent("ok", "Reconstrução selecionada", folder_list[0].name);
    return folder_list[0].name
  }

  const handleRunFullProcess = async () => {
    try {
      clearProcessEvents()
      addProcessEvent("inicio", "Iniciando nova reconstrução");
      setLoading(true)
      let result;

      if (recordMode === "api") {
        setLoadingProgress(0)
        setLoadingMessage("Recebendo frames...")
        result = await getFrames()
        if (!result) return
      }




      setLoadingProgress(10)
      setLoadingMessage("Preparando frames...")
      result = await startFramePreparation()
      if (!result) return

      setLoadingProgress(40)
      setLoadingMessage("Iniciando treinamento...")
      result = await startTrainning()
      if (!result) return

      setLoadingProgress(90)
      setLoadingMessage("Buscando nova reconstrução...")
      const reconstruction_name = await getNewReconstructionName()
      if (reconstruction_name == null) return

      setLoadingProgress(95)
      setLoadingMessage("Abrindo visualizador...")
      addProcessEvent(
        "executando",
        "Abrindo visualizador SIBR",
        `POST /sibr/start com pasta ${reconstruction_name}`
      );
      const sibrResult = await startSibr(reconstruction_name);
      addProcessEvent("ok", "Visualizador SIBR iniciado", sibrResult);

    } catch (err) {
      console.error(err);
      addProcessEvent("erro", "Erro inesperado na página", err.message);
      showSnackbar("Erro inesperado na página", "error");
    } finally {
      setLoading(false)
      setLoadingMessage("")
      setLoadingProgress(0)
    }
  };

  return (
    <div className="app">

      {/* MENU SUPERIOR */}
      <header className="header">
        <img src={logo} alt="Logo" className="logo-img" />
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <div className="container">

        {/* LADO ESQUERDO */}
        <div className="left">
          <div className="section">
            <CameraWindow />
          </div>
        </div>

        {/* LADO DIREITO */}
        <div className="right">
          <div className="section">
            {
              loading ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: "100%", p: 2, minHeight: 0 }}>
                  <CircularProgressWithLabel value={loadingProgress} size={100} />
                  <Typography variant="h6" component="div" sx={{ mt: "15px", color: 'text.secondary' }}>
                    {loadingMessage}
                  </Typography>
                  <ProcessAuditPanel events={processEvents} />
                </Box>
              ) :
                (
                  <Stack direction="column" spacing={3} sx={{ mb: 1, width: "100%", p: 2, boxSizing: "border-box" }}>
                    <Button variant="contained" onClick={handleRunFullProcess}>
                      Iniciar nova reconstrução
                    </Button>
                    <Button variant="contained" onClick={() => setFolderModalOpen(true)} >
                      Visualizar reconstruções anteriores
                    </Button>
                    <ProcessAuditPanel events={processEvents} />
                  </Stack>
                )
            }
          </div>

          <div className="section">
            <ProcessWindow
              endpoint={terminalType}
              resetKey={resetTerminal}
              stopProccesFunction={handleStopProcess}
            />
          </div>
        </div>
      </div>

      <FolderModal
        open={folderModalOpen}
        onClose={() => setFolderModalOpen(false)}
        onSuccess={(folderName) => { console.log("SIBR iniciado com:", folderName); }}
      />

    </div>
  );
}

function ProcessAuditPanel({ events }) {
  const statusColor = {
    inicio: "info",
    executando: "warning",
    ok: "success",
    erro: "error",
  };

  if (!events.length) {
    return null;
  }

  return (
    <Box
      sx={{
        mt: 2,
        width: "100%",
        maxHeight: 220,
        overflow: "auto",
        backgroundColor: "#f7f9fc",
        border: "1px solid #cfd8e3",
        borderRadius: 1,
        p: 1.5,
        boxSizing: "border-box",
      }}
    >
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
        O que esta acontecendo
      </Typography>
      <Stack spacing={1}>
        {events.map((event) => (
          <Box key={event.id}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                size="small"
                color={statusColor[event.status] || "default"}
                label={event.status}
              />
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {event.time} - {event.title}
              </Typography>
            </Stack>
            {event.detail ? (
              <Typography
                variant="caption"
                component="pre"
                sx={{
                  display: "block",
                  mt: 0.5,
                  mb: 0,
                  ml: 0.5,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  color: "#334155",
                  fontFamily: "monospace",
                }}
              >
                {event.detail}
              </Typography>
            ) : null}
          </Box>
        ))}
      </Stack>
    </Box>
  );
}

export default App;

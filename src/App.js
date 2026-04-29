import React, { useState } from "react";
import logo from "./assets/logo-cimatec.png";
import './App.css';
import {Button, Stack, Typography, Box} from "@mui/material";

import { useSnackbar } from "./context/SnackbarContext";

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
  
  const [folderModalOpen, setFolderModalOpen] = useState(false);

  const [loading, setLoading] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadingMessage, setLoadingMessage] = useState("")

  const [terminalType, setTerminalType] = useState(null); 
  const [resetTerminal, setResetTerminal] = useState(0);

  const handleStopProcess = async (termType) => {
    try {

      let status = null
      let msg = null

      if(termType === ENUM_TERMINAL_TYPES["prepare-frames"]){
        const res = await stopPreparation();
        status = res.status
        msg = res.msg
      }else if(termType === ENUM_TERMINAL_TYPES["start-trainning"]){
        const res = await stopTrain()
        status = res.status
        msg = res.msg
      }else{
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
     const framesRes = await downloadAndSaveZip();
      if(framesRes.status === "error"){
        showSnackbar(framesRes.msg, framesRes.status);
        return false
      }
      return true
  }

  const startFramePreparation = async () => {
    setResetTerminal((prev) => prev + 1);
    setTerminalType(ENUM_TERMINAL_TYPES["prepare-frames"]);
    const prepareRes = await startPreparetion();

    if(prepareRes.status === "error"){
      showSnackbar(prepareRes.msg, prepareRes.status);
      return false
    }
    return true
  }

  const startTrainning = async () => {
    setResetTerminal((prev) => prev + 1);
    setTerminalType(ENUM_TERMINAL_TYPES["start-trainning"]);

    const trainRes = await startTrain();
    if(trainRes.status === "error"){
      showSnackbar(trainRes.msg, trainRes.status);
      return false
    }
    return true
  }

  const getNewReconstructionName = async () => {
    const folder_list = await getOutputFolders();
    if(folder_list.length === 0){
      showSnackbar("Não foi encontrado nenhum pasta de reconstrução", "error");
      return null
    }
    return folder_list[0].name
  }

  const handleRunFullProcess = async () => {
    try {
      setLoading(true)

      setLoadingProgress(0)
      setLoadingMessage("Recebendo frames...")
      let result = await getFrames()
      if (!result) return

      
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
      await startSibr(reconstruction_name);

    } catch (err) {
      console.error(err);
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
            <CameraWindow/>
          </div>
        </div>

        {/* LADO DIREITO */}
        <div className="right">
          <div className="section">
              {
                loading ? ( 
                  <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center',}}>
                    <CircularProgressWithLabel value={loadingProgress} size={100}/>
                    <Typography variant="h6" component="div" sx={{ mt:"15px", color: 'text.secondary' }}>
                      {loadingMessage}
                    </Typography>
                  </Box>
                ) :
                (
                  <Stack direction="column" spacing={3} sx={{ mb: 1 }}>
                    <Button variant="contained" onClick={handleRunFullProcess}>
                      Iniciar nova reconstrução
                    </Button>
                    <Button variant="contained" onClick={() => setFolderModalOpen(true)} >
                      Visualizar reconstruções anteriores
                    </Button>
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
        onSuccess={(folderName) => {console.log("SIBR iniciado com:", folderName);}}
      />

    </div>
  );
}

export default App;

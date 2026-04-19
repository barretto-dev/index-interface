import React, { useState } from "react";
import logo from "./assets/logo-cimatec.png";
import { downloadAndSaveZip, prepare } from "./apiRequests/image";
import { startTrain } from "./apiRequests/gaussianSplatting";
import './App.css';
import {Button, Stack, CircularProgress} from "@mui/material";

import { useSnackbar } from "./context/SnackbarContext";

import CameraWindow from "./components/CameraWindow";
import TrainTerminal from "./components/TrainTerminal";
import FolderModal from "./components/FolderModal";
import ConfirmModal from "./components/ConfirmModal";

function App() {

  const { showSnackbar } = useSnackbar();
  
  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  const [confirmModalTitle, setConfirmModalTitle] = useState("")
  const [confirmModalMessage, setConfirmModalMessage] = useState("")
  const [confirmModalAction, setConfirmModalAction] = useState(null)

  const [loadingGetFrames, setLoadingGetFrames] = useState(false)
  const [loadingPrepareFrames, setLoadingPrepareFrames] = useState(false)
  const [loadingTrainFrames, setLoadingTrainFrames] = useState(false)

  const [terminalType, setTerminalType] = useState(null);
  const [resetTerminal, setResetTerminal] = useState(0);

  const disableMenuButtons = loadingGetFrames || loadingPrepareFrames || loadingTrainFrames

  const handleGetFrames = async () => {
    try {
      setLoadingGetFrames(true)
      const {status, msg} = await downloadAndSaveZip();
      showSnackbar(msg, status)
    } catch (err) {
      console.error(err);
      showSnackbar("Erro inesperado em na página", "error")
    }finally{
      setLoadingGetFrames(false)
    }
  };

  const handlePrepareFrames = async () => {
    try {
      setLoadingPrepareFrames(true)

      setResetTerminal((prev) => prev + 1);
      setTerminalType("colmap-stream")

      const {status, msg} = await prepare();
      showSnackbar(msg, status)

    } catch (err) {
      console.error(err);
      showSnackbar("Erro inesperado em na página", "error")
    }finally{
      setLoadingPrepareFrames(false)
    }
  };

  const handleConfirmModalOpen = (title, message, action) => {
      setConfirmModalTitle(title)
      setConfirmModalMessage(message)
      setConfirmModalAction(() => action)
      setConfirmModalOpen(true)
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
             <Stack direction="column" spacing={3} sx={{ mb: 1 }}>
                <Button 
                  variant="contained" 
                  onClick={handleGetFrames} 
                  disabled={disableMenuButtons}
                  endIcon={
                    loadingGetFrames ? <CircularProgress size={18} color="inherit" /> : null
                  }
                >
                  Receber Frames
                </Button>
                <Button 
                  variant="contained" 
                  onClick={handlePrepareFrames}
                  disabled={disableMenuButtons}
                  endIcon={
                    loadingPrepareFrames ? <CircularProgress size={18} color="inherit" /> : null
                  }
                >
                  Preparar Frames
                </Button>
                <Button 
                  variant="contained"
                  disabled={disableMenuButtons}
                  onClick={() =>{handleConfirmModalOpen(
                    "Iniciando treinamento", 
                    "Tem Certeza que deseja continuar?",
                    async () => { await startTrain();}
                  )}}
                >
                  Iniciar Treinamento
                </Button>
                <Button 
                  variant="contained" 
                  disabled={disableMenuButtons}
                  onClick={() => setFolderModalOpen(true)}
                >
                  Vizualizar
                </Button>
             </Stack>
          </div>

          <div className="section">
            <TrainTerminal endpoint={terminalType} resetKey={resetTerminal}/>
          </div>
        </div>
      </div>
      
      <FolderModal
        open={folderModalOpen}
        onClose={() => setFolderModalOpen(false)}
        onSuccess={(folderName) => {
          console.log("SIBR iniciado com:", folderName);
        }}
      />

      <ConfirmModal
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={confirmModalAction}
        title={confirmModalTitle}
        message={confirmModalMessage}
      />

    </div>
  );
}

export default App;
